import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import CalendarManager from './components/CalendarManager';
import Settings from './components/Settings';
import Simulator from './components/Simulator';
import Profile from './components/Profile';
import { View, BusinessProfile, Service, Conversation, Appointment, Message } from './types';
import { INITIAL_PROFILE, INITIAL_SERVICES } from './data';
import { 
  subscribeToConversations, 
  subscribeToAppointments, 
  subscribeToAuth,
  addMessageToConversation, 
  addAppointment, 
  updateAppointment,
  toggleAiStatus,
  updateProfile as updateProfileService,
  updateServices as updateServicesService,
  getProfile,
  getServices
} from './services/firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [profile, setProfile] = useState<BusinessProfile>(INITIAL_PROFILE);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Auth Subscription
  useEffect(() => {
    const unsubAuth = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });
    return () => unsubAuth();
  }, []);

  // Data Subscriptions (Only active when authenticated)
  useEffect(() => {
    if (!user) return;

    const unsubConvs = subscribeToConversations(setConversations);
    const unsubAppts = subscribeToAppointments(setAppointments);
    
    // Load static/settings data
    getProfile().then(setProfile);
    getServices().then(setServices);

    return () => {
      unsubConvs();
      unsubAppts();
    };
  }, [user]);

  // Handlers
  const handleSendMessage = (conversationId: string, text: string) => {
    const newMessage: Message = { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text, 
        timestamp: new Date() 
    };
    addMessageToConversation(conversationId, newMessage);
  };

  const handleBookAppointment = (customerName: string, service: string, dateStr: string) => {
    const date = new Date(dateStr);
    
    // Check local state for existing pending (optimistic check)
    const existing = appointments.find(a => a.customerName === customerName && a.status === 'pending');

    if (existing) {
        updateAppointment(existing.id, {
            status: 'confirmed',
            date: date,
            service: service || existing.service
        });
    } else {
        const newAppointment: Appointment = {
            id: Date.now().toString(),
            customerName,
            service: service || 'Service Call',
            date: date,
            status: 'confirmed',
            depositPaid: false
        };
        addAppointment(newAppointment);
    }
  };

  const handlePaymentSuccess = (customerName: string) => {
    const appt = appointments.find(a => a.customerName === customerName);
    if (appt) {
        updateAppointment(appt.id, {
            status: 'completed',
            depositPaid: true
        });
    }
  };

  const handleToggleAiMode = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
        const newStatus = conv.aiStatus === 'paused' ? 'active' : 'paused';
        toggleAiStatus(conversationId, newStatus);
    }
  };

  const handleUpdateProfile = (p: BusinessProfile) => {
      setProfile(p);
      updateProfileService(p);
  }

  const handleUpdateServices = (s: Service[]) => {
      setServices(s);
      updateServicesService(s);
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard profile={profile} />;
      case 'inbox':
        return <Inbox 
          conversations={conversations} 
          onSendMessage={handleSendMessage} 
          onBookAppointment={handleBookAppointment}
          onPaymentSuccess={handlePaymentSuccess}
          onToggleAiMode={handleToggleAiMode}
          profile={profile}
        />;
      case 'calendar':
        return <CalendarManager appointments={appointments} />;
      case 'settings':
        return (
          <Settings 
            profile={profile} 
            services={services} 
            onUpdateProfile={handleUpdateProfile} 
            onUpdateServices={handleUpdateServices} 
          />
        );
      case 'profile':
        return (
          <Profile
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'simulator':
        return <Simulator profile={profile} services={services} />;
      default:
        return <Dashboard profile={profile} />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;