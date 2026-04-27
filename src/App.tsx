import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';

// Services
import { auth, logout } from '@/src/lib/firebase';
import { 
  ensureUserProfile, 
  saveRoutine, 
  subscribeToRoutines, 
  saveProgress, 
  fetchProgressHistory, 
  saveChatMessage, 
  subscribeToMessages,
  subscribeToGoals,
  saveGoal,
  fetchLastInsight,
  saveInsight,
  fetchProfile,
  saveProfile,
  deleteRoutine
} from '@/src/services/firestoreService';
import { 
  getMotivationalMessage, 
  chatWithBuddy, 
  getHealthReport 
} from '@/src/services/buddyService';
import { 
  calculateVitalityScore, 
  calculateExperienceGained, 
  formatProgressDate 
} from '@/src/services/vitalityEngine';

// Components
import { Navbar } from '@/src/components/layout/Navbar';
import { Dashboard } from '@/src/components/dashboard/Dashboard';
import { RoutinesView } from '@/src/components/routines/RoutinesView';
import { BuddyChat } from '@/src/components/buddy/BuddyChat';
import { StatsView } from '@/src/components/stats/StatsView';
import { ProfileView } from '@/src/components/profile/ProfileView';

// Types
import { Routine, Message, UserProgress, UserGoal, HealthInsight, UserProfile } from '@/src/types';

