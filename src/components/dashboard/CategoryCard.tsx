import React from 'react';
import { cn } from '../../lib/utils';

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, count, color }) => (
  <div className={cn(
    "p-6 border-3 border-black rounded-[2rem] vibrant-shadow-sm flex flex-col items-center gap-2 text-center group hover:scale-105 transition-all cursor-pointer",
    color
  )}>
    <div className="w-12 h-12 bg-white border-3 border-black rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-tighter">{title}</p>
      <p className="text-[10px] font-bold opacity-60 uppercase">{count} Active</p>
    </div>
  </div>
);
