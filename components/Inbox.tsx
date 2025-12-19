import React, { useState, useRef, useEffect } from 'react';
import { Conversation, BusinessProfile } from '../types';
import { Send, Phone, User, CheckCircle, PhoneIncoming, Loader, Zap, Link as LinkIcon, DollarSign, MessageSquare, X, Mic, StopCircle, Brain, Sparkles, ChevronLeft, Hand, Bot, CreditCard, ArrowRight } from 'lucide-react';
import { generateQuickReplies, transcribeAudio, analyzeConversationStrategy, extractBookingDetails, generateVoicemailTranscript } from '../services/geminiService';
import { createNewConversation } from '../services/firebase';

interface InboxProps {
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  onBookAppointment: (customerName: string, service: string, date: string) => void;
  onPaymentSuccess: (customerName: string) => void;
  onToggleAiMode: (conversationId: string) => void;
  profile?: BusinessProfile;
}

const Inbox: React.FC<InboxProps> = ({ conversations, onSendMessage, onBookAppointment, onPaymentSuccess, onToggleAiMode, profile }) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);
  
  // New State for Features
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDepositSuggestion, setShowDepositSuggestion] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [depositModal, setDepositModal] = useState<{isOpen: boolean; message: string; type?: string}>({
    isOpen: false,
    message: '',
    type: 'mock'
  });

  const selectedConversation = conversations.find(c => c.id === selectedId);
  const isAiActive = selectedConversation?.aiStatus !== 'paused';

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);

  // Fetch quick replies when conversation changes or new message arrives
  useEffect(() => {
    if (selectedConversation) {
        const lastMsg = selectedConversation.messages[selectedConversation.messages.length - 1];
        if (lastMsg && lastMsg.sender === 'user') {
            generateQuickReplies(lastMsg.text).then((replies) => {
                setQuickReplies(replies);
                // Check for deposit intent in AI suggestions
                const hasDepositIntent = replies.some(r => 
                    r.toLowerCase().includes('deposit') || 
                    r.toLowerCase().includes('payment') || 
                    r.toLowerCase().includes('link')
                );
                setShowDepositSuggestion(hasDepositIntent);
            });
        } else {
            setQuickReplies([]);
            setShowDepositSuggestion(false);
        }
    }
  }, [selectedConversation, selectedConversation?.messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedId) {
      const messageToSend = newMessage;
      onSendMessage(selectedId, messageToSend);
      setNewMessage('');
      
      // Check if this message indicates a confirmed booking
      if (selectedConversation) {
          try {
              const details = await extractBookingDetails(messageToSend);
              if (details?.isBooking && details.date) {
                  onBookAppointment(
                      selectedConversation.customerName, 
                      details.service || 'Service Call', 
                      details.date
                  );
              }
          } catch (err) {
              console.error("Error analyzing booking details:", err);
          }
      }
    }
  };

  const handleQuickAction = (text: string) => {
     if (selectedId) {
        setNewMessage(text);
     }
  }

  const handleRequestDeposit = () => {
    const amount = profile?.depositAmount || 50;
    const provider = profile?.payment?.provider || 'mock';
    const currency = profile?.payment?.currency || 'USD';
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

    let link = "pay.link/deposit";
    if (provider === 'stripe') link = `invoice.stripe.com/${Math.random().toString(36).substr(2, 8)}`;
    if (provider === 'paypal') link = `paypal.me/mikesplumbing/${amount}`;

    setDepositModal({
      isOpen: true,
      message: `To confirm, please pay the ${symbol}${amount} deposit here: ${link}`,
      type: provider
    });
    setShowDepositSuggestion(false); // Clear suggestion if manually triggered or approved
  };

  const confirmDepositSend = () => {
    if (selectedId && depositModal.message) {
      onSendMessage(selectedId, depositModal.message);
      setDepositModal({ isOpen: false, message: '', type: 'mock' });

      // Simulate Webhook Listener for Payment
      if (selectedConversation) {
        const customerName = selectedConversation.customerName;
        const amount = profile?.depositAmount || 50;
        const currency = profile?.payment?.currency || 'USD';
        const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

        setTimeout(() => {
            // 1. Notify via Chat
            let providerName = depositModal.type === 'stripe' ? 'Stripe' : depositModal.type === 'paypal' ? 'PayPal' : 'Webhook';
            onSendMessage(selectedId, `💰 System: Payment of ${symbol}${amount}.00 received via ${providerName}.`);
            
            // 2. Update Appointment State
            onPaymentSuccess(customerName);
        }, 5000); // 5 second delay to simulate user paying
      }
    }
  };

  const handleMissedCallClick = async () => {
    setIsSimulatingCall(true);
    try {
        const transcription = await generateVoicemailTranscript();
        const newId = Date.now().toString();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        
        const newConversation: Conversation = {
          id: newId,
          customerName: `Missed Call ${randomNum}`,
          customerPhone: `(555) 555-${randomNum}`,
          lastMessage: 'Voicemail Received',
          unread: true,
          status: 'active',
          aiStatus: 'active',
          messages: [
            {
              id: Date.now().toString(),
              sender: 'bot',
              text: `📞 Missed Call from (555) 555-${randomNum}\n\nVoicemail Transcription:\n"${transcription}"`,
              timestamp: new Date()
            }
          ]
        };

        await createNewConversation(newConversation);
        setSelectedId(newId);
    } catch (error) {
        console.error("Failed to simulate missed call:", error);
    }
    setIsSimulatingCall(false);
  };

  // Audio Recording Logic
  const toggleRecording = async () => {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const result = reader.result as string;
            const base64data = result.split(',')[1];
            setIsTranscribing(true);
            const text = await transcribeAudio(base64data);
            setNewMessage(prev => (prev ? prev + " " + text : text));
            setIsTranscribing(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Deep Analysis Logic
  const triggerAnalysis = async () => {
      if (!selectedConversation) return;
      setShowAnalysis(true);
      setIsAnalyzing(true);
      
      const historyText = selectedConversation.messages
        .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const result = await analyzeConversationStrategy(historyText);
      setAnalysisResult(result);
      setIsAnalyzing(false);
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] flex bg-[#161B2C] rounded-2xl shadow-2xl border border-white/5 overflow-hidden backdrop-blur-sm">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 border-r border-white/5 flex flex-col bg-[#161B2C]">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0B0F19]/50">
          <h2 className="text-lg font-bold text-white tracking-tight">Inbox</h2>
          <button 
            onClick={handleMissedCallClick}
            disabled={isSimulatingCall}
            className="text-xs bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full flex items-center space-x-1 transition-all shadow-lg shadow-orange-500/10"
          >
            {isSimulatingCall ? <Loader size={14} className="animate-spin" /> : <PhoneIncoming size={14} />}
            <span className="font-medium">{isSimulatingCall ? 'Working...' : 'Simulate Call'}</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`p-5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all group ${
                selectedId === conv.id ? 'bg-white/5' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className={`font-bold text-sm ${conv.unread ? 'text-orange-400' : 'text-slate-200'} group-hover:text-white transition-colors`}>
                  {conv.customerName}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-medium">
                   {conv.messages[conv.messages.length - 1]?.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="flex justify-between items-center">
                 <p className="text-xs text-slate-400 truncate w-3/4 opacity-80">{conv.messages[conv.messages.length - 1]?.text}</p>
                 {conv.unread && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="hidden md:flex flex-col flex-1 w-2/3 bg-[#0B0F19] relative">
          
          {/* Slick Header */}
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#161B2C]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white shadow-lg">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{selectedConversation.customerName}</h3>
                <div className="flex items-center space-x-2">
                    <p className="text-xs text-slate-400">{selectedConversation.customerPhone}</p>
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${isAiActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isAiActive ? 'AI Active' : 'Manual Control'}
                    </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 items-center">
              <button
                onClick={() => onToggleAiMode(selectedConversation.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                    isAiActive 
                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' 
                    : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                }`}
              >
                {isAiActive ? (
                    <>
                        <Hand size={14} />
                        <span>Take Over</span>
                    </>
                ) : (
                    <>
                        <Bot size={14} />
                        <span>Resume AI</span>
                    </>
                )}
              </button>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <button 
                onClick={triggerAnalysis}
                className="p-2.5 rounded-full text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-all border border-transparent hover:border-indigo-500/30" 
                title="AI Strategy Analysis"
              >
                <Brain size={18} />
              </button>
              <button className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all" title="Call">
                <Phone size={18} />
              </button>
              <button className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all" title="Mark Resolved">
                <CheckCircle size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F19]" ref={scrollRef}>
            {selectedConversation.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                
                {/* AI Avatar */}
                {msg.sender === 'bot' && (
                    <div className="w-6 h-6 mr-2 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-orange-500/20 mt-auto mb-1">
                        AI
                    </div>
                )}

                <div className="max-w-[70%]">
                    {/* Bot Label */}
                    {msg.sender === 'bot' && <div className="text-[10px] text-slate-500 mb-1 text-right mr-1 font-medium tracking-wide uppercase">AI Assistant</div>}
                    
                    <div
                    className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                        msg.sender === 'user'
                        ? 'bg-[#1E293B] text-slate-200 rounded-bl-none border border-white/5' // Dark Charcoal Matte
                        : 'bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-br-none shadow-[0_4px_15px_rgba(249,115,22,0.3)] border border-orange-400/20' // Electric Gradient
                    }`}
                    >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className={`text-[10px] mt-1.5 opacity-60 font-medium ${msg.sender === 'user' ? 'text-left ml-1 text-slate-500' : 'text-right mr-1 text-slate-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Smart Action Bar (Frosted Glass) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#161B2C]/80 backdrop-blur-xl border-t border-white/10 z-20">
             
             {/* Paused Banner */}
             {!isAiActive && (
                 <div className="flex items-center justify-center pb-4 animate-fade-in">
                     <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center">
                        <Hand size={12} className="mr-1.5" /> AI Paused - You are in control
                     </span>
                 </div>
             )}

             {/* AI Intent Detection: Deposit Suggestion */}
             {showDepositSuggestion && (
                 <div className="mx-auto max-w-lg mb-4 animate-slide-up">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between shadow-lg shadow-emerald-500/5">
                        <div className="flex items-center space-x-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg">
                                <DollarSign size={16} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">AI Suggestion: Request Deposit</p>
                                <p className="text-[10px] text-emerald-200/70">Based on recent conversation context</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleRequestDeposit}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                            Approve <ArrowRight size={12} className="ml-1" />
                        </button>
                    </div>
                 </div>
             )}

             {/* AI Chips */}
             {quickReplies.length > 0 && isAiActive && !showDepositSuggestion && (
                 <div className="flex space-x-2 overflow-x-auto mb-3 pb-1 no-scrollbar">
                     <div className="flex items-center text-[10px] font-bold text-orange-400 mr-2 flex-shrink-0 uppercase tracking-wider">
                        <Sparkles size={12} className="mr-1" /> Suggested
                    </div>
                     {quickReplies.map((reply, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setNewMessage(reply)}
                            className="flex-shrink-0 px-3 py-1 bg-[#0B0F19] border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 text-slate-300 text-xs rounded-full transition-all"
                        >
                            {reply}
                        </button>
                    ))}
                 </div>
             )}

             <div className="flex items-end gap-2">
                 {/* Action Pills */}
                 <div className="hidden lg:flex flex-col gap-2 mr-2">
                     <button onClick={() => handleQuickAction("Here is a link to schedule: cal.com/mikes-plumbing")} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors border border-white/5">
                        <LinkIcon size={14} />
                     </button>
                     <button onClick={handleRequestDeposit} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors border border-white/5">
                        <DollarSign size={14} />
                     </button>
                 </div>

                 {/* Input Field */}
                <form onSubmit={handleSend} className="flex-1 bg-[#0B0F19] border border-white/10 rounded-2xl p-1.5 flex items-center shadow-inner">
                    <button
                        type="button"
                        onClick={toggleRecording}
                        className={`p-2 rounded-xl transition-all ${
                            isRecording 
                            ? 'bg-red-500/20 text-red-500 animate-pulse' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isRecording ? "Recording..." : isAiActive ? "Type to intervene..." : "Type a message..."}
                        className="flex-1 bg-transparent border-none text-white px-3 py-2 focus:outline-none placeholder-slate-600 text-sm"
                        disabled={isTranscribing}
                    />
                    <button
                        type="submit"
                        className="p-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all transform active:scale-95"
                    >
                        <Send size={16} />
                    </button>
                </form>
             </div>
          </div>

          {/* Deposit Modal - Darkened */}
          {depositModal.isOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/90 backdrop-blur-sm">
              <div className="bg-[#161B2C] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-scale-in">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3 text-white font-bold text-lg">
                    <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                      <DollarSign className="text-emerald-500" size={20} />
                    </div>
                    <span>Confirm Request</span>
                  </div>
                  <button onClick={() => setDepositModal({ isOpen: false, message: '', type: 'mock' })} className="text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  Send payment link for <strong className="text-white">{profile?.payment?.currency === 'USD' ? '$' : '€'}{profile?.depositAmount || 50}</strong> to {selectedConversation.customerName} via {depositModal.type === 'stripe' ? 'Stripe' : depositModal.type === 'paypal' ? 'PayPal' : 'Webhook'}.
                  <br/><br/>
                  <span className="bg-[#0B0F19] p-3 rounded-xl block text-xs font-mono text-slate-400 border border-white/5 break-all">
                    "{depositModal.message}"
                  </span>
                </p>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setDepositModal({ isOpen: false, message: '', type: 'mock' })}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors border border-white/5 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDepositSend}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center text-sm"
                  >
                    Send Link
                  </button>
                </div>
              </div>
            </div>
          )}

           {/* Analysis Modal - Darkened */}
           {showAnalysis && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/90 backdrop-blur-md">
                 <div className="bg-[#161B2C] border border-indigo-500/30 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden flex flex-col max-h-[80vh]">
                     <div className="p-4 bg-indigo-950/20 border-b border-indigo-500/20 flex justify-between items-center">
                         <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                             <Brain size={20} />
                             <span>Strategic Analysis</span>
                         </div>
                         <button onClick={() => setShowAnalysis(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                     </div>
                     <div className="p-6 overflow-y-auto">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                </div>
                                <p className="text-indigo-300 font-medium animate-pulse text-sm">Reasoning...</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-light">
                                    {analysisResult}
                                </div>
                            </div>
                        )}
                     </div>
                 </div>
             </div>
          )}

        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#0B0F19] text-slate-600 flex-col">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p className="font-medium">Select a conversation</p>
        </div>
      )}
    </div>
  );
};

export default Inbox;