import React from 'react';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { UserProfile } from '../../types';
import { logout } from '../../lib/firebase';

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
        <p className="text-lg font-bold opacity-60 mt-2 uppercase tracking-wide">Secure Biometrics & Data</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-10 border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0px_#000]">
          <h3 className="font-black text-2xl italic mb-8 uppercase tracking-tight">Personal Specs</h3>
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
          }}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Agent Name</label>
              <input name="name" defaultValue={profile?.name || user.displayName || ''} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Age</label>
                <input name="age" type="number" defaultValue={profile?.age} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Weight (kg)</label>
                <input name="weight" type="number" defaultValue={profile?.weight} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Activity Level</label>
              <select name="activityLevel" defaultValue={profile?.activityLevel} className="w-full p-4 bg-vibrant-bg border-3 border-black rounded-xl font-black italic uppercase">
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Very Active</option>
              </select>
            </div>
            <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-black italic tracking-widest hover:scale-105 active:scale-95 transition-transform">
              UPDATE BASE DATA
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-vibrant-sun p-10 border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0px_#000]">
            <h3 className="font-black text-2xl italic mb-4 uppercase tracking-tight">Security</h3>
            <p className="text-sm font-bold opacity-70 mb-6">Your health data is encrypted and synced to your private shard.</p>
            <button 
              onClick={() => logout()}
              className="flex items-center gap-2 text-vibrant-coral font-black italic border-b-3 border-vibrant-coral leading-none"
            >
              <LogOut size={20} />
              TERMINATE SESSION
            </button>
          </div>
          <div className="bg-vibrant-sky/20 p-10 border-4 border-black border-dashed rounded-[2.5rem]">
            <h3 className="font-black text-xl italic mb-4 uppercase tracking-tight opacity-40">Hardware Sync</h3>
            <p className="text-xs font-bold opacity-30 uppercase tracking-widest">Connect Apple Health or Google Fit to automate biometric collection.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
