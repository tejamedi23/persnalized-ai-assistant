import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Plane, Search, Send, LayoutDashboard, Settings, Plus, ChevronLeft, ChevronRight, Sparkles, AlertTriangle, Menu, BarChart2, Bell, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { EmailWorkspace } from './EmailWorkspace';
import { TravelSearch } from './TravelSearch';
import { Dashboard } from './Dashboard';
import { QuickAddBar } from './QuickAddBar';
import { NotificationCenter } from './NotificationCenter';
import { useCalendar } from '../context/CalendarContext';
import { format, startOfWeek, addDays } from 'date-fns';

import { useAI } from '../context/AIContext';
import { useAIInsights } from '../hooks/useAIInsights';
import { MessageSquareText } from 'lucide-react';

export const AssistantDashboard: React.FC = () => {
    const { proactiveSuggestions, executeAction } = useAI();
    const [activeTab, setActiveTab] = useState<'mail' | 'schedule' | 'travel'>('schedule');
    const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const {
        currentDate, next, prev, goToToday,
        viewMode, setViewMode,
        setIsEventModalOpen, setIsMeetingFinderOpen, setIsConflictSidebarOpen,
        conflicts, events, addEvent, user, login, logout
    } = useCalendar();

    const insight = useAIInsights(events, currentDate, (data) => addEvent(data));

    const tabs = [
        { id: 'schedule', icon: Calendar, label: 'Calendar', color: 'bg-blue-600' },
        { id: 'mail', icon: Mail, label: 'Email', color: 'bg-pink-500' },
        { id: 'travel', icon: Plane, label: 'Travel', color: 'bg-amber-500' },
    ];

    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsQuickAddOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex h-screen w-full bg-brand-bg text-brand-text overflow-hidden font-sans">

            {/* Sidebar: Command Center */}
            <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 pt-6 pb-4 flex flex-col items-center lg:items-stretch shadow-soft z-20">
                <div className="px-2 lg:px-6 mb-8 flex items-center gap-3">
                    <div className="relative w-10 h-10 shadow-lg shadow-blue-500/20 rounded-xl overflow-hidden shrink-0 group cursor-pointer transition-transform hover:scale-105">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover p-1 bg-white" />
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="font-bold text-slate-800 tracking-tight leading-tight text-xl">
                            AI<span className="text-blue-600">Assistant</span>
                        </h1>
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

                <div className="mt-auto px-4 w-full space-y-4">
                    {user ? (
                        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm hover:border-blue-200 transition-all cursor-pointer group" onClick={logout}>
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                                {user.name[0]}
                            </div>
                            <div className="hidden lg:block overflow-hidden">
                                <div className="text-sm font-bold text-slate-800 truncate">{user.name}</div>
                                <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                            </div>
                            <LogOut className="w-4 h-4 ml-auto text-slate-300 group-hover:text-red-500 transition-colors hidden lg:block" />
                        </div>
                    ) : (
                        <button
                            onClick={() => login('Teja Medi', 'tejamedi.edu@gmail.com')}
                            className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm group"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="hidden lg:block text-sm">Sign in with Google</span>
                        </button>
                    )}

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 shadow-sm relative overflow-hidden group cursor-pointer hidden lg:block hover:bg-slate-100 transition-colors duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                            <Sparkles className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="font-bold text-sm mb-1 relative z-10 text-slate-800">Support Center</div>
                        <p className="text-[10px] text-slate-500 mb-3 relative z-10">Access documentation and help.</p>
                        <div className="text-[10px] font-bold text-blue-600 inline-block px-2 py-1 bg-blue-50 rounded relative z-10">VIEW HELP</div>
                    </div>
                    {!user && (
                        <div className="lg:hidden flex justify-center">
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">?</div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Stage */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />

                {/* Dynamic Header */}
                <header className="h-16 lg:h-20 px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0 bg-white/50 backdrop-blur-md border-b border-slate-200">
                    <div className="flex items-center gap-8 flex-1">
                        {activeTab === 'schedule' ? (
                            <>
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight min-w-[240px]">
                                        {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMMM d')} - {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), 'd, yyyy')}
                                    </h2>
                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                        <button onClick={prev} className="p-1.5 hover:bg-white hover:shadow-sm text-slate-500 hover:text-blue-600 rounded-lg transition-all">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button onClick={goToToday} className="px-3 py-1 text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">
                                            Today
                                        </button>
                                        <button onClick={next} className="p-1.5 hover:bg-white hover:shadow-sm text-slate-500 hover:text-blue-600 rounded-lg transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* View Switcher */}
                                <div className="hidden md:flex items-center gap-6 border-l border-slate-200 pl-8">
                                    {['day', 'week', 'month', 'agenda', 'timetable'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode as any)}
                                            className={clsx(
                                                "text-sm font-semibold capitalize transition-all relative py-2",
                                                viewMode === mode ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {mode}
                                            {viewMode === mode && (
                                                <motion.div
                                                    layoutId="activeView"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
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
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
                            className={clsx(
                                "p-2.5 rounded-xl border transition-all flex items-center gap-2",
                                isAIDrawerOpen ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"
                            )}
                        >
                            <MessageSquareText className="w-5 h-5" />
                            <span className="text-xs font-bold hidden sm:block">AI Lens</span>
                        </motion.button>
                        <div className="w-px h-8 bg-slate-200 mx-1" />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm relative mr-2"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </motion.button>
                        <div className="w-px h-8 bg-slate-200 mx-2" />
                        {user && (
                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name[0]}
                            </button>
                        )}
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
                            {activeTab === 'travel' && <TravelSearch />}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* AI Assistant Drawer - overlay only */}
            <AnimatePresence>
                {isAIDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAIDrawerOpen(false)}
                            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[90]"
                        />
                        <motion.aside
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[380px] sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl z-[100] flex flex-col p-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-950">AI Assistant</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Active Insight</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAIDrawerOpen(false)}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto scroll-hide space-y-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Deep Intelligence</p>
                                    {proactiveSuggestions.map((suggestion) => (
                                        <motion.div
                                            key={suggestion.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm relative group overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                                <Sparkles className="w-12 h-12 text-blue-600" />
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-2">{suggestion.label}</h4>
                                            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Based on your activity, I recommend addressing this now.</p>
                                            <button
                                                onClick={() => executeAction(suggestion)}
                                                className={clsx("text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm border transition-all flex items-center gap-2 w-full justify-center group/btn",
                                                    suggestion.isPrimary ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg" : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                                                )}
                                            >
                                                Execute Action <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {proactiveSuggestions.length === 0 && (
                                        <div className="p-12 text-center text-slate-300">
                                            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Monitoring your workflow...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Universal Command</p>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Ask anything..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 pr-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium text-slate-800"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 shadow-inner">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assistant Status</p>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">I am analyzing your Gmail and Calendar events to provide real-time suggestions and time-zone conversions.</p>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <QuickAddBar
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                onAdd={(text) => {
                    // Placeholder for smart parsing
                    console.log('Smart Add:', text);
                    addEvent({
                        title: text,
                        description: 'Added via Quick Add',
                        start: new Date(),
                        end: new Date(Date.now() + 3600000),
                        type: 'meeting',
                        recurrence: 'none'
                    });
                }}
            />

            <NotificationCenter
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </div>
    );
};

