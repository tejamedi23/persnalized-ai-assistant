import React, { useState } from 'react';
import { Mail, MessageSquare, Sparkles, Clock, Star, AlertTriangle, X, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartComposer } from './SmartComposer';
import { useCalendar } from '../context/CalendarContext';
import { useEmail } from '../context/EmailContext';
import { EmailCategory } from '../types';

export const EmailWorkspace: React.FC = () => {
    const {
        emails, unreadCount, markAsRead, togglePriority,
        summarizeEmail: summarizeEmailContext, addToCalendar: addToCalendarContext
    } = useEmail();
    const { googleToken, setIsEventModalOpen } = useCalendar();

    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [activeCategory, setActiveCategory] = useState<EmailCategory | 'all'>('all');
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const selectedEmail = emails.find(e => e.id === selectedEmailId);

    const filteredEmails = activeCategory === 'all'
        ? emails
        : emails.filter(e => e.category === activeCategory);

    const handleSummarize = (emailId: string) => {
        summarizeEmailContext(emailId);
    };

    const handleAddToCalendar = (emailId: string) => {
        addToCalendarContext(emailId);
        setIsEventModalOpen(true);
    };

    const categories: { id: EmailCategory | 'all'; label: string; icon: any }[] = [
        { id: 'all', label: 'All', icon: Mail },
        { id: 'urgent', label: 'Urgent', icon: AlertTriangle },
        { id: 'meeting', label: 'Meetings', icon: Clock },
        { id: 'updates', label: 'Updates', icon: MessageSquare },
    ];

    return (
        <div className="flex h-full gap-4">
            {/* Sidebar with Categories */}
            <div className="w-64 bg-slate-50 border-r border-slate-100 flex flex-col p-4 shrink-0">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-bold tracking-tight text-slate-800 italic">Gmail Assistant</h2>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeCategory === cat.id
                                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                : 'text-slate-500 hover:bg-white hover:shadow-sm'
                                }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            <span className="text-sm font-bold capitalize">{cat.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Focus Mode</p>
                    <p className="text-[11px] text-blue-800 leading-tight">AI is filtering non-essential notifications.</p>
                </div>
            </div>

            {/* Inbox List */}
            <div className="w-96 bg-white border-r border-slate-50 overflow-y-auto p-2 shrink-0">
                <div className="p-4 flex items-center justify-between">
                    <h2 className="font-bold tracking-tight text-slate-800 text-lg uppercase italic font-mono">Inbox</h2>
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-xs text-slate-400 font-bold">{filteredEmails.length} Items</span>
                    </div>
                </div>
                <div className="space-y-2 mt-2">
                    {filteredEmails.map((email) => (
                        <button
                            key={email.id}
                            onClick={() => {
                                setSelectedEmailId(email.id);
                                markAsRead(email.id);
                            }}
                            className={`w-full text-left p-4 rounded-2xl transition-all border relative group ${selectedEmailId === email.id
                                ? 'bg-white border-blue-200 shadow-lg ring-1 ring-blue-50'
                                : 'border-transparent hover:bg-slate-50/50'
                                }`}
                        >
                            {!email.isRead && (
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-full" />
                            )}
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm ${selectedEmailId === email.id ? 'text-blue-700' : 'text-slate-800'}`}>{email.sender.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {email.timestamp instanceof Date ? email.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : email.timestamp}
                                </span>
                            </div>
                            <p className={`text-xs ${!email.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'} truncate`}>{email.subject}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-1 leading-relaxed">{email.body}</p>

                            <div className="mt-3 flex gap-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${email.category === 'urgent' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    email.category === 'meeting' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                    {email.category}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reader Panel */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {selectedEmail ? (
                    <>
                        <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-900">{selectedEmail.subject}</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-red-200">
                                        {selectedEmail.sender.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{selectedEmail.sender.name}</p>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">To me • {selectedEmail.sender.email} • {selectedEmail.timestamp instanceof Date ? selectedEmail.timestamp.toLocaleTimeString() : selectedEmail.timestamp}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSummarize(selectedEmail.id)}
                                    disabled={isSummarizing}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-100 transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-sm"
                                >
                                    <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
                                    {isSummarizing ? 'Analyzing...' : 'AI Summary'}
                                </button>
                                {selectedEmail.category === 'meeting' && (
                                    <button
                                        onClick={() => handleAddToCalendar(selectedEmail.id)}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-bold hover:bg-amber-100 transition-all shadow-sm text-sm"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Add to Calendar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto scroll-hide">
                            <AnimatePresence>
                                {selectedEmail.summary && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-8 p-6 rounded-2xl bg-blue-50 border border-blue-100 relative overflow-hidden group shadow-sm"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Sparkles className="w-12 h-12 text-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-xs uppercase tracking-widest font-mono">
                                            Executive Summary
                                        </div>
                                        <div className="text-sm text-slate-700 leading-relaxed font-medium">
                                            <ul className="list-disc ml-4 space-y-1">
                                                {selectedEmail.summary.mainPoints.map((p, i) => <li key={i}>{p}</li>)}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {selectedEmail.body}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Quick reply or ask AI..."
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsComposerOpen(true)}
                                    className="px-6 py-3 rounded-xl bg-white border border-slate-200 font-bold text-sm hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
                                >
                                    Reply
                                </button>
                                <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : !googleToken ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-6 p-12 text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-500/10">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Connect Your Google Account</h3>
                            <p className="text-sm font-medium leading-relaxed">To view and summarize your real emails, you need to sign in with Google. You are currently in simulated mode.</p>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">Please logout and select 'Sign in with Google'</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <div className="p-6 bg-slate-50 rounded-full">
                            <Mail className="w-12 h-12 stroke-[1.5]" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Select an email to begin</p>
                    </div>
                )}
            </div>

            <SmartComposer
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
                initialDraft={selectedEmail ? {
                    to: selectedEmail.sender.email,
                    subject: `Re: ${selectedEmail.subject}`,
                } : undefined}
            />
        </div>
    );
};
