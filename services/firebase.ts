import { Conversation, Appointment, BusinessProfile, Service, Message } from '../types';
import { MOCK_CONVERSATIONS, MOCK_APPOINTMENTS, INITIAL_PROFILE, INITIAL_SERVICES } from '../data';

// --- In-Memory Stores (Mock Mode) ---
// Firebase dependencies removed to fix build errors.
// Running in pure mock mode with in-memory state.

let memConversations: Conversation[] = [...MOCK_CONVERSATIONS];
let memAppointments: Appointment[] = [...MOCK_APPOINTMENTS];
let memProfile: BusinessProfile = { ...INITIAL_PROFILE };
let memServices: Service[] = [...INITIAL_SERVICES];

// --- Mock Auth Store ---
// Simple persistence to localStorage for better DX across reloads
const storedUser = localStorage.getItem('mock_auth_user');
let currentUser: { id: string; email: string; name: string } | null = storedUser ? JSON.parse(storedUser) : null;

// Observers for mock mode
const observers: { [key: string]: Function[] } = {
  conversations: [],
  appointments: [],
  profile: [],
  services: [],
  auth: []
};

const notifyObservers = (key: string, data: any) => {
  if (observers[key]) {
    observers[key].forEach(cb => cb(data));
  }
};

// --- Auth Service Methods ---

export const subscribeToAuth = (callback: (user: any) => void) => {
  callback(currentUser);
  observers.auth.push(callback);
  return () => {
    observers.auth = observers.auth.filter(cb => cb !== callback);
  };
};

export const login = async (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        // Mock successful login
        currentUser = { 
          id: 'user_' + Math.random().toString(36).substr(2, 9), 
          email, 
          name: email.split('@')[0] 
        };
        localStorage.setItem('mock_auth_user', JSON.stringify(currentUser));
        notifyObservers('auth', currentUser);
        resolve(currentUser);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simulate network delay
  });
};

export const register = async (email: string, password: string, name: string) => {
   return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password && name) {
        // Mock successful registration
        currentUser = { 
          id: 'user_' + Math.random().toString(36).substr(2, 9), 
          email, 
          name 
        };
        localStorage.setItem('mock_auth_user', JSON.stringify(currentUser));
        // Reset data for new user simulation if desired, or keep shared mock data
        notifyObservers('auth', currentUser);
        resolve(currentUser);
      } else {
        reject(new Error('Please fill in all fields'));
      }
    }, 1500);
  });
};

export const logout = async () => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem('mock_auth_user');
      notifyObservers('auth', null);
      resolve();
    }, 500);
  });
};


// --- Service Methods ---

// 1. Conversations
export const subscribeToConversations = (callback: (data: Conversation[]) => void) => {
  callback(memConversations);
  observers.conversations.push(callback);
  return () => {
    observers.conversations = observers.conversations.filter(cb => cb !== callback);
  };
};

export const addMessageToConversation = async (conversationId: string, message: Message, aiStatusUpdate?: 'active' | 'paused') => {
  memConversations = memConversations.map(c => {
    if (c.id === conversationId) {
      return {
        ...c,
        messages: [...c.messages, message],
        lastMessage: message.text,
        aiStatus: aiStatusUpdate || c.aiStatus
      };
    }
    return c;
  });
  notifyObservers('conversations', memConversations);
};

export const createNewConversation = async (conversation: Conversation) => {
  memConversations = [conversation, ...memConversations];
  notifyObservers('conversations', memConversations);
};

export const toggleAiStatus = async (conversationId: string, status: 'active' | 'paused') => {
  memConversations = memConversations.map(c => 
    c.id === conversationId ? { ...c, aiStatus: status } : c
  );
  notifyObservers('conversations', memConversations);
};

// 2. Appointments
export const subscribeToAppointments = (callback: (data: Appointment[]) => void) => {
  callback(memAppointments);
  observers.appointments.push(callback);
  return () => {
    observers.appointments = observers.appointments.filter(cb => cb !== callback);
  };
};

export const addAppointment = async (appt: Appointment) => {
  memAppointments = [...memAppointments, appt];
  notifyObservers('appointments', memAppointments);
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  memAppointments = memAppointments.map(a => a.id === id ? { ...a, ...updates } : a);
  notifyObservers('appointments', memAppointments);
};

// 3. Profile & Services
export const getProfile = async (): Promise<BusinessProfile> => {
    return memProfile;
}

export const updateProfile = async (profile: BusinessProfile) => {
    memProfile = profile;
    notifyObservers('profile', memProfile);
}

export const getServices = async (): Promise<Service[]> => {
    return memServices;
}

export const updateServices = async (services: Service[]) => {
    memServices = services;
    notifyObservers('services', memServices);
}