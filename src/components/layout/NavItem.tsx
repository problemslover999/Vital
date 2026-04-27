import React from 'react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 p-2 transition-all hover:scale-110 active:scale-95 group",
      active ? "text-[#141414]" : "text-[#141414]/40"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-3 border-transparent",
      active && "bg-vibrant-sun border-black vibrant-shadow-sm"
    )}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{label}</span>
  </button>
);
