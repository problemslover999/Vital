import React from 'react';
import { CheckCircle2, Trash2, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Routine } from '../../types';

interface RoutineItemProps {
  routine: Routine;
  onToggle: () => void;
  onDelete?: () => void;
  showDetailed?: boolean;
}

export const RoutineItem: React.FC<RoutineItemProps> = ({ routine, onToggle, onDelete, showDetailed }) => {
  const categoryColors = {
    physical: 'bg-vibrant-sky',
    mental: 'bg-vibrant-sun',
    nutrition: 'bg-vibrant-coral',
    habit: 'bg-vibrant-mint'
  };

  return (
    <div className={cn(
      "p-6 border-3 border-black rounded-[2rem] flex items-center justify-between transition-all vibrant-shadow-sm",
      routine.completed ? "bg-black/5 opacity-70" : "bg-white"
    )}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggle}
          className={cn(
            "w-12 h-12 rounded-2xl border-3 border-black flex items-center justify-center transition-all",
            routine.completed ? "bg-black text-white" : "bg-white hover:bg-black/5"
          )}
        >
          <CheckCircle2 size={24} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h4 className={cn("font-black text-lg italic tracking-tight uppercase", routine.completed && "line-through")}>
              {routine.title}
            </h4>
            <div className={cn("px-2 py-0.5 rounded-full border-2 border-black text-[8px] font-black uppercase", categoryColors[routine.category])}>
              {routine.category}
            </div>
          </div>
          {showDetailed && <p className="text-xs font-bold opacity-60 mt-1">{routine.description}</p>}
          <div className="flex items-center gap-1 mt-1">
             <Zap size={10} className="text-vibrant-sun fill-vibrant-sun" />
             <span className="text-[10px] font-black uppercase tracking-widest">{routine.streak} DAY STREAK</span>
          </div>
        </div>
      </div>
      
      {onDelete && (
        <button 
          onClick={onDelete}
          className="p-2 text-black/20 hover:text-vibrant-coral transition-colors"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
};
