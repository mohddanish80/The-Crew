import { Conversation, Appointment, BusinessProfile, Service } from './types';

export const INITIAL_PROFILE: BusinessProfile = {
  name: "Mike's Plumbing",
  ownerName: "Mike",
  email: "mike@mikesplumbing.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  phone: "(555) 123-4567",
  autoReplyScript: "Hi! This is Mike's automated assistant. I'm currently on a job. How can I help you today?",
  depositAmount: 50,
  telephony: {
    provider: 'simulated',
    phoneNumber: '(555) 012-3456',
    forwardingNumber: '(555) 123-4567',
    voice: 'alloy',
    isForwardingActive: true
  },
  payment: {
    provider: 'mock',
    currency: 'USD',
    isConnected: true
  }
};

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Faucet Install', priceRange: '$150 - $200' },
  { id: '2', name: 'Clog Removal', priceRange: '$120 - $180' },
  { id: '3', name: 'Leak Repair', priceRange: '$200+' },
  { id: '4', name: 'Water Heater Flush', priceRange: '$150' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: '1', 
    customerName: 'Alice Smith', 
    service: 'Faucet Install', 
    date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
    status: 'confirmed', 
    depositPaid: true 
  },
  { 
    id: '2', 
    customerName: 'Bob Johnson', 
    service: 'Leak Repair', 
    date: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 days out
    status: 'pending', 
    depositPaid: false 
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    customerName: 'Alice Smith',
    customerPhone: '(555) 987-6543',
    lastMessage: 'Great, see you then.',
    unread: false,
    status: 'active',
    aiStatus: 'active',
    messages: [
      { id: 'm1', sender: 'bot', text: "Hi! This is Mike's automated assistant. I'm currently on a job. How can I help you today?", timestamp: new Date(Date.now() - 86400000) },
      { id: 'm2', sender: 'user', text: "I need a new faucet installed.", timestamp: new Date(Date.now() - 86000000) },
      { id: 'm3', sender: 'bot', text: "I can help with that. For a standard faucet install, we typically charge between $150-$200. Does that work for you?", timestamp: new Date(Date.now() - 85000000) },
      { id: 'm4', sender: 'user', text: "Yes that works.", timestamp: new Date(Date.now() - 84000000) },
      { id: 'm5', sender: 'bot', text: "Great. I have openings tomorrow at 10 AM or 1 PM. Which works?", timestamp: new Date(Date.now() - 83000000) },
      { id: 'm6', sender: 'user', text: "10 AM please.", timestamp: new Date(Date.now() - 82000000) },
      { id: 'm7', sender: 'bot', text: "You're booked for 10 AM tomorrow! Please pay the $50 deposit to confirm.", timestamp: new Date(Date.now() - 81000000) },
      { id: 'm8', sender: 'user', text: "Great, see you then.", timestamp: new Date(Date.now() - 80000000) },
    ]
  },
  {
    id: 'c2',
    customerName: 'Unknown (555-0000)',
    customerPhone: '(555) 000-0000',
    lastMessage: 'How much for a toilet replacement?',
    unread: true,
    status: 'active',
    aiStatus: 'active',
    messages: [
      { id: 'm9', sender: 'bot', text: "Hi! This is Mike's automated assistant. I'm currently on a job. How can I help you today?", timestamp: new Date() },
      { id: 'm10', sender: 'user', text: "How much for a toilet replacement?", timestamp: new Date() },
    ]
  }
];