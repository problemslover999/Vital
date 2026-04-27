import React from 'react';
import { Plus } from 'lucide-react';
import { UserGoal } from '../../types';

interface GoalTrackerProps {
  goal: UserGoal;
  onUpdate: (increment: number) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({ goal, onUpdate }) => {
  const progress = Math.min(100, (goal.current / goal.target) * 100);
  
  return (
    <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{goal.type}</p>
          <h4 className="text-xl font-black italic uppercase tracking-tighter">{goal.current} / {goal.target} {goal.unit}</h4>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onUpdate(-1)}
            className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-colors font-black"
          >
            -
          </button>
          <button 
            onClick={() => onUpdate(1)}
            className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="w-full h-4 bg-black/5 rounded-full border-2 border-black overflow-hidden p-0.5">
        <div 
          className="h-full bg-vibrant-sun rounded-full border-r-2 border-black transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
