import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { RoutineItem } from './RoutineItem';
import { Routine } from '../../types';

interface RoutinesViewProps {
  routines: Routine[];
  onToggleRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
  onAddRoutine: () => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  onToggleRoutine,
  onDeleteRoutine,
  onAddRoutine
}) => {
  const completedCount = routines.filter(r => r.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <header>
        <h1 className="text-6xl font-black italic tracking-tighter">ROUTINES.</h1>
        <p className="text-lg font-bold opacity-60 mt-2 uppercase tracking-wide">
          {completedCount} / {routines.length} TASKS COMPLETED
        </p>
      </header>

      <div className="space-y-6">
        {routines.map(routine => (
          <RoutineItem 
            key={routine.id} 
            routine={routine} 
            showDetailed 
            onToggle={() => onToggleRoutine(routine.id)} 
            onDelete={() => onDeleteRoutine(routine.id)}
          />
        ))}
        <button 
          onClick={onAddRoutine}
          className="w-full py-8 border-4 border-dashed border-black/20 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-white transition-all hover:border-black group active:scale-[0.98]"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          <span className="font-black text-xl italic tracking-tight">ADD NEW MISSION</span>
        </button>
      </div>
    </motion.div>
  );
};
