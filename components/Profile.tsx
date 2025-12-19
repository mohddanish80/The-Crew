import React, { useState, useRef } from 'react';
import { BusinessProfile } from '../types';
import { Save, User, Mail, Phone, Camera, Briefcase } from 'lucide-react';

interface ProfileProps {
  profile: BusinessProfile;
  onUpdateProfile: (p: BusinessProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdateProfile }) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdateProfile(localProfile);
    alert('Profile updated successfully!');
  };

  const handleChange = (field: keyof BusinessProfile, value: string | number) => {
    setLocalProfile({ ...localProfile, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile({ ...localProfile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Your Profile</h1>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all font-medium"
        >
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#161B2C] rounded-2xl shadow-xl border border-white/5 p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <img 
                src={localProfile.avatar} 
                alt="Profile" 
                className="relative w-32 h-32 rounded-full object-cover border-2 border-[#161B2C]"
              />
              <div 
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="text-white" size={24} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <h2 className="text-xl font-bold text-white">{localProfile.ownerName}</h2>
            <p className="text-slate-400 text-sm mb-6">{localProfile.name}</p>
            <div className="w-full pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <span className="block text-xl font-bold text-white">4.8</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Rating</span>
                </div>
                <div className="text-center">
                    <span className="block text-xl font-bold text-white">124</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Jobs</span>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#161B2C] rounded-2xl shadow-xl border border-white/5 p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <User size={20} className="mr-3 text-orange-500" />
              Personal Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                    <User size={16} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                    type="text"
                    value={localProfile.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                    type="email"
                    value={localProfile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                </div>
              </div>

               <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Direct Phone</label>
                <div className="relative">
                    <Phone size={16} className="absolute left-4 top-3.5 text-slate-500" />
                    <input
                    type="text"
                    value={localProfile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161B2C] rounded-2xl shadow-xl border border-white/5 p-8 opacity-60 hover:opacity-100 transition-opacity">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Briefcase size={20} className="mr-3 text-slate-400" />
              Business Info
            </h3>
            <p className="text-sm text-slate-400 mb-4">
                Managed via Settings.
            </p>
            <div>
                 <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Business Name</label>
                 <div className="w-full bg-[#0B0F19] border border-white/5 text-slate-400 rounded-xl px-4 py-3">
                    {localProfile.name}
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;