import React, { useState, useRef, useEffect } from 'react';
import { BusinessProfile, Service, Message } from '../types';
import { generateAIResponse } from '../services/geminiService';
import { Send, Bot, User, RefreshCw, AlertTriangle } from 'lucide-react';

interface SimulatorProps {
  profile: BusinessProfile;
  services: Service[];
}

const Simulator: React.FC<SimulatorProps> = ({ profile, services }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'bot',
      text: profile.autoReplyScript || "Hi! This is the automated assistant. How can I help?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    // Prepare history
    const history = messages.map(m => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
    }));

    try {
      const responseText = await generateAIResponse(userMsg.text, history, profile, services);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
         id: (Date.now() + 1).toString(),
         sender: 'system',
         text: 'Error generating response.',
         timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      id: 'init',
      sender: 'bot',
      text: profile.autoReplyScript || "Hi! This is the automated assistant. How can I help?",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* Left Info Panel */}
      <div className="w-full md:w-1/3 space-y-4">
        <div className="bg-[#161B2C] p-6 rounded-2xl shadow-xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-2">AI Simulator</h2>
            <p className="text-sm text-slate-400 mb-4">
              Test how The Crew responds to customers using the current settings.
            </p>
            <div className="text-xs bg-amber-900/10 text-amber-500 p-3 rounded-xl border border-amber-900/20 flex items-start">
                <AlertTriangle size={14} className="mt-0.5 mr-2 flex-shrink-0" />
                <span>
                    Ensure <code>process.env.API_KEY</code> is set to a valid Gemini API key.
                </span>
            </div>
        </div>

        <div className="bg-[#161B2C] p-6 rounded-2xl shadow-xl border border-white/5">
            <h3 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Current Context</h3>
            <div className="space-y-3 text-xs text-slate-500">
                <p><span className="font-bold text-slate-400">Business:</span> {profile.name}</p>
                <p><span className="font-bold text-slate-400">Services:</span> {services.length} configured</p>
                <p><span className="font-bold text-slate-400">Deposit:</span> ${profile.depositAmount}</p>
            </div>
             <button 
                onClick={handleReset}
                className="mt-6 w-full flex items-center justify-center py-3 border border-white/10 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
                <RefreshCw size={14} className="mr-2" /> Reset Chat
            </button>
        </div>
      </div>

      {/* Right Chat Interface */}
      <div className="flex-1 bg-[#161B2C] rounded-2xl shadow-2xl border border-white/5 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F19]" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-lg ${msg.sender === 'user' ? 'bg-[#1E293B] ml-3 text-slate-400' : 'bg-gradient-to-br from-orange-500 to-red-600 mr-3 text-white'}`}>
                    {msg.sender === 'user' ? <User size={14}/> : <Bot size={14}/>}
                </div>
                <div
                  className={`p-4 rounded-2xl shadow-sm text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#1E293B] text-slate-200 rounded-tr-none border border-white/5'
                      : msg.sender === 'system' 
                      ? 'bg-red-900/20 text-red-400 border border-red-900/30'
                      : 'bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-tl-none shadow-[0_4px_15px_rgba(249,115,22,0.3)] border border-orange-400/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
                <div className="flex max-w-[80%] flex-row">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 mr-3 shadow-lg">
                         <Bot size={14} className="text-white"/>
                    </div>
                    <div className="bg-[#161B2C] border border-white/5 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
             </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-[#161B2C] border-t border-white/5 flex space-x-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message as a customer..."
                className="flex-1 bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none text-white placeholder-slate-600 text-sm transition-colors"
                disabled={loading}
            />
            <button 
                type="submit" 
                className={`p-3 rounded-xl text-white transition-all ${loading || !input.trim() ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-gradient-to-r from-orange-500 to-red-600 shadow-lg hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]'}`}
                disabled={loading || !input.trim()}
            >
                <Send size={18} />
            </button>
        </form>
      </div>
    </div>
  );
};

export default Simulator;