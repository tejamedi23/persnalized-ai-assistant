import React, { useState } from 'react';
import { Mail, Calendar, Plane, Search, Send, LayoutDashboard, Settings, Plus, ChevronLeft, ChevronRight, Sparkles, AlertTriangle, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { EmailWorkspace } from './EmailWorkspace';
import { FlightSearch } from './FlightSearch';
import { Dashboard } from './Dashboard';
import { useCalendar } from '../context/CalendarContext';
import { format } from 'date-fns';

import { useAIInsights } from '../hooks/useAIInsights';

export const AssistantDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mail' | 'schedule' | 'travel'>('schedule');
    const [chatInput, setChatInput] = useState('');
    const {
        currentDate, next, prev, goToToday,
        setIsEventModalOpen, setIsMeetingFinderOpen, setIsConflictSidebarOpen,
        conflicts, events, addEvent
    } = useCalendar();

    const insight = useAIInsights(events, currentDate, (data) => addEvent(data));

    const tabs = [
        { id: 'schedule', icon: Calendar, label: 'Focus Schedule', color: 'bg-blue-600' },
        { id: 'mail', icon: Mail, label: 'Smart Inbox', color: 'bg-pink-500' },
        { id: 'travel', icon: Plane, label: 'Travel Plans', color: 'bg-amber-500' }
    ];

    return (
        <div className="flex h-screen w-full bg-brand-bg text-brand-text overflow-hidden font-sans">

            {/* Sidebar: Command Center */}
            <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 pt-6 pb-4 flex flex-col items-center lg:items-stretch shadow-soft z-20">
                <div className="px-2 lg:px-6 mb-8 flex items-center gap-3">
                    <div className="relative w-10 h-10 shadow-lg shadow-blue-500/20 rounded-xl overflow-hidden shrink-0 group cursor-pointer transition-transform hover:scale-105">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover p-1 bg-white" />
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="font-bold text-slate-800 tracking-tight leading-tight text-lg">Personalized<br />AI Assistant</h1>
                    </div>
                </div>

                <div className="px-4 mb-6 hidden lg:block">
                    <button
                        onClick={() => setIsEventModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Task</span>
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-2 lg:px-4">
                    <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Workspace</div>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                activeTab === tab.id
                                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
                            <tab.icon className={clsx("w-5 h-5 transition-colors", activeTab === tab.id ? "text-blue-600" : "group-hover:text-slate-700")} />
                            <span className="hidden lg:block">{tab.label}</span>
                            {tab.id === 'mail' && (
                                <span className="hidden lg:flex ml-auto bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">4</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-4 w-full">
                    <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl relative overflow-hidden group cursor-pointer hidden lg:block hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                            <Sparkles className="w-12 h-12" />
                        </div>
                        <div className="font-bold text-lg mb-1 relative z-10">Upgrade to Pro</div>
                        <p className="text-xs text-slate-300 mb-3 relative z-10">Unlock advanced AI analysis.</p>
                        <div className="text-[10px] font-bold bg-white/20 inline-block px-2 py-1 rounded relative z-10">GET PRO</div>
                    </div>
                    <div className="lg:hidden flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">TM</div>
                    </div>
                </div>
            </aside>

            {/* Main Stage */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />

                {/* Dynamic Header */}
                <header className="h-16 lg:h-20 px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-white/60">
                    <div className="flex items-center gap-4 flex-1">
                        {activeTab === 'schedule' ? (
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight min-w-[200px]">
                                    {format(currentDate, 'MMMM yyyy')}
                                </h2>
                                <div className="hidden md:flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                                    <button onClick={prev} className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={goToToday} className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors uppercase tracking-widest">
                                        Today
                                    </button>
                                    <button onClick={next} className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 flex-1 max-w-xl group">
                                <div className="relative w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Ask AI or search..."
                                        className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm group-hover:shadow-md"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-1">
                                        <kbd className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">⌘ K</kbd>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {activeTab === 'schedule' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsMeetingFinderOpen(true)}
                                    className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-sm font-bold hover:bg-amber-100 hover:border-amber-200 transition-all flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4 fill-current" />
                                    <span className="hidden sm:inline">Smart Finder</span>
                                </button>
                                <button
                                    onClick={() => setIsConflictSidebarOpen(true)}
                                    className={clsx(
                                        "px-4 py-2 border rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                        conflicts.length > 0
                                            ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    {conflicts.length > 0 && <span className="hidden sm:inline">{conflicts.length}</span>}
                                </button>
                            </div>
                        )}
                        <div className="w-px h-8 bg-slate-200 mx-2" />
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-sm hover:shadow-md transition-all">
                            TM
                        </button>
                    </div>
                </header>

                {/* View Content */}
                <div className="flex-1 overflow-hidden p-6 lg:p-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full bg-white/50 rounded-[32px] border border-white/60 p-1 shadow-sm backdrop-blur-sm"
                    >
                        <div className="h-full w-full bg-white rounded-[28px] overflow-hidden shadow-inner">
                            {activeTab === 'schedule' && <Dashboard />}
                            {activeTab === 'mail' && <EmailWorkspace />}
                            {activeTab === 'travel' && <FlightSearch />}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Right Panel: AI Lens */}
            <aside className="w-80 glass-panel m-4 ml-0 p-5 hidden xl:flex flex-col gap-6 border-l border-white/50 shadow-soft bg-white/90">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg tracking-tight text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        AI Lens
                    </h3>
                    <div className="flex items-center gap-2 px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-y-auto scroll-hide pr-1">
                    {/* Dynamic Insight Card */}
                    <AnimatePresence mode="wait">
                        {insight && (
                            <motion.div
                                key={insight.title}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className={clsx(
                                    "p-5 rounded-2xl border shadow-sm relative group overflow-hidden ring-1",
                                    insight.type === 'focus' ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 ring-blue-500/5" :
                                        insight.type === 'warning' ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 ring-amber-500/5" :
                                            insight.type === 'success' ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 ring-emerald-500/5" :
                                                "bg-white border-slate-100"
                                )}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                    <Calendar className={clsx("w-20 h-20",
                                        insight.type === 'focus' ? "text-blue-600" :
                                            insight.type === 'warning' ? "text-amber-600" :
                                                "text-emerald-600"
                                    )} />
                                </div>
                                <p className={clsx("text-[10px] font-bold uppercase tracking-widest mb-3 font-mono",
                                    insight.type === 'focus' ? "text-blue-600" :
                                        insight.type === 'warning' ? "text-amber-600" :
                                            "text-emerald-600"
                                )}>{insight.type === 'warning' ? 'Attention' : 'Insight'}</p>

                                <h4 className="font-bold text-slate-800 mb-1">{insight.title}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
                                    {insight.message}
                                </p>

                                {insight.action && (
                                    <button
                                        onClick={insight.action.onClick}
                                        className={clsx("text-xs font-bold px-3 py-2 rounded-lg shadow-sm border transition-colors flex items-center gap-2 w-fit",
                                            insight.type === 'focus' ? "bg-white text-blue-600 border-blue-100 hover:bg-blue-50" :
                                                insight.type === 'warning' ? "bg-white text-amber-600 border-amber-100 hover:bg-amber-50" :
                                                    "bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                        )}
                                    >
                                        {insight.action.label} <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Context Actions</p>
                        {[
                            { label: "Find flights to London", icon: Plane },
                            { label: "Summarize unread emails", icon: Mail },
                            { label: "Check schedule conflicts", icon: AlertTriangle }
                        ].map((action, i) => (
                            <button key={i} className="w-full text-left p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-sm group flex items-center justify-between group">
                                <span className="text-slate-600 group-hover:text-blue-600 transition-colors font-medium">{action.label}</span>
                                <action.icon className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

