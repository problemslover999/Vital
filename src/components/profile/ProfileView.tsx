import React from 'react';
import { motion } from 'motion/react';
import { LogOut, User as UserIcon, Mail, ShieldCheck, Activity } from 'lucide-react';
import { UserProfile } from '../../types';
import { logout } from '../../lib/firebase';
import { cn } from '../../lib/utils';

interface ProfileViewProps {
  user: any;
  profile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  profile,
  onSaveProfile
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <header>
        <h1 className="text-6xl font-black italic tracking-tighter uppercase">PROFILE.</h1>
        <p className="text-lg font-bold opacity-60 mt-2 uppercase tracking-wide">Identity & Biometrics</p>
      </header>

      {/* Account Info Card */}
      <div className="bg-vibrant-sun p-8 border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000] flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full border-4 border-black bg-white overflow-hidden vibrant-shadow">
           {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
           ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/5">
              <UserIcon size={64} className="text-black/20" />
            </div>
           )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">{user?.displayName || 'User'}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 opacity-70">
            <Mail size={16} />
            <span className="font-bold text-sm">{user?.email}</span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-white/30 px-4 py-2 rounded-xl border-2 border-black/10 font-black text-xs uppercase tracking-widest">
              Level {profile?.level || 1}
            </div>
            <div className="bg-white/30 px-4 py-2 rounded-xl border-2 border-black/10 font-black text-xs uppercase tracking-widest">
              {profile?.experience || 0} Total XP
            </div>
          </div>
        </div>
        <button 
          onClick={() => logout()}
          className="bg-black text-white px-8 py-4 rounded-2xl font-black italic tracking-widest flex items-center gap-3 hover:bg-vibrant-coral transition-colors vibrant-shadow-sm"
        >
          <LogOut size={20} />
          SIGN OUT
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Specs */}
        <div className="bg-white p-10 border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0px_#000]">
          <h3 className="font-black text-2xl italic mb-8 uppercase tracking-tight flex items-center gap-3">
            <Activity size={24} />
            Physical Specs
          </h3>
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updatedProfile: UserProfile = {
              name: formData.get('name') as string || (profile?.name || user.displayName || ''),
              age: Number(formData.get('age')),
              weight: Number(formData.get('weight')),
              height: Number(formData.get('height')),
              activityLevel: formData.get('activityLevel') as UserProfile['activityLevel'],
              dailyCalorieTarget: Number(formData.get('calories')),
              level: profile?.level || 1,
              experience: profile?.experience || 0,
              onboarded: true
            };
            onSaveProfile(updatedProfile);
            alert("Physical metrics synced.");
          }}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Display Name</label>
              <input name="name" defaultValue={profile?.name || user.displayName || ''} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase focus:outline-none focus:ring-4 focus:ring-vibrant-sun/30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Age</label>
                <input name="age" type="number" defaultValue={profile?.age} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase focus:outline-none focus:ring-4 focus:ring-vibrant-sun/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Weight (kg)</label>
                <input name="weight" type="number" defaultValue={profile?.weight} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase focus:outline-none focus:ring-4 focus:ring-vibrant-sun/30" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Activity Level</label>
              <select name="activityLevel" defaultValue={profile?.activityLevel} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase focus:outline-none focus:ring-4 focus:ring-vibrant-sun/30">
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Very Active</option>
              </select>
            </div>
            <button type="submit" className="w-full py-5 bg-black text-white rounded-2xl font-black italic tracking-widest hover:scale-105 active:scale-95 transition-transform vibrant-shadow-sm">
              UPDATE PHYSICAL BASE
            </button>
          </form>
        </div>

        <div className="space-y-8">
          {/* Security */}
          <div className="bg-vibrant-mint p-10 border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000]">
            <h3 className="font-black text-2xl italic mb-4 uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck size={24} />
              Security
            </h3>
            <p className="text-sm font-bold opacity-70 mb-8 leading-relaxed">
              Your biometrics are encrypted. You are currently authenticated via your Google account identity.
            </p>
            <div className="p-6 bg-white/40 border-2 border-black/10 rounded-2xl mb-8">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Session ID</p>
               <p className="text-xs font-mono font-bold truncate">{user?.uid}</p>
            </div>
            <button 
              onClick={() => logout()}
              className="w-full py-4 bg-white border-3 border-black rounded-xl font-black italic tracking-widest text-vibrant-coral flex items-center justify-center gap-2 hover:bg-vibrant-coral hover:text-white transition-all"
            >
              <LogOut size={20} />
              TERMINATE SESSION
            </button>
          </div>
          
          <div className="bg-vibrant-sky/20 p-10 border-4 border-black border-dashed rounded-[2.5rem]">
            <h3 className="font-black text-xl italic mb-4 uppercase tracking-tight opacity-40">Hardware Sync</h3>
            <p className="text-xs font-bold opacity-30 uppercase tracking-widest leading-relaxed">
              Connect external health shards to automate biometric ingestion.
            </p>
            <button disabled className="mt-6 px-6 py-3 border-2 border-black/20 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-20 cursor-not-allowed">
              COMING SOON
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
