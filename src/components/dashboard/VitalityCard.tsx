import React from 'react';
import { Zap } from 'lucide-react';

interface VitalityCardProps {
  score: number;
  level: number;
  experience: number;
}

export const VitalityCard: React.FC<VitalityCardProps> = ({ score, level, experience }) => {
  // Experience for next level = (level)^2 * 100
  const nextLevelXP = Math.pow(level, 2) * 100;
  const xpProgress = (experience / nextLevelXP) * 100;

  return (
    <div className="bg-black text-white p-10 border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_#FFE66D] relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-black text-2xl italic mb-1 uppercase tracking-tighter text-vibrant-sun">Vitality Score</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-8xl font-black italic tracking-tighter">{score}</span>
              <span className="text-xl font-bold opacity-40 italic">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-vibrant-sun text-black px-4 py-2 rounded-2xl border-3 border-black font-black italic text-xl">
              LVL {level}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">
              {experience} / {nextLevelXP} XP
            </p>
          </div>
        </div>
        
        <div className="mt-8 space-y-2">
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border-2 border-white/20">
            <div 
              className="h-full bg-vibrant-sun transition-all duration-1000"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-sm font-bold uppercase tracking-tight opacity-70">
            {score > 80 ? "PEAK PERFORMANCE ATTAINED." : score > 50 ? "MOMENTUM BUILDING." : "RECOVERY MODE ACTIVE."}
          </p>
        </div>
      </div>
      <div className="absolute -right-10 -bottom-10 opacity-20 rotate-12 group-hover:scale-110 transition-transform">
        <Zap size={240} strokeWidth={4} fill="#FFE66D" color="#FFE66D" />
      </div>
    </div>
  );
};
