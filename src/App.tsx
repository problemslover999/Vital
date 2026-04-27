import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  CheckCircle2, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Plus, 
  Droplets, 
  Zap, 
  Moon, 
  Dumbbell,
  Search,
  LayoutDashboard,
  Calendar,
  LogIn,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Routine, Message, UserProgress } from '@/src/types';
import { getMotivationalMessage, chatWithBuddy, getHealthReport } from '@/src/services/buddyService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { auth, signInWithGoogle, logout } from '@/src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  ensureUserProfile, 
  saveRoutine, 
  subscribeToRoutines, 
  saveProgress, 
  fetchProgressHistory, 
  saveChatMessage, 
  subscribeToMessages 
} from '@/src/services/firestoreService';

// Mock/Initial Data
const DEFAULT_ROUTINES: Routine[] = [
  { id: '1', title: 'Water Intake', description: 'Drink 2L of water', category: 'nutrition', frequency: 'daily', completed: false, streak: 5 },
  { id: '2', title: 'Morning Stretch', description: '10 mins of light stretching', category: 'physical', frequency: 'daily', completed: false, streak: 3 },
  { id: '3', title: 'Deep Work', description: '90 mins of focused work', category: 'habit', frequency: 'daily', completed: false, streak: 12 },
  { id: '4', title: 'Sleep Early', description: 'In bed before 11 PM', category: 'physical', frequency: 'daily', completed: false, streak: 2 },
  { id: '5', title: 'Meditation', description: '5 mins of mindfulness', category: 'mental', frequency: 'daily', completed: false, streak: 7 },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'buddy' | 'stats'>('dashboard');
  const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
  const [motivation, setMotivation] = useState<string>('');
  const [isBuddyTyping, setIsBuddyTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm Vital Buddy. How can I help you focus on your health today?", timestamp: Date.now() }
  ]);
  const [progressData, setProgressData] = useState<UserProgress[]>([
    { date: 'Mon', completionRate: 0 },
    { date: 'Tue', completionRate: 0 },
    { date: 'Wed', completionRate: 0 },
    { date: 'Thu', completionRate: 0 },
    { date: 'Fri', completionRate: 0 },
    { date: 'Sat', completionRate: 0 },
    { date: 'Sun', completionRate: 0 },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setAuthLoading(false);
      if (user) {
        await ensureUserProfile();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeRoutines = subscribeToRoutines((data) => {
      if (data.length > 0) {
        setRoutines(data);
      } else {
        // Init default routines for new user in Firestore
        DEFAULT_ROUTINES.forEach(r => saveRoutine(r));
      }
    });

    const unsubscribeMessages = subscribeToMessages((data) => {
      if (data.length > 0) {
        setChatMessages(data);
      }
    });

    const loadProgress = async () => {
      const data = await fetchProgressHistory();
      if (data.length > 0) setProgressData(data);
    };
    loadProgress();

    return () => {
      unsubscribeRoutines();
      unsubscribeMessages();
    };
  }, [user]);

  useEffect(() => {
    const fetchMotivation = async () => {
      const msg = await getMotivationalMessage(user?.displayName || "friend");
      setMotivation(msg);
    };
    if (!motivation && user) fetchMotivation();
  }, [motivation, user]);

  const toggleRoutine = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;

    const updated = { 
      ...routine, 
      completed: !routine.completed, 
      streak: !routine.completed ? routine.streak + 1 : Math.max(0, routine.streak - 1) 
    };
    
    // Optimistic update
    setRoutines(prev => prev.map(r => r.id === id ? updated : r));
    await saveRoutine(updated);

    // Update progress stats for today
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const currentRoutines = routines.map(r => r.id === id ? updated : r);
    const newCompletionRate = Math.round((currentRoutines.filter(r => r.completed).length / currentRoutines.length) * 100);
    
    const progress: UserProgress = { date: today, completionRate: newCompletionRate };
    await saveProgress(progress);
    // Don't just set local state, we'll re-fetch if needed or just sync
  };

  const handleAddRoutine = async () => {
    const title = prompt("Enter mission title:");
    if (!title) return;
    
    const newRoutine: Routine = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description: "Custom user-defined mission",
      category: 'habit',
      frequency: 'daily',
      completed: false,
      streak: 0
    };
    
    await saveRoutine(newRoutine);
  };

  const handleDeleteRoutine = async (id: string) => {
    if (confirm("Abort this mission?")) {
      await deleteRoutine(id);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats' && user) {
      const loadHistory = async () => {
        const history = await fetchProgressHistory();
        if (history.length > 0) setProgressData(history);
      };
      loadHistory();
    }
  }, [activeTab, user]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user) return;
    
    const newUserMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    await saveChatMessage(newUserMsg);
    
    setIsBuddyTyping(true);
    const response = await chatWithBuddy([...chatMessages, newUserMsg]);
    
    const newAiMsg: Message = { role: 'model', content: response, timestamp: Date.now() };
    await saveChatMessage(newAiMsg);
    setIsBuddyTyping(false);
  };

  const handleLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        // Expected if user cancels, no need for major error UI
        console.log("Login cancelled/interrupted");
      } else {
        console.error("Login failed", error);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vibrant-bg">
        <div className="w-16 h-16 border-4 border-black border-t-vibrant-sun rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-vibrant-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 buddy-gradient border-4 border-black rounded-full flex items-center justify-center vibrant-shadow mb-8">
          <span className="text-white font-black text-5xl italic tracking-tighter">V</span>
        </div>
        <h1 className="text-6xl font-black italic tracking-tighter mb-4">VITAL.</h1>
        <p className="text-xl font-bold opacity-60 mb-12 max-w-md">Your personalized journey to peak performance starts here.</p>
        <button 
          onClick={handleLogin}
          disabled={loginLoading}
          className={cn(
            "flex items-center gap-4 bg-black text-white px-8 py-5 rounded-[2rem] font-black text-xl italic tracking-tight vibrant-shadow hover:scale-105 active:scale-95 transition-all",
            loginLoading && "opacity-50 cursor-not-allowed scale-95 shadow-none"
          )}
        >
          {loginLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogIn size={24} />
          )}
          {loginLoading ? 'CONNECTING...' : 'LOGIN WITH GOOGLE'}
        </button>
        <div className="mt-8 p-4 bg-white/50 border-2 border-black/10 rounded-2xl max-w-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40 leading-relaxed">
            Note: If the popup doesn't appear, please allow popups in your browser and ensure your App URL is authorized in the Firebase Console.
          </p>
        </div>
      </div>
    );
  }

  const completionRate = Math.round((routines.filter(r => r.completed).length / routines.length) * 100);

  return (
    <div className="min-h-screen text-[#141414] font-sans selection:bg-yellow-400">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:top-0 md:left-0 md:bottom-0 md:w-24 md:py-8 md:px-0 bg-transparent pointer-events-none">
        <div className="flex w-full items-center justify-around rounded-3xl bg-white border-3 border-black p-2 shadow-[4px_4px_0px_#000] pointer-events-auto md:h-full md:flex-col md:justify-start md:gap-8 lg:p-4">
          <div className="hidden md:flex mb-4 w-12 h-12 buddy-gradient border-3 border-black rounded-full items-center justify-center vibrant-shadow-sm">
             <span className="text-white font-black text-xl italic tracking-tighter">V</span>
          </div>
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={24} />} 
            label="Home"
          />
          <NavItem 
            active={activeTab === 'routines'} 
            onClick={() => setActiveTab('routines')} 
            icon={<CheckCircle2 size={24} />} 
            label="Routines"
          />
          <NavItem 
            active={activeTab === 'buddy'} 
            onClick={() => setActiveTab('buddy')} 
            icon={<MessageSquare size={24} />} 
            label="Buddy"
          />
          <NavItem 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
            icon={<BarChart3 size={24} />} 
            label="Stats"
          />
          <div className="hidden md:mt-auto md:flex flex-col gap-4">
             <NavItem 
              active={false} 
              onClick={() => logout()} 
              icon={<LogOut size={24} />} 
              label="Logout"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-24 md:pb-8 md:pl-28 lg:pl-32 max-w-7xl mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-10"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 buddy-gradient border-4 border-black rounded-full flex items-center justify-center vibrant-shadow md:hidden">
                    <span className="text-white font-black text-3xl italic tracking-tighter">V</span>
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#141414]/60">Your Morning Vibe</span>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mt-1">{user?.displayName?.split(' ')[0] || 'VITAL'}.</h1>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-5 border-3 border-black rounded-[2rem] vibrant-shadow-sm">
                   <div className="w-14 h-14 rounded-full bg-vibrant-sun border-3 border-black flex items-center justify-center font-black text-lg">
                    {completionRate}%
                   </div>
                   <div>
                    <p className="text-sm font-black uppercase tracking-tight">Today's Pulse</p>
                    <p className="text-xs font-bold opacity-60"> {routines.filter(r => r.completed).length}/{routines.length} streaks active</p>
                   </div>
                </div>
              </header>

              {/* Motivational Card */}
              <div className="relative overflow-hidden bg-vibrant-mint border-3 border-black rounded-[2.5rem] p-10 md:p-14 vibrant-shadow">
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2 mb-8 bg-black text-white w-fit px-4 py-1 rounded-full border-2 border-black">
                    <Zap className="text-vibrant-sun fill-vibrant-sun" size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Momentum</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.9]">
                    {motivation || "Looking for inspiration..."}
                  </h2>
                </div>
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                  <Heart size={200} strokeWidth={2} fill="black" />
                </div>
              </div>

              {/* Quick Actions / Categories */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <CategoryCard icon={<Droplets />} title="Vigor" count={routines.filter(r => r.category === 'physical').length} color="bg-vibrant-sky" />
                <CategoryCard icon={<Zap />} title="Zen" count={routines.filter(r => r.category === 'mental').length} color="bg-vibrant-sun" />
                <CategoryCard icon={<Heart />} title="Fuel" count={routines.filter(r => r.category === 'nutrition').length} color="bg-vibrant-coral" />
                <CategoryCard icon={<Calendar />} title="Habit" count={routines.filter(r => r.category === 'habit').length} color="bg-vibrant-mint" />
              </div>

              {/* Mini Routine List */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black italic tracking-tight">Today's Missions</h3>
                  <button 
                    onClick={() => setActiveTab('routines')}
                    className="text-sm font-black border-b-3 border-black pb-0.5 hover:opacity-70 transition-opacity"
                  >
                    VIEW ALL
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {routines.slice(0, 4).map(routine => (
                    <RoutineItem 
                      key={routine.id} 
                      routine={routine} 
                      onToggle={() => toggleRoutine(routine.id)} 
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'routines' && (
             <motion.div
              key="routines"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
               <header>
                  <h1 className="text-6xl font-black italic tracking-tighter">ROUTINES.</h1>
                  <p className="text-lg font-bold opacity-60 mt-2 uppercase tracking-wide">3 / 5 TASKS COMPLETED</p>
               </header>

               <div className="space-y-6">
                  {routines.map(routine => (
                    <RoutineItem 
                      key={routine.id} 
                      routine={routine} 
                      showDetailed 
                      onToggle={() => toggleRoutine(routine.id)} 
                      onDelete={() => handleDeleteRoutine(routine.id)}
                    />
                  ))}
                  <button 
                    onClick={handleAddRoutine}
                    className="w-full py-8 border-4 border-dashed border-black/20 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-white transition-all hover:border-black group active:scale-[0.98]"
                  >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                    <span className="font-black text-xl italic tracking-tight">ADD NEW MISSION</span>
                  </button>
               </div>
            </motion.div>
          )}

          {activeTab === 'buddy' && (
            <motion.div
              key="buddy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-[calc(100vh-160px)] md:h-[calc(100vh-80px)] flex flex-col bg-white border-4 border-black rounded-[2.5rem] vibrant-shadow overflow-hidden"
            >
              <div className="p-8 border-b-4 border-black flex items-center justify-between bg-vibrant-coral">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white border-3 border-black flex items-center justify-center relative shadow-[2px_2px_0px_#000]">
                    <Zap size={28} className="text-vibrant-sun fill-vibrant-sun" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic leading-none tracking-tight">VITAL BUDDY</h3>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] mt-1 text-white">HEALTH ADVISOR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full border-2 border-black">
                  <div className="w-2 h-2 rounded-full bg-vibrant-mint" />
                  <span className="text-[10px] font-black uppercase">Active</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-vibrant-bg">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] md:max-w-[70%] p-6 border-3 border-black rounded-3xl text-sm font-medium leading-relaxed vibrant-shadow-sm",
                      msg.role === 'user' 
                        ? "bg-black text-white rounded-tr-none" 
                        : "bg-white text-[#141414] rounded-tl-none"
                    )}>
                      {msg.role === 'model' ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isBuddyTyping && (
                   <div className="flex justify-start">
                    <div className="bg-white border-3 border-black px-5 py-3 rounded-[1.5rem] flex gap-2 vibrant-shadow-sm">
                      <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white border-t-4 border-black">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('msg') as HTMLInputElement;
                    handleSendMessage(input.value);
                    input.value = '';
                  }}
                  className="relative"
                >
                  <input 
                    name="msg"
                    placeholder="WANT SOME INTEL? ASK ME..."
                    className="w-full py-5 pl-8 pr-20 bg-vibrant-bg rounded-2xl border-3 border-black focus:outline-none focus:ring-4 focus:ring-vibrant-sun/30 transition-all text-sm font-black uppercase italic tracking-tight"
                  />
                  <button 
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 border-black"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
               <header>
                  <h1 className="text-6xl font-black italic tracking-tighter">PROGRESS.</h1>
                  <p className="text-lg font-bold opacity-60 mt-2 uppercase tracking-wide">Visualize your dominance.</p>
               </header>

               <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0px_#000]">
                    <h3 className="font-black text-xl italic mb-8 flex items-center gap-3">
                       <BarChart3 size={24} />
                       WEEKLY CONSISTENCY
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={progressData}>
                          <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#000" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={{ stroke: '#000', strokeWidth: 2 }} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 800, fill: '#000' }} 
                            dy={10}
                          />
                          <YAxis 
                             axisLine={{ stroke: '#000', strokeWidth: 2 }} 
                             tickLine={false} 
                             tick={{ fontSize: 12, fontWeight: 800, fill: '#000' }}
                             unit="%"
                           />
                          <Tooltip 
                            contentStyle={{ borderRadius: '1rem', border: '3px solid #000', boxShadow: '4px 4px 0px #000', fontWeight: 'bold' }}
                          />
                          <Area 
                            type="stepAfter" 
                            dataKey="completionRate" 
                            stroke="#000" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorRate)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-black text-white p-10 border-4 border-black rounded-[2.5rem] vibrant-shadow">
                      <h4 className="text-xs uppercase tracking-[0.3em] font-black opacity-60 mb-3">ELITE STREAK</h4>
                      <p className="text-7xl font-black italic leading-none">12D</p>
                      <p className="text-sm mt-6 font-bold uppercase tracking-tight opacity-70">Focus on "Deep Work" to expand.</p>
                    </div>

                    <div className="bg-vibrant-sun p-10 border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000]">
                      <h4 className="font-black text-xl italic mb-4 uppercase tracking-tight">VITAL INTEL</h4>
                      <div className="text-sm font-bold leading-relaxed italic">
                        "Your hydration levels are peaking! You're operating at 110% capacity compared to peers."
                      </div>
                      <div className="mt-8 flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white border-3 border-black" />)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/60">+1.2k Vitalizers active</span>
                      </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group",
        active ? "text-black" : "text-black/40 hover:text-black"
      )}
    >
      <div className={cn(
        "p-2 md:p-3 rounded-2xl transition-all duration-300 border-3 border-transparent",
        active ? "bg-vibrant-sun border-black shadow-[2px_2px_0px_#000]" : "group-hover:bg-black/5"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-tight transition-all",
        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-black rounded-full hidden md:block"
        />
      )}
    </button>
  );
}

