import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PhoneMissed, DollarSign, MessageCircle, Phone, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { BusinessProfile } from '../types';

interface DashboardProps {
  profile?: BusinessProfile;
}

const data = [
  { name: 'Mon', calls: 4, booked: 2 },
  { name: 'Tue', calls: 3, booked: 1 },
  { name: 'Wed', calls: 7, booked: 4 },
  { name: 'Thu', calls: 5, booked: 3 },
  { name: 'Fri', calls: 8, booked: 5 },
  { name: 'Sat', calls: 6, booked: 4 },
  { name: 'Sun', calls: 2, booked: 1 },
];

const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-[#161B2C] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-xl">
    {/* Background Glow */}
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
    
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <div className="flex items-center mt-3 space-x-2">
            {trend && <div className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center">
                <ArrowUpRight size={10} className="mr-0.5" /> 12%
            </div>}
            <p className="text-xs text-slate-500">{subtext}</p>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-white/5 text-slate-300 border border-white/5 group-hover:text-orange-400 group-hover:border-orange-500/20 transition-colors">
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const calls = payload[0]?.value;
    const booked = payload[1]?.value;
    const estRevenue = booked * 200; // Estimated $200 per job

    return (
      <div className="bg-[#161B2C]/95 backdrop-blur-md p-4 border border-white/10 shadow-2xl rounded-xl min-w-[200px] pointer-events-none">
        <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider border-b border-white/5 pb-2">{label}</p>
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Inbound Calls</span>
                <span className="font-bold text-blue-400">{calls}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Jobs Booked</span>
                <span className="font-bold text-orange-400">{booked}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5 mt-1">
                <span className="text-slate-300 font-medium">Est. Revenue</span>
                <span className="font-bold text-emerald-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(estRevenue)}
                </span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [autoReplyActive, setAutoReplyActive] = useState(true);

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hello, {profile?.ownerName || 'Mike'}</h1>
          <p className="text-slate-400 mt-1">Your business cockpit is active.</p>
        </div>
        
        {/* Glowing Toggle */}
        <div className="mt-4 md:mt-0 flex items-center bg-[#161B2C] border border-white/5 rounded-full px-5 py-2.5 shadow-lg">
          <span className="mr-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            AI Receptionist
          </span>
          <button 
            onClick={() => setAutoReplyActive(!autoReplyActive)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ${
              autoReplyActive 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                : 'bg-slate-700'
            }`}
          >
            <span
              className={`${
                autoReplyActive ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300`}
            />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Revenue Rescued"
          value="$1,850"
          subtext="from missed calls"
          icon={DollarSign}
          trend={true}
        />
        <StatCard
          title="Calls Handled"
          value="12"
          subtext="Past 24 hours"
          icon={Phone}
        />
        <StatCard
          title="Pending Deposits"
          value="$450"
          subtext="3 invoices sent"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity List */}
        <div className="bg-[#161B2C] p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6">Recent Live Activity</h3>
            <div className="space-y-1 flex-1">
                {[
                  { name: 'Sarah Jenkins', action: 'New Lead', time: '10m ago', status: 'Negotiating', statusColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
                  { name: 'Mike Thompson', action: 'Deposit Paid', time: '1h ago', status: 'Booked', statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
                  { name: 'Unknown (8821)', action: 'Missed Call', time: '2h ago', status: 'Follow-up', statusColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
                  { name: 'Alice Smith', action: 'Quote Sent', time: 'Yesterday', status: 'Waiting', statusColor: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
                ].map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all cursor-default border border-transparent hover:border-white/5">
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.action.includes('Call') ? 'bg-blue-500/20 text-blue-400' : 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'}`}>
                                {item.action.includes('Call') ? <PhoneMissed size={18} /> : <MessageCircle size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{item.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{item.time}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${item.statusColor}`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl transition-colors">
                View All Activity
            </button>
        </div>

        {/* Chart */}
        <div className="bg-[#161B2C] p-8 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Volume Trends</h3>
            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#4A5568', strokeWidth: 1}} />
                <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" dataKey="booked" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorBooked)" />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;