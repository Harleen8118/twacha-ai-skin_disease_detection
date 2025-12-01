import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Send, 
  Plus, 
  MessageSquare, 
  LogOut, 
  Activity, 
  Trash2,
  Menu,
  X,
  Paperclip,
  Camera
} from 'lucide-react';
import { AnalysisState, ChatSession, Message, SkinAnalysisResult } from '../types';
import { analyzeSkinImage, sendChatQuery, fileToBase64 } from '../services/geminiService';
import AnalysisView from './AnalysisView';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  // --- State Management ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [analysisState, setAnalysisState] = useState<AnalysisState>({ isLoading: false, error: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Effects ---

  // Load history from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('twacha_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('twacha_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [sessions, currentSessionId, analysisState.isLoading]);

  // --- Helpers ---

  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Consultation',
      messages: [],
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        // If we deleted the last one, create a new one immediately
        const freshSession: ChatSession = {
            id: Date.now().toString(),
            title: 'New Consultation',
            messages: [],
            lastUpdated: Date.now()
        };
        setSessions([freshSession]);
        setCurrentSessionId(freshSession.id);
      }
    }
  };

  const updateCurrentSessionMessages = (newMessages: Message[], title?: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: newMessages,
          title: title || session.title,
          lastUpdated: Date.now()
        };
      }
      return session;
    }));
  };

  // --- Camera Functions ---

  const startCamera = async () => {
    setIsCameraOpen(true);
    // Add a small delay to ensure modal is rendered
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setAnalysisState({ isLoading: false, error: "Could not access camera. Please check permissions." });
        setIsCameraOpen(false);
      }
    }, 100);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPreviewImage(dataUrl);
        stopCamera();
      }
    }
  };

  // --- Handlers ---

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const base64 = await fileToBase64(file);
      setPreviewImage(base64);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !previewImage) || !currentSessionId) return;

    const currentSession = getCurrentSession();
    if (!currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      image: previewImage || undefined,
      timestamp: Date.now()
    };

    // Update UI immediately with user message
    const updatedMessages = [...currentSession.messages, userMessage];
    
    // Update title if it's the first message
    let newTitle = currentSession.title;
    if (currentSession.messages.length === 0) {
      newTitle = inputText.slice(0, 30) || "Image Analysis";
    }

    updateCurrentSessionMessages(updatedMessages, newTitle);
    
    // Reset input state
    setInputText('');
    setPreviewImage(null);
    setAnalysisState({ isLoading: true, error: null });

    try {
      let assistantMessage: Message;

      if (userMessage.image) {
        // Handle Image Analysis
        const result = await analyzeSkinImage(userMessage.image);
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I've analyzed the image. Here are the detailed findings based on the Finetuned Qwen 2 VL model.",
          analysis: result,
          timestamp: Date.now()
        };
      } else {
        // Handle Text Chat
        const responseText = await sendChatQuery(currentSession.messages, userMessage.content);
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: Date.now()
        };
      }

      // Update with assistant response
      updateCurrentSessionMessages([...updatedMessages, assistantMessage]);
      setAnalysisState({ isLoading: false, error: null });

    } catch (error: any) {
      setAnalysisState({ isLoading: false, error: error.message || "Something went wrong." });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render ---

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[70vh] object-contain mx-auto" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-6 mt-8">
            <button 
              onClick={stopCamera}
              className="bg-slate-800 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={captureImage}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
            >
              <Camera size={20} />
              Capture Photo
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar History */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
               <ImageIcon className="text-white w-4 h-4" />
            </div>
            Twacha AI
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-3 px-4 rounded-xl transition-colors border border-indigo-200"
          >
            <Plus size={18} />
            New Consultation
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <h3 className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">History</h3>
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => {
                setCurrentSessionId(session.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`
                group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                ${currentSessionId === session.id ? 'bg-indigo-50 text-indigo-900 shadow-sm' : 'hover:bg-slate-50 text-slate-600'}
              `}
            >
              <MessageSquare size={18} className={currentSessionId === session.id ? 'text-indigo-600' : 'text-slate-400'} />
              <div className="flex-1 truncate text-sm font-medium">
                {session.title}
              </div>
              <button 
                onClick={(e) => deleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded text-slate-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white lg:bg-slate-50/50">
        
        {/* Header (Mobile Only / Simple) */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:hidden">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
             <Menu size={24} />
           </button>
           <span className="font-semibold text-slate-800">Twacha AI</span>
           <div className="w-8"></div> {/* Spacer for centering */}
        </header>

        {/* Messages Feed */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
        >
          {currentSession && currentSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-[-50px]">
              <div className="bg-indigo-100 p-6 rounded-full mb-6">
                <Activity size={48} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How can I help you?</h2>
              <p className="text-slate-500 max-w-md">
                Upload a clear image of a skin condition or ask me any dermatological questions. I use the Finetuned Qwen 2 VL model to assist you.
              </p>
            </div>
          ) : (
            currentSession?.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] lg:max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                  
                  {/* Message Bubble/Content */}
                  <div className={`
                    rounded-2xl p-4 shadow-sm 
                    ${msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none ml-auto' 
                      : 'bg-white border border-slate-100 rounded-bl-none text-slate-800'}
                  `}>
                    
                    {/* User Image Attachment */}
                    {msg.image && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img src={msg.image} alt="Upload" className="max-h-64 w-auto object-cover" />
                      </div>
                    )}
                    
                    {/* Text Content */}
                    {msg.content && (
                      <p className={`whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'text-indigo-50' : 'text-slate-600'}`}>
                        {msg.content}
                      </p>
                    )}

                    {/* Analysis Result (If Assistant & Present) */}
                    {msg.role === 'assistant' && msg.analysis && (
                      <div className="mt-4">
                        <AnalysisView result={msg.analysis} />
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {analysisState.isLoading && (
            <div className="flex justify-start w-full">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-slate-500 font-medium">Analyzing...</span>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {analysisState.error && (
             <div className="flex justify-center w-full my-4">
               <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium border border-red-100 flex items-center gap-2">
                 <Activity size={14} />
                 {analysisState.error}
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            {/* Image Preview in Input */}
            {previewImage && (
              <div className="mb-3 relative inline-block">
                <img src={previewImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all shadow-sm">
              <button 
                onClick={startCamera}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Use Camera"
              >
                <Camera size={20} />
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Attach Image"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={previewImage ? "Add a question about this image..." : "Describe symptoms or ask a follow-up question..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 resize-none py-3 max-h-32 min-h-[48px]"
                rows={1}
                style={{ height: 'auto' }}
              />
              
              <button 
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && !previewImage) || analysisState.isLoading}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Finetuned Qwen 2 VL Model can make mistakes. Consult a medical professional.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;