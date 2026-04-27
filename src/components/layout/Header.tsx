import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logout } from '../../lib/firebase';

interface HeaderProps {
  user: any;
  onProfileClick: () => void;
  forceShow?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onProfileClick, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 7000); // 7 seconds

    return () => clearTimeout(timer);
  }, [forceShow]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-4 pointer-events-auto"
        >
          <div 
            onClick={onProfileClick}
            className="flex items-center gap-3 bg-white border-3 border-black p-2 pr-4 rounded-full vibrant-shadow-sm cursor-pointer hover:scale-105 transition-all group"
          >
            <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-vibrant-sun flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-black" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter leading-none">Logged in as</span>
              <span className="text-xs font-black italic tracking-tight">{user?.displayName || 'User'}</span>
            </div>
          </div>
          
          <button 
            onClick={() => logout()}
            className="w-12 h-12 bg-vibrant-coral border-3 border-black rounded-full flex items-center justify-center vibrant-shadow-sm hover:scale-110 active:scale-95 transition-all group"
            title="Sign Out"
          >
            <LogOut size={20} className="text-white group-hover:rotate-12 transition-transform" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
