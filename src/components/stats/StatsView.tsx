import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Zap } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { UserProgress, HealthInsight } from '../../types';

interface StatsViewProps {
  progressData: UserProgress[];
  lastInsight: HealthInsight | null;
  onGenerateReport: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  progressData,
  lastInsight,
  onGenerateReport
}) => {
  return (
    <motion.div
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
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#000' }} 
                    dy={10}
                  />
                  <YAxis 
                     axisLine={{ stroke: '#000', strokeWidth: 2 }} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fontWeight: 800, fill: '#000' }}
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

            <div className="bg-vibrant-sun p-10 border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000] relative">
              <h4 className="font-black text-xl italic mb-4 uppercase tracking-tight">VITAL INTEL</h4>
              <div className="text-sm font-bold leading-relaxed italic">
                {lastInsight?.content || "Gathering data for your next breakthrough insight. Keep pushing!"}
              </div>
              {lastInsight && (
                <div className="mt-4 text-[10px] font-black opacity-40 uppercase tracking-widest">
                  Generated {new Date(lastInsight.timestamp).toLocaleDateString()}
                </div>
              )}
              
              <button 
                onClick={onGenerateReport}
                className="mt-6 flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
              >
                 <Zap size={14} className="text-vibrant-sun" fill="currentColor" />
                 GENERATE NEW REPORT
              </button>
            </div>

            <div className="bg-white p-8 border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000]">
              <h4 className="font-black text-xl italic mb-4 uppercase tracking-tighter">Mission History</h4>
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {[...progressData].reverse().map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border-2 border-black rounded-xl text-xs font-bold uppercase italic">
                    <span className="opacity-40">{p.date}</span>
                    <div className="flex items-center gap-2">
                       <div className="w-20 h-2 bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full bg-black" style={{ width: `${p.completionRate}%` }} />
                       </div>
                       <span>{p.completionRate}%</span>
                    </div>
                  </div>
                ))}
                {progressData.length === 0 && (
                  <div className="text-center py-8 opacity-40 font-black italic">NO INTEL LOGGED YET.</div>
                )}
              </div>
            </div>
          </div>
       </div>
    </motion.div>
  );
};
