import React from 'react';
import { Appointment } from '../types';
import { Calendar as CalendarIcon, Clock, DollarSign, Plus, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

interface CalendarManagerProps {
  appointments: Appointment[];
}

const CalendarManager: React.FC<CalendarManagerProps> = ({ appointments }) => {
  const sortedAppointments = [...appointments].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Helper to get time string
  const getTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Date Selector Header */}
      <div className="flex justify-between items-center bg-[#161B2C] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center space-x-4">
             <div className="bg-orange-600/10 text-orange-500 font-bold p-3 rounded-xl border border-orange-600/20 text-center min-w-[60px]">
                <span className="block text-xs uppercase tracking-wider">OCT</span>
                <span className="block text-2xl">26</span>
             </div>
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Today's Schedule</h1>
                <p className="text-slate-400 text-sm">3 Jobs • 2 Pending</p>
             </div>
        </div>
        <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Column */}
        <div className="lg:col-span-2 relative">
           {/* Vertical Line */}
           <div className="absolute left-[3.5rem] top-4 bottom-0 w-px bg-gradient-to-b from-slate-700 via-slate-800 to-transparent"></div>

          <div className="space-y-8">
            {sortedAppointments.map((appt, idx) => {
                const isPaid = appt.depositPaid;
                const statusColor = isPaid ? 'text-emerald-400' : 'text-amber-400';
                const borderColor = isPaid ? 'border-emerald-500/30' : 'border-amber-500/30';
                const glowClass = isPaid ? 'shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'shadow-[0_0_20px_rgba(245,158,11,0.05)]';

                return (
                    <div key={appt.id} className="relative flex items-start group">
                        {/* Time Marker */}
                        <div className="w-14 text-right text-sm font-bold text-slate-500 pt-4 mr-8 flex-shrink-0">
                            {getTime(appt.date)}
                        </div>
                        
                        {/* Dot on Line */}
                        <div className={`absolute left-[3.35rem] top-5 w-3 h-3 rounded-full border-2 border-[#0B0F19] z-10 ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                        {/* Card */}
                        <div className={`flex-1 bg-[#161B2C] rounded-2xl border ${borderColor} p-5 ${glowClass} hover:border-white/20 transition-all duration-300 relative overflow-hidden`}>
                             {/* Top Accent Bar */}
                             <div className={`absolute top-0 left-0 bottom-0 w-1 ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                             
                             <div className="flex justify-between items-start mb-3 pl-2">
                                 <div>
                                     <h3 className="text-lg font-bold text-white mb-1">{appt.service}</h3>
                                     <div className="flex items-center text-xs text-slate-400 space-x-2">
                                        <MapPin size={12} />
                                        <span>123 Main St, Springfield</span>
                                     </div>
                                 </div>
                                 {appt.status === 'confirmed' ? (
                                     <span className="flex items-center px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                         <CheckCircle2 size={12} className="mr-1" /> Confirmed
                                     </span>
                                 ) : (
                                     <span className="flex items-center px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                         <Clock size={12} className="mr-1" /> Scheduled
                                     </span>
                                 )}
                             </div>

                             <div className="pl-2 pt-3 border-t border-white/5 flex items-center justify-between">
                                 <div className="flex items-center space-x-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                                         {appt.customerName.charAt(0)}
                                     </div>
                                     <span className="text-sm text-slate-300">{appt.customerName}</span>
                                 </div>
                                 
                                 <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                                     isPaid 
                                     ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                     : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                 }`}>
                                     {isPaid ? (
                                         <>
                                            <DollarSign size={12} />
                                            <span>Deposit Paid</span>
                                         </>
                                     ) : (
                                         <>
                                            <AlertCircle size={12} />
                                            <span>Payment Pending</span>
                                         </>
                                     )}
                                 </div>
                             </div>
                        </div>
                    </div>
                );
            })}
             
             {/* Blocked Slot Example for visual */}
            <div className="relative flex items-start opacity-50">
                 <div className="w-14 text-right text-sm font-bold text-slate-600 pt-4 mr-8 flex-shrink-0">
                    4:00 PM
                 </div>
                 <div className="absolute left-[3.35rem] top-5 w-3 h-3 rounded-full border-2 border-[#0B0F19] bg-slate-700 z-10"></div>
                 <div className="flex-1 bg-[#161B2C] rounded-2xl border border-slate-800 p-4 border-dashed">
                     <div className="flex items-center justify-center text-slate-500 text-sm font-medium">
                        Blocked Time
                     </div>
                 </div>
            </div>

          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-[#161B2C] p-6 rounded-2xl border border-white/5 h-fit shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center">
            <Clock size={20} className="mr-2 text-orange-500" />
            Availability
          </h2>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-sm text-slate-400">Working Days</span>
              <span className="text-sm font-bold text-white">Mon - Fri</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-sm text-slate-400">Hours</span>
              <span className="text-sm font-bold text-white">8:00 AM - 6:00 PM</span>
            </div>
             <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-sm text-slate-400">Buffer Time</span>
              <span className="text-sm font-bold text-white">30 mins</span>
            </div>
            
            <button className="w-full py-3 text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-colors border border-orange-500/20 mt-4">
              Edit Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarManager;