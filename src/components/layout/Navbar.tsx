import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  MessageSquare, 
  BarChart3, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';
import { NavItem } from './NavItem';
import { logout } from '../../lib/firebase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
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
        <NavItem 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<UserIcon size={24} />} 
          label="Profile"
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
  );
};
