import React, { useState } from 'react';
import { BusinessProfile, Service, TelephonyConfig, PaymentConfig } from '../types';
import { Save, Plus, Trash2, Sliders, Phone, Globe, Mic, CheckCircle2, AlertCircle, CreditCard, Wallet, Link2, Loader } from 'lucide-react';

interface SettingsProps {
  profile: BusinessProfile;
  services: Service[];
  onUpdateProfile: (p: BusinessProfile) => void;
  onUpdateServices: (s: Service[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, services, onUpdateProfile, onUpdateServices }) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const [localServices, setLocalServices] = useState(services);
  const [isConnectingPayment, setIsConnectingPayment] = useState(false);

  // Fallback for existing profiles
  if (!localProfile.telephony) {
      localProfile.telephony = {
          provider: 'simulated',
          phoneNumber: '(555) 012-3456',
          forwardingNumber: profile.phone || '',
          voice: 'alloy',
          isForwardingActive: true
      };
  }
  if (!localProfile.payment) {
      localProfile.payment = {
          provider: 'mock',
          currency: 'USD',
          isConnected: true
      };
  }

  const handleSave = () => {
    onUpdateProfile(localProfile);
    onUpdateServices(localServices);
    alert('Settings saved successfully!');
  };

  const addService = () => {
    const newService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Service',
      priceRange: '$50 - $100'
    };
    setLocalServices([...localServices, newService]);
  };

  const removeService = (id: string) => {
    setLocalServices(localServices.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    setLocalServices(localServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateTelephony = (field: keyof TelephonyConfig, value: any) => {
      setLocalProfile({
          ...localProfile,
          telephony: {
              ...localProfile.telephony,
              [field]: value
          }
      });
  };

  const updatePayment = (field: keyof PaymentConfig, value: any) => {
      setLocalProfile({
          ...localProfile,
          payment: {
              ...localProfile.payment,
              [field]: value
          }
      });
  };

  const handleConnectPayment = () => {
      setIsConnectingPayment(true);
      setTimeout(() => {
          setIsConnectingPayment(false);
          updatePayment('isConnected', true);
      }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all font-medium"
        >
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Payment Gateway Section */}
      <div className="bg-[#161B2C] rounded-2xl shadow-xl border border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <CreditCard size={120} />
        </div>
        <h2 className="text-lg font-bold text-white mb-6 flex items-center relative z-10">
          <Wallet size={20} className="mr-3 text-orange-500" />
          Payment Gateway
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
             <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Provider</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'stripe', label: 'Stripe', icon: CreditCard }, 
                        { id: 'paypal', label: 'PayPal', icon: Wallet }, 
                        { id: 'mock', label: 'Internal Mock', icon: Link2 }
                    ].map((p) => {
                        const Icon = p.icon;
                        const isSelected = localProfile.payment.provider === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => {
                                    updatePayment('provider', p.id);
                                    if(p.id !== 'mock') updatePayment('isConnected', false);
                                    else updatePayment('isConnected', true);
                                }}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                                    isSelected
                                    ? 'bg-orange-500/10 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                                    : 'bg-[#0B0F19] border-white/10 text-slate-400 hover:border-white/20'
                                }`}
                            >
                                <Icon size={24} className="mb-2" />
                                <span className="font-bold">{p.label}</span>
                                {isSelected && localProfile.payment.isConnected && (
                                    <div className="flex items-center text-[10px] text-emerald-400 mt-1 font-bold">
                                        <CheckCircle2 size={10} className="mr-1" /> Connected
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {localProfile.payment.provider !== 'mock' && (
                <div className="md:col-span-2 bg-[#0B0F19] border border-white/10 rounded-xl p-6 transition-all animate-fade-in">
                    <div className="flex items-start justify-between">
                         <div className="flex-1 mr-6">
                            <h3 className="text-sm font-bold text-white mb-1">Connect to {localProfile.payment.provider === 'stripe' ? 'Stripe' : 'PayPal'}</h3>
                            <p className="text-xs text-slate-400 mb-4">
                                Enter your API credentials to enable real payment link generation.
                            </p>
                            
                            {!localProfile.payment.isConnected ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">API Secret Key</label>
                                        <input 
                                            type="password" 
                                            placeholder="sk_live_..." 
                                            className="w-full bg-[#161B2C] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleConnectPayment}
                                        disabled={isConnectingPayment}
                                        className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center"
                                    >
                                        {isConnectingPayment ? <Loader size={12} className="animate-spin mr-2"/> : null}
                                        {isConnectingPayment ? 'Verifying...' : 'Connect Account'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center text-emerald-400 text-sm font-bold bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                    <CheckCircle2 size={16} className="mr-2" />
                                    Account Connected Successfully
                                    <button 
                                        onClick={() => updatePayment('isConnected', false)}
                                        className="ml-auto text-xs text-slate-500 hover:text-white underline"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            )}
            
            <div>
                 <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Currency</label>
                 <select
                    value={localProfile.payment.currency}
                    onChange={(e) => updatePayment('currency', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                 >
                     <option value="USD">USD ($)</option>
                     <option value="EUR">EUR (€)</option>
                     <option value="GBP">GBP (£)</option>
                     <option value="CAD">CAD ($)</option>
                 </select>
            </div>
        </div>
      </div>

      {/* Telephony Integration Section */}
      <div className="bg-[#161B2C] rounded-2xl shadow-xl border border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Phone size={120} />
        </div>
        <h2 className="text-lg font-bold text-white mb-6 flex items-center relative z-10">
          <Globe size={20} className="mr-3 text-orange-500" />
          Telephony Integration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Provider Selection */}
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Provider</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['twilio', 'vapi', 'simulated'].map((provider) => (
                        <button
                            key={provider}
                            onClick={() => updateTelephony('provider', provider as any)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                                localProfile.telephony.provider === provider 
                                ? 'bg-orange-500/10 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                                : 'bg-[#0B0F19] border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                            <span className="font-bold capitalize">{provider}</span>
                            <span className="text-[10px] opacity-60 mt-1">
                                {provider === 'simulated' ? 'Internal Demo Mode' : 'Connect via API'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Config Fields */}
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">AI Phone Number</label>
                <input
                    type="text"
                    value={localProfile.telephony.phoneNumber}
                    onChange={(e) => updateTelephony('phoneNumber', e.target.value)}
                    className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                />
            </div>

            <div>
                 <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Forwarding Number</label>
                 <div className="flex space-x-3">
                     <input
                        type="text"
                        value={localProfile.telephony.forwardingNumber}
                        onChange={(e) => updateTelephony('forwardingNumber', e.target.value)}
                        disabled={!localProfile.telephony.isForwardingActive}
                        className={`flex-1 bg-[#0B0F19] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors ${!localProfile.telephony.isForwardingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                     />
                     <button 
                        onClick={() => updateTelephony('isForwardingActive', !localProfile.telephony.isForwardingActive)}
                        className={`px-4 rounded-xl font-bold text-xs uppercase transition-all border ${
                            localProfile.telephony.isForwardingActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                     >
                        {localProfile.telephony.isForwardingActive ? 'Active' : 'Off'}
                     </button>
                 </div>
            </div>

            <div className="md:col-span-2 border-t border-white/5 pt-6 mt-2">
                <div className="flex items-center justify-between mb-4">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center">
                        <Mic size={14} className="mr-2" />
                        AI Voice Persona
                     </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['alloy', 'echo', 'fable', 'onyx'].map((voice) => (
                         <button
                            key={voice}
                            onClick={() => updateTelephony('voice', voice)}
                            className={`flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all text-sm font-medium ${
                                localProfile.telephony.voice === voice
                                ? 'bg-white/10 border-white text-white'
                                : 'bg-[#0B0F19] border-white/5 text-slate-400 hover:bg-white/5'
                            }`}
                         >
                            <span className="capitalize">{voice}</span>
                            {localProfile.telephony.voice === voice && <CheckCircle2 size={14} className="text-emerald-400" />}
                         </button>
                     ))}
                </div>
            </div>

            {localProfile.telephony.provider !== 'simulated' && (
                <div className="md:col-span-2 bg-amber-900/10 border border-amber-900/20 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm text-amber-500 font-bold mb-1">API Configuration Required</p>
                        <p className="text-xs text-amber-400/80">
                            To connect to {localProfile.telephony.provider}, you'll need to provide your API keys and webhook secrets in your environment variables or backend configuration.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="bg-[#161B2C] rounded-2xl shadow-xl border border-white/5 p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center">
          <Sliders size={20} className="mr-3 text-orange-500" />
          Business Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Business Name</label>
            <input
              type="text"
              value={localProfile.name}
              onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
              className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Deposit Amount ($)</label>
            <input
              type="number"
              value={localProfile.depositAmount}
              onChange={(e) => setLocalProfile({ ...localProfile, depositAmount: Number(e.target.value) })}
              className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Auto-Reply Script</label>
            <textarea
              rows={3}
              value={localProfile.autoReplyScript}
              onChange={(e) => setLocalProfile({ ...localProfile, autoReplyScript: e.target.value })}
              className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-slate-500 mt-2">This is the first message the bot sends after a missed call.</p>
          </div>
        </div>
      </div>

      <div className="bg-[#161B2C] rounded-2xl shadow-xl border border-white/5 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Service Price List</h2>
          <button onClick={addService} className="text-orange-400 hover:text-orange-300 text-sm font-bold flex items-center transition-colors uppercase tracking-wide">
            <Plus size={16} className="mr-1" /> Add Service
          </button>
        </div>
        
        <div className="space-y-4">
          {localServices.map((service) => (
            <div key={service.id} className="flex items-center space-x-4 p-4 bg-[#0B0F19] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(service.id, 'name', e.target.value)}
                placeholder="Service Name"
                className="flex-1 bg-transparent border-b border-slate-800 px-2 py-1 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <input
                type="text"
                value={service.priceRange}
                onChange={(e) => updateService(service.id, 'priceRange', e.target.value)}
                placeholder="Price Range"
                className="w-1/3 bg-transparent border-b border-slate-800 px-2 py-1 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button 
                onClick={() => removeService(service.id)}
                className="text-slate-600 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {localServices.length === 0 && (
            <p className="text-center text-slate-600 py-4 text-sm">No services configured.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;