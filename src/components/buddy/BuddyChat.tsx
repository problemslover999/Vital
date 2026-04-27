import React from 'react';
import { motion } from 'motion/react';
import { Zap, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { Message } from '../../types';

interface BuddyChatProps {
  chatMessages: Message[];
  isBuddyTyping: boolean;
  onSendMessage: (text: string) => void;
}

export const BuddyChat: React.FC<BuddyChatProps> = ({
  chatMessages,
  isBuddyTyping,
  onSendMessage
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-[calc(100vh-160px)] md:h-[calc(100vh-80px)] flex flex-col bg-white border-4 border-black rounded-[2.5rem] vibrant-shadow overflow-hidden"
    >
      <div className="p-8 border-b-4 border-black flex items-center justify-between bg-vibrant-coral">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white border-3 border-black flex items-center justify-center relative shadow-[2px_2px_0px_#000]">
            <Zap size={28} className="text-vibrant-sun fill-vibrant-sun" />
          </div>
          <div>
            <h3 className="text-xl font-black italic leading-none tracking-tight">VITAL BUDDY</h3>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] mt-1 text-white">HEALTH ADVISOR</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full border-2 border-black">
          <div className="w-2 h-2 rounded-full bg-vibrant-mint" />
          <span className="text-[10px] font-black uppercase">Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-vibrant-bg">
        {chatMessages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] md:max-w-[70%] p-6 border-3 border-black rounded-3xl text-sm font-medium leading-relaxed vibrant-shadow-sm",
              msg.role === 'user' 
                ? "bg-black text-white rounded-tr-none" 
                : "bg-white text-[#141414] rounded-tl-none"
            )}>
              {msg.role === 'model' ? (
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isBuddyTyping && (
           <div className="flex justify-start">
            <div className="bg-white border-3 border-black px-5 py-3 rounded-[1.5rem] flex gap-2 vibrant-shadow-sm">
              <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t-4 border-black">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('msg') as HTMLInputElement;
            onSendMessage(input.value);
            input.value = '';
          }}
          className="relative"
        >
          <input 
            name="msg"
            placeholder="WANT SOME INTEL? ASK ME..."
            className="w-full py-5 pl-8 pr-20 bg-vibrant-bg rounded-2xl border-3 border-black focus:outline-none focus:ring-4 focus:ring-vibrant-sun/30 transition-all text-sm font-black uppercase italic tracking-tight"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 border-black"
          >
            <Plus size={24} className="rotate-45" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