function CategoryCard({ icon, title, count, color }: { icon: React.ReactNode, title: string, count: number, color: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("p-8 border-4 border-black rounded-[2rem] vibrant-shadow bg-white")}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl border-3 border-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000]", color
      )}>
        {icon}
      </div>
      <h4 className="font-black text-xl italic italic tracking-tighter uppercase">{title}</h4>
      <p className="text-xs font-black opacity-40 uppercase mt-1 tracking-widest">{count} ACTIVE</p>
    </motion.div>
  );
}

function RoutineItem({ routine, showDetailed, onToggle, onDelete }: { routine: Routine, showDetailed?: boolean, onToggle: () => void, onDelete?: () => void }) {
  const Icon = routine.category === 'physical' ? Dumbbell : routine.category === 'nutrition' ? Droplets : routine.category === 'mental' ? Moon : Zap;

  return (
    <div className="relative group/item w-full">
      <div 
        className={cn(
          "p-6 border-4 border-black rounded-[2rem] shadow-[4px_4px_0px_#000] transition-all flex items-center gap-6 group cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none",
          routine.completed ? "bg-vibrant-mint/30" : "bg-white hover:bg-vibrant-bg"
        )}
        onClick={onToggle}
      >
        <div className={cn(
          "w-16 h-16 rounded-[1.25rem] border-3 border-black flex items-center justify-center transition-all shadow-[2px_2px_0px_#000]",
          routine.completed ? "bg-black text-white" : "bg-white text-black group-hover:bg-vibrant-sun"
        )}>
          {routine.completed ? <CheckCircle2 size={32} strokeWidth={3} /> : <Icon size={32} strokeWidth={2.5} />}
        </div>
        <div className="flex-1">
          <h4 className={cn("text-xl font-black italic tracking-tighter uppercase transition-all leading-tight", routine.completed && "line-through opacity-40")}>{routine.title}</h4>
          <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50">{routine.description}</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black italic block">x{routine.streak}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-black">STREAK</span>
        </div>
      </div>
      
      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -right-2 -top-2 w-10 h-10 bg-vibrant-coral border-3 border-black rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity hover:scale-110 active:scale-90 vibrant-shadow-sm z-20"
        >
          <Plus size={20} className="rotate-45" />
        </button>
      )}
    </div>
  );
}
