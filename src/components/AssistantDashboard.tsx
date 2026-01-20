import React, { useState } from 'react';
import { Mail, Calendar, Plane, Search, Send, LayoutDashboard, Settings, User, Plus, ChevronLeft, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { EmailWorkspace } from './EmailWorkspace';
import { FlightSearch } from './FlightSearch';
import { Dashboard } from './Dashboard';
import { useCalendar } from '../context/CalendarContext';
import { format } from 'date-fns';

export const AssistantDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mail' | 'schedule' | 'travel'>('schedule');
    const [chatInput, setChatInput] = useState('');
    const {
        currentDate, next, prev, goToToday,
        setIsEventModalOpen, setIsMeetingFinderOpen, setIsConflictSidebarOpen,
        conflicts
    } = useCalendar();

    const tabs = [
        { id: 'mail', icon: Mail, label: 'Mail' },
        { id: 'schedule', icon: Calendar, label: 'Schedule' },
        { id: 'travel', icon: Plane, label: 'Travel' }
    ];

    return (
        <div className="flex h-screen w-full bg-[#0f172a] text-white overflow-hidden">
            <div className="bg-mesh" />

            {/* Sidebar */}
            <aside className="w-20 lg:w-64 glass-panel m-4 mr-0 p-4 flex flex-col items-center lg:items-stretch">
                <div className="flex items-center gap-3 px-4 mb-8">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl hidden lg:block tracking-tight">
                        Assistant
                    </span>
                </div>

                <div className="mb-8 hidden lg:block">
                    <button
                        onClick={() => setIsEventModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New</span>
                    </button>
                </div>

                <nav className="flex-1 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                activeTab === tab.id
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <tab.icon className={clsx("w-6 h-6 transform group-hover:scale-110 transition-transform")} />
                            <span className="font-medium hidden lg:block">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 hidden lg:block"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-2 pt-4 border-t border-white/5">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                        <Settings className="w-6 h-6" />
                        <span className="hidden lg:block">Settings</span>
                    </button>
                    <div className="flex items-center gap-3 px-4 py-3 border border-white/5 rounded-xl bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                            T
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="text-sm font-medium truncate">Teja Medi</p>
                            <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">Premium</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                {/* Header Context Switcher */}
                <header className="h-20 glass-panel px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        {activeTab === 'schedule' ? (
                            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-left-4">
                                <h2 className="text-xl font-bold min-w-[150px]">
                                    {format(currentDate, 'MMMM yyyy')}
                                </h2>
                                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                                    <button onClick={prev} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={goToToday} className="px-3 py-1 text-xs font-bold hover:bg-white/10 rounded-md transition-colors uppercase tracking-widest">
                                        Today
                                    </button>
                                    <button onClick={next} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 flex-1 max-w-2xl bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search or ask AI..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                />
                                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-gray-400 uppercase tracking-tighter">
                                    ⌘ K
                                </kbd>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {activeTab === 'schedule' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsMeetingFinderOpen(true)}
                                    className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm font-bold text-amber-500 hover:bg-amber-500/20 transition-all flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Meeting Finder
                                </button>
                                <button
                                    onClick={() => setIsConflictSidebarOpen(true)}
                                    className={clsx(
                                        "px-4 py-2 border rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                        conflicts.length > 0
                                            ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                    )}
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    {conflicts.length > 0 ? `${conflicts.length} Conflicts` : 'No Conflicts'}
                                </button>
                                <div className="w-px h-6 bg-white/10 mx-2" />
                                <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">Sync</button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Dynamic View Area */}
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {activeTab === 'schedule' && <Dashboard />}
                            {activeTab === 'mail' && <EmailWorkspace />}
                            {activeTab === 'travel' && <FlightSearch />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Right Chat Panel - Refined */}
            <aside className="w-80 glass-panel m-4 ml-0 p-5 hidden xl:flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg tracking-tight">AI Insights</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="AI Ready" />
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-y-auto scroll-hide">
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 font-mono">Recommendation</p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            I noticed you have a gap between 2 PM and 4 PM today. Would you like to schedule deep work?
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Quick Actions</p>
                        {[
                            "Flight to London",
                            "Summarize Unread",
                            "Meeting Conflicts"
                        ].map((action, i) => (
                            <button key={i} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm group flex items-center justify-between">
                                <span className="text-gray-400 group-hover:text-white transition-colors">{action}</span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-500/50 transition-colors text-sm"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};
