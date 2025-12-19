import React, { useState } from 'react';
import { LayoutDashboard, MessageSquare, Calendar, Settings, Menu, X, Bot, LogOut, UserCircle, Wrench } from 'lucide-react';
import { View } from '../types';
import { logout } from '../services/firebase';

interface LayoutProps {
  currentView: View;
  onChangeView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    // App.tsx auth subscription will handle the redirect to Auth component
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          onChangeView(view);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-2 duration-200 group relative overflow-hidden ${
          isActive 
            ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-400 font-medium' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {/* Active Indicator Line */}
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-r-full" />}
        
        <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'group-hover:scale-105'}`} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex font-sans selection:bg-orange-500/30">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-[#0B0F19]/95 backdrop-blur-xl border-r border-white/5 fixed h-full z-20 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)]">
             <Wrench className="text-white" size={22} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">The Crew</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-2">Main Menu</p>
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="inbox" icon={MessageSquare} label="Inbox" />
          <NavItem view="calendar" icon={Calendar} label="Schedule" />
          
          <div className="my-6 border-t border-white/5"></div>
          
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Tools & Account</p>
          <NavItem view="simulator" icon={Bot} label="AI Simulator" />
          <NavItem view="profile" icon={UserCircle} label="Profile" />
          <NavItem view="settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#0B0F19]">
           <button 
             onClick={handleLogout}
             className="flex items-center space-x-3 text-slate-500 hover:text-white w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
           >
              <LogOut size={18} />
              <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-[#0B0F19]/80 backdrop-blur-md z-30 border-b border-white/5 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-2">
           <div className="bg-gradient-to-br from-orange-500 to-red-600 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
             <Wrench className="text-white" size={18} />
          </div>
          <span className="font-bold text-white tracking-tight">The Crew</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-200 p-2 hover:bg-white/5 rounded-lg">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#0B0F19] z-20 pt-20 px-4 animate-fade-in">
          <nav className="flex flex-col space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="inbox" icon={MessageSquare} label="Inbox" />
            <NavItem view="calendar" icon={Calendar} label="Schedule" />
             <NavItem view="simulator" icon={Bot} label="AI Simulator" />
            <NavItem view="profile" icon={UserCircle} label="Profile" />
            <NavItem view="settings" icon={Settings} label="Settings" />
            
            <div className="pt-4 mt-4 border-t border-white/5">
                <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-slate-400 w-full px-4 py-3 rounded-xl hover:bg-white/5"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#161B2C] to-[#0B0F19]">
        {children}
      </main>
    </div>
  );
};

export default Layout;