const DEFAULT_ROUTINES: Routine[] = [
  { id: '1', title: 'Water Intake', description: 'Drink 2L of water', category: 'nutrition', frequency: 'daily', completed: false, streak: 5 },
  { id: '2', title: 'Morning Stretch', description: '10 mins of light stretching', category: 'physical', frequency: 'daily', completed: false, streak: 3 },
  { id: '3', title: 'Deep Work', description: '90 mins of focused work', category: 'habit', frequency: 'daily', completed: false, streak: 12 },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'buddy' | 'stats' | 'profile'>('dashboard');
  
  // Data State
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lastInsight, setLastInsight] = useState<HealthInsight | null>(null);
  const [progressData, setProgressData] = useState<UserProgress[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  
  // UI State
  const [motivation, setMotivation] = useState<string>('');
  const [isBuddyTyping, setIsBuddyTyping] = useState(false);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) await ensureUserProfile();
    });
    return () => unsubscribe();
  }, []);

  // Data Subscriptions Effect
  useEffect(() => {
    if (!user) return;

    const unsubRoutines = subscribeToRoutines((data) => {
      if (data.length > 0) setRoutines(data);
      else DEFAULT_ROUTINES.forEach(r => saveRoutine(r));
    });

    const unsubMessages = subscribeToMessages((data) => {
      if (data.length > 0) setChatMessages(data);
    });

    const unsubGoals = subscribeToGoals((data) => {
      if (data.length > 0) setGoals(data);
      else {
        const defaultGoals: UserGoal[] = [
          { type: 'water', target: 8, current: 0, unit: 'glasses' },
          { type: 'steps', target: 10000, current: 0, unit: 'steps' }
        ];
        defaultGoals.forEach(g => saveGoal(g));
      }
    });

    const loadAsyncData = async () => {
      const history = await fetchProgressHistory();
      setProgressData(history);
      setLastInsight(await fetchLastInsight());
      setProfile(await fetchProfile());
    };
    loadAsyncData();

    return () => {
      unsubRoutines();
      unsubMessages();
      unsubGoals();
    };
  }, [user]);

  // Motivation Effect
  useEffect(() => {
    if (user && !motivation) {
      getMotivationalMessage(user.displayName || "friend").then(setMotivation);
    }
  }, [user, motivation]);

  // Handlers
  const handleToggleRoutine = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;

    const updated = { 
      ...routine, 
      completed: !routine.completed, 
      streak: !routine.completed ? routine.streak + 1 : Math.max(0, routine.streak - 1) 
    };
    
    await saveRoutine(updated);

    // Update Progress & XP
    const currentRoutines = routines.map(r => r.id === id ? updated : r);
    const completionRate = Math.round((currentRoutines.filter(r => r.completed).length / currentRoutines.length) * 100);
    const xpGained = calculateExperienceGained(currentRoutines, goals);
    
    await saveProgress({ date: formatProgressDate(), completionRate }, xpGained);
    
    // Refresh local stats/profile
    setProgressData(await fetchProgressHistory());
    setProfile(await fetchProfile());
  };

  const handleUpdateGoal = async (type: UserGoal['type'], increment: number) => {
    const goal = goals.find(g => g.type === type);
    if (!goal) return;

    const updated = { ...goal, current: Math.max(0, goal.current + increment) };
    await saveGoal(updated);
    
    const xpGained = calculateExperienceGained(routines, goals.map(g => g.type === type ? updated : g));
    await saveProgress({ date: formatProgressDate(), completionRate: Math.round((routines.filter(r => r.completed).length / routines.length) * 100) }, xpGained);
    setProfile(await fetchProfile());
  };

  const handleAddRoutine = async () => {
    const title = prompt("Enter mission title:");
    if (!title) return;
    const category = prompt("Enter category (physical, mental, nutrition, habit):", "habit") as Routine['category'];
    const newRoutine: Routine = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description: `Custom ${category} mission`,
      category: ['physical', 'mental', 'nutrition', 'habit'].includes(category) ? category : 'habit',
      frequency: 'daily',
      completed: false,
      streak: 0
    };
    await saveRoutine(newRoutine);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user) return;
    const newUserMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    await saveChatMessage(newUserMsg);
    setIsBuddyTyping(true);
    const response = await chatWithBuddy([...chatMessages, newUserMsg]);
    await saveChatMessage({ role: 'model', content: response, timestamp: Date.now() });
    setIsBuddyTyping(false);
  };

  const handleGenerateInsight = async () => {
    const statsString = progressData.map(h => `${h.date}: ${h.completionRate}%`).join(', ');
    const report = await getHealthReport(statsString);
    const newInsight: HealthInsight = { content: report, timestamp: Date.now(), category: 'user_requested' };
    await saveInsight(newInsight);
    setLastInsight(newInsight);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vibrant-bg">
        <div className="w-16 h-16 border-4 border-black border-t-vibrant-sun rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const vitalityScore = calculateVitalityScore(routines, goals);

  return (
    <div className="min-h-screen text-[#141414] font-sans selection:bg-yellow-400">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pb-24 md:pb-8 md:pl-28 lg:pl-32 max-w-7xl mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              routines={routines} 
              goals={goals} 
              profile={profile}
              vitalityScore={vitalityScore}
              motivation={motivation}
              onToggleRoutine={handleToggleRoutine}
              onUpdateGoal={handleUpdateGoal}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'routines' && (
            <RoutinesView 
              routines={routines}
              onToggleRoutine={handleToggleRoutine}
              onDeleteRoutine={deleteRoutine}
              onAddRoutine={handleAddRoutine}
            />
          )}
          {activeTab === 'buddy' && (
            <BuddyChat 
              chatMessages={chatMessages}
              isBuddyTyping={isBuddyTyping}
              onSendMessage={handleSendMessage}
            />
          )}
          {activeTab === 'stats' && (
            <StatsView 
              progressData={progressData}
              lastInsight={lastInsight}
              onGenerateReport={handleGenerateInsight}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView 
              user={user}
              profile={profile}
              onSaveProfile={saveProfile}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function LoginView() {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const { signInWithGoogle } = await import('@/src/lib/firebase');
    try { await signInWithGoogle(); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-vibrant-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 buddy-gradient border-4 border-black rounded-full flex items-center justify-center vibrant-shadow mb-8">
        <span className="text-white font-black text-5xl italic tracking-tighter">V</span>
      </div>
      <h1 className="text-6xl font-black italic tracking-tighter mb-4">VITAL.</h1>
      <p className="text-xl font-bold opacity-60 mb-12 max-w-md">Your personalized journey to peak performance starts here.</p>
      <button 
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-4 bg-black text-white px-8 py-5 rounded-[2rem] font-black text-xl italic tracking-tight vibrant-shadow hover:scale-105 active:scale-95 transition-all"
      >
        {loading ? "CONNECTING..." : "LOGIN WITH GOOGLE"}
      </button>
    </div>
  );
}
