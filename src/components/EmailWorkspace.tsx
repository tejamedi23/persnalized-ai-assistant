import React, { useState, useEffect } from 'react';
import { getEmails, Email, summarizeEmail } from '../services/EmailService';
import { Mail, MessageSquare, Sparkles, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EmailWorkspace: React.FC = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        getEmails().then(setEmails);
    }, []);

    const handleSummarize = async (email: Email) => {
        setIsSummarizing(true);
        const summary = await summarizeEmail(email.content);
        setSelectedEmail({ ...email, summary });
        setIsSummarizing(false);
    };

    return (
        <div className="flex h-full gap-4">
            {/* Inbox List */}
            <div className="w-80 glass-panel overflow-y-auto p-2 shrink-0">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-bold tracking-tight">Inbox</h2>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">12 New</span>
                </div>
                <div className="space-y-1 mt-2">
                    {emails.map((email) => (
                        <button
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            className={`w-full text-left p-4 rounded-xl transition-all ${selectedEmail?.id === email.id ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm">{email.from}</span>
                                <span className="text-[10px] text-gray-500">{email.timestamp}</span>
                            </div>
                            <p className="text-xs font-medium text-gray-200 truncate">{email.subject}</p>
                            <p className="text-[11px] text-gray-400 truncate mt-1 opacity-70">{email.snippet}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reader Panel */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden">
                {selectedEmail ? (
                    <>
                        <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold tracking-tight mb-4">{selectedEmail.subject}</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
                                        {selectedEmail.from[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{selectedEmail.from}</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">To me • 2 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSummarize(selectedEmail)}
                                    disabled={isSummarizing}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 text-sm"
                                >
                                    <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
                                    {isSummarizing ? 'Analyzing...' : 'AI Summary'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto scroll-hide">
                            <AnimatePresence>
                                {selectedEmail.summary && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-8 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Sparkles className="w-12 h-12" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold text-xs uppercase tracking-widest font-mono">
                                            Executive Summary
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                            {selectedEmail.summary}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {selectedEmail.content}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-slate-900/40">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Quick reply or ask AI..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-colors text-sm"
                                    />
                                </div>
                                <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-all">
                                    Draft
                                </button>
                                <button className="px-6 py-3 rounded-xl bg-indigo-600 font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                        <Mail className="w-20 h-20 stroke-[1]" />
                        <p className="text-sm font-bold uppercase tracking-widest">Select an email to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
};
