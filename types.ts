export interface Service {
  id: string;
  name: string;
  priceRange: string;
}

export interface TelephonyConfig {
  provider: 'twilio' | 'vapi' | 'simulated';
  phoneNumber: string;
  forwardingNumber: string;
  voice: string;
  isForwardingActive: boolean;
  apiKey?: string; // Optional for UI state
}

export interface PaymentConfig {
  provider: 'stripe' | 'paypal' | 'mock';
  currency: string;
  isConnected: boolean;
  apiKey?: string; // For UI simulation
}

export interface BusinessProfile {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  avatar: string;
  autoReplyScript: string;
  depositAmount: number;
  telephony: TelephonyConfig;
  payment: PaymentConfig;
}

export interface Appointment {
  id: string;
  customerName: string;
  service: string;
  date: Date;
  status: 'confirmed' | 'pending' | 'completed';
  depositPaid: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  unread: boolean;
  status: 'active' | 'archived' | 'spam';
  aiStatus?: 'active' | 'paused';
  messages: Message[];
}

export type View = 'dashboard' | 'inbox' | 'calendar' | 'settings' | 'simulator' | 'profile';