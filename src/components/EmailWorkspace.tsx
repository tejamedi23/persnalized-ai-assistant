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
            <div className="w-80 bg-slate-50 border-r border-slate-100 overflow-y-auto p-2 shrink-0">
                <div className="p-4 flex items-center justify-between">
                    <h2 className="font-bold tracking-tight text-slate-800">Inbox</h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-200">12 New</span>
                </div>
                <div className="space-y-1 mt-2">
                    {emails.map((email) => (
                        <button
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            className={`w-full text-left p-4 rounded-xl transition-all border ${selectedEmail?.id === email.id
                                ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100'
                                : 'border-transparent hover:bg-white hover:border-slate-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-sm ${selectedEmail?.id === email.id ? 'text-blue-700' : 'text-slate-700'}`}>{email.from}</span>
                                <span className="text-[10px] text-slate-400">{email.timestamp}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 truncate">{email.subject}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-1 opacity-80">{email.snippet}</p>
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
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-blue-200">
                                        {selectedEmail.from[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{selectedEmail.from}</p>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">To me • 2 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSummarize(selectedEmail)}
                                    disabled={isSummarizing}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-100 transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-sm"
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
                                        className="mb-8 p-6 rounded-2xl bg-blue-50 border border-blue-100 relative overflow-hidden group shadow-sm"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Sparkles className="w-12 h-12 text-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-xs uppercase tracking-widest font-mono">
                                            Executive Summary
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            {selectedEmail.summary}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {selectedEmail.content}
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
                                <button className="px-6 py-3 rounded-xl bg-white border border-slate-200 font-bold text-sm hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
                                    Draft
                                </button>
                                <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <div className="p-6 bg-slate-50 rounded-full">
                            <Mail className="w-12 h-12 stroke-[1.5]" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Select an email to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
};
