import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, SendHorizontal, Activity, Brain, Flame } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { Message } from '../../types';

interface BuddyChatProps {
  chatMessages: Message[];
  isBuddyTyping: boolean;
  onSendMessage: (text: string) => void;
}

const QUICK_PROMPTS = [
  { icon: <Activity size={16} />, text: "Analyze my progress" },
  { icon: <Flame size={16} />, text: "Give me a quick workout" },
  { icon: <Brain size={16} />, text: "I need motivation" }
];

export const BuddyChat: React.FC<BuddyChatProps> = ({
  chatMessages,
  isBuddyTyping,
  onSendMessage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isBuddyTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isBuddyTyping) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleQuickPrompt = (text: string) => {
    if (isBuddyTyping) return;
    onSendMessage(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-[calc(100vh-160px)] md:h-[calc(100vh-80px)] flex flex-col bg-vibrant-bg border-4 border-black rounded-[2.5rem] vibrant-shadow overflow-hidden relative"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b-4 border-black flex items-center justify-between bg-vibrant-coral relative overflow-hidden z-10">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-vibrant-sun rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="w-16 h-16 rounded-full bg-white border-4 border-black flex items-center justify-center relative shadow-[4px_4px_0px_#000]">
              <Zap size={32} className="text-vibrant-sun fill-vibrant-sun animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black italic leading-none tracking-tight text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">VITAL BUDDY</h3>
            <p className="text-xs uppercase font-black tracking-[0.25em] mt-1 text-white bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm inline-block">AI COACH</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_#fff]">
          <div className="w-2.5 h-2.5 rounded-full bg-vibrant-mint animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 bg-white/50 backdrop-blur-md scroll-smooth relative z-0"
      >
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center border-4 border-white shadow-xl rotate-12">
              <Zap size={48} className="text-vibrant-sun fill-vibrant-sun" />
            </div>
            <div>
              <h4 className="text-2xl font-black italic">NO MESSAGES YET</h4>
              <p className="font-bold text-sm uppercase tracking-widest mt-2">Start your journey today</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {chatMessages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i} 
              className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              {msg.role === 'model' && (
                 <div className="w-8 h-8 rounded-full bg-vibrant-coral border-2 border-black flex-shrink-0 mr-3 flex items-center justify-center mt-auto mb-2 shadow-[2px_2px_0px_#000]">
                   <Zap size={14} className="text-white fill-white" />
                 </div>
              )}
              
              <div className={cn(
                "relative group max-w-[80%] md:max-w-[70%] p-5 border-3 border-black rounded-3xl text-[15px] font-medium leading-relaxed vibrant-shadow-sm",
                msg.role === 'user' 
                  ? "bg-black text-white rounded-br-sm" 
                  : "bg-white text-black rounded-bl-sm"
              )}>
                {msg.role === 'model' ? (
                  <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:border-2 prose-pre:border-black prose-pre:rounded-xl">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
                
                {/* Time stamp indicator (optional aesthetic) */}
                <span className={cn(
                  "absolute -bottom-5 text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-50 transition-opacity",
                  msg.role === 'user' ? "right-2" : "left-2"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {msg.role === 'user' && (
                 <div className="w-8 h-8 rounded-full bg-vibrant-mint border-2 border-black flex-shrink-0 ml-3 flex items-center justify-center mt-auto mb-2 shadow-[2px_2px_0px_#000]">
                   <span className="text-black font-black text-xs">YOU</span>
                 </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isBuddyTyping && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-start items-end"
           >
             <div className="w-8 h-8 rounded-full bg-vibrant-coral border-2 border-black flex-shrink-0 mr-3 flex items-center justify-center mb-2 shadow-[2px_2px_0px_#000]">
               <Zap size={14} className="text-white fill-white" />
             </div>
             <div className="bg-white border-3 border-black px-6 py-4 rounded-[2rem] rounded-bl-sm flex gap-2 shadow-[4px_4px_0px_#000]">
               <motion.span 
                 animate={{ y: [0, -5, 0] }} 
                 transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                 className="w-2.5 h-2.5 bg-black rounded-full" 
               />
               <motion.span 
                 animate={{ y: [0, -5, 0] }} 
                 transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                 className="w-2.5 h-2.5 bg-black rounded-full" 
               />
               <motion.span 
                 animate={{ y: [0, -5, 0] }} 
                 transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                 className="w-2.5 h-2.5 bg-black rounded-full" 
               />
             </div>
           </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white border-t-4 border-black relative z-10">
        
        {/* Quick Prompts */}
        {chatMessages.length < 4 && !isBuddyTyping && (
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="flex items-center gap-2 bg-vibrant-bg/50 hover:bg-vibrant-bg border-2 border-black px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all hover:-translate-y-0.5 shadow-[2px_2px_0px_#000]"
              >
                {prompt.icon}
                {prompt.text}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative group">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isBuddyTyping}
            placeholder={isBuddyTyping ? "BUDDY IS THINKING..." : "TYPE YOUR MESSAGE..."}
            autoComplete="off"
            className="w-full py-4 sm:py-5 pl-6 pr-20 bg-vibrant-bg rounded-2xl border-4 border-black focus:outline-none focus:bg-white transition-all text-sm font-black uppercase italic tracking-tight placeholder:text-black/40 shadow-[4px_4px_0px_#000] focus:shadow-[6px_6px_0px_#000]"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isBuddyTyping}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-vibrant-sun rounded-xl text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all border-3 border-black shadow-[2px_2px_0px_#000]"
          >
            <SendHorizontal size={24} className="ml-1" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
