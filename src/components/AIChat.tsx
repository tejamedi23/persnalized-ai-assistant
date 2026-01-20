import React, { useState, useRef, useEffect } from 'react';
import {
    MessageSquare,
    X,
    Send,
    Sparkles,
    Trash2,
    User,
    Bot,
    ChevronRight,
    Zap,
    Clock,
    Calendar,
    Mail,
    Plane
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import type { AIAction } from '../types';
import { format } from 'date-fns';

export const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { messages, isTyping, sendMessage, clearChat, executeAction } = useAI();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleAction = (action: AIAction) => {
        executeAction(action);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-[100] group"
            >
                <MessageSquare className="h-7 w-7 group-hover:hidden" />
                <Sparkles className="h-7 w-7 hidden group-hover:block animate-pulse" />
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white fill-current" />
                </div>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[450px] h-[650px] bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
            {/* Header */}
            <header className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight leading-none">AI Assistant</h2>
                        <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Always Active</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={clearChat}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        title="Clear conversation"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20"
            >
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-slate-400 px-1">
                                {msg.role === 'assistant' ? (
                                    <>
                                        <Bot className="h-3 w-3" />
                                        <span>Assistant • {format(msg.timestamp, 'HH:mm')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>You • {format(msg.timestamp, 'HH:mm')}</span>
                                        <User className="h-3 w-3" />
                                    </>
                                )}
                            </div>

                            <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 font-medium'
                                }`}>
                                {msg.content}
                            </div>

                            {msg.actions && msg.actions.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {msg.actions.map(action => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleAction(action)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center transition-all transform active:scale-95 ${action.isPrimary
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                                                }`}
                                        >
                                            {action.type === 'schedule' && <Calendar className="h-3 w-3 mr-2" />}
                                            {action.type === 'email' && <Mail className="h-3 w-3 mr-2" />}
                                            {action.type === 'travel' && <Plane className="h-3 w-3 mr-2" />}
                                            {action.label}
                                            <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <footer className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-transparent focus-within:border-indigo-500 transition-all">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-center space-x-4 opacity-40">
                    <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase">Schedule</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase">Emails</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Plane className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase">Travel</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
