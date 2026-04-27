import React from 'react';
import { motion } from 'motion/react';
import { Heart, Zap, Droplets, Calendar } from 'lucide-react';
import { VitalityCard } from './VitalityCard';
import { GoalTracker } from './GoalTracker';
import { CategoryCard } from './CategoryCard';
import { RoutineItem } from '../routines/RoutineItem';
import { Routine, UserGoal, UserProfile } from '../../types';

interface DashboardProps {
  user: any;
  routines: Routine[];
  goals: UserGoal[];
  profile: UserProfile | null;
  vitalityScore: number;
  motivation: string;
  onToggleRoutine: (id: string) => void;
  onUpdateGoal: (type: any, inc: number) => void;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  routines,
  goals,
  profile,
  vitalityScore,
  motivation,
  onToggleRoutine,
  onUpdateGoal,
  setActiveTab
}) => {
  const completionRate = routines.length > 0 
    ? Math.round((routines.filter(r => r.completed).length / routines.length) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#141414]/60">Your Morning Vibe</span>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mt-1">
            {user?.displayName?.split(' ')[0] || 'VITAL'}.
          </h1>
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

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black italic tracking-tight">System Status</h3>
        </div>
        <VitalityCard 
          score={vitalityScore} 
          level={profile?.level || 1} 
          experience={profile?.experience || 0} 
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black italic tracking-tight">Active Objectives</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
            Live Sync
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map(goal => (
            <GoalTracker 
              key={goal.type} 
              goal={goal} 
              onUpdate={(inc) => onUpdateGoal(goal.type, inc)} 
            />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <CategoryCard icon={<Droplets />} title="Vigor" count={routines.filter(r => r.category === 'physical').length} color="bg-vibrant-sky" />
        <CategoryCard icon={<Zap />} title="Zen" count={routines.filter(r => r.category === 'mental').length} color="bg-vibrant-sun" />
        <CategoryCard icon={<Heart />} title="Fuel" count={routines.filter(r => r.category === 'nutrition').length} color="bg-vibrant-coral" />
        <CategoryCard icon={<Calendar />} title="Habit" count={routines.filter(r => r.category === 'habit').length} color="bg-vibrant-mint" />
      </div>

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
              onToggle={() => onToggleRoutine(routine.id)} 
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
};
