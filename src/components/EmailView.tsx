import React, { useState } from 'react';
import {
    Search,
    Inbox,
    Send,
    FileText,
    Clock,
    Trash2,
    Star,
    Paperclip,
    MessageCircle,
    Plus,
    Tag,
    Calendar,
    CheckCircle,
    ArrowLeft,
    Sparkles,
    Zap,
    RefreshCw,
    MoreVertical
} from 'lucide-react';
import { useEmail } from '../context/EmailContext';
import { SmartComposer } from './SmartComposer';
import { format } from 'date-fns';
import type { EmailCategory } from '../types';

export const EmailView: React.FC = () => {
    const {
        emails, unreadCount, markAsRead, togglePriority,
        summarizeEmail, addToCalendar, extractActionItems, toggleActionItem
    } = useEmail();
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'scheduled'>('inbox');
    const [categoryFilter, setCategoryFilter] = useState<EmailCategory | 'all'>('all');
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const selectedEmail = emails.find(e => e.id === selectedEmailId);

    const filteredEmails = emails.filter(e => {
        const matchesSearch = e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.sender.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleEmailClick = (id: string) => {
        setSelectedEmailId(id);
        markAsRead(id);
    };

    const smartReplies = [
        { label: 'Accept meeting', action: 'generates acceptance' },
        { label: 'Decline politely', action: 'polite decline' },
        { label: 'Request more info', action: 'asks clarification' },
        { label: 'Acknowledge receipt', action: 'confirms received' }
    ];

    return (
        <div className="flex-1 bg-white dark:bg-slate-900 flex overflow-hidden h-full">
            {/* Sidebar Folder Navigation */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950">
                <div className="p-4">
                    <button
                        onClick={() => setIsComposerOpen(true)}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center justify-center font-bold transition-all"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Compose
                    </button>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1">
                    <button
                        onClick={() => setActiveFolder('inbox')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFolder === 'inbox' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                        <div className="flex items-center">
                            <Inbox className="h-4 w-4 mr-3" />
                            Inbox
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">{unreadCount}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFolder('sent')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFolder === 'sent' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                        <Send className="h-4 w-4 mr-3" />
                        Sent
                    </button>
                    <button
                        onClick={() => setActiveFolder('drafts')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFolder === 'drafts' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                        <FileText className="h-4 w-4 mr-3" />
                        Drafts
                    </button>
                    <button
                        onClick={() => setActiveFolder('scheduled')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFolder === 'scheduled' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                        <Clock className="h-4 w-4 mr-3" />
                        Scheduled
                    </button>
                    <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900">
                        <Trash2 className="h-4 w-4 mr-3" />
                        Trash
                    </button>

                    <div className="pt-8 pb-2">
                        <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Categories</h3>
                    </div>
                    {(['meeting', 'action', 'fyi', 'project', 'client', 'internal'] as EmailCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat === categoryFilter ? 'all' : cat)}
                            className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${categoryFilter === cat ? 'bg-slate-200 dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                        >
                            <Tag className={`h-3 w-3 mr-3 ${cat === 'meeting' ? 'text-blue-500' :
                                    cat === 'action' ? 'text-red-500' :
                                        cat === 'fyi' ? 'text-emerald-500' :
                                            cat === 'project' ? 'text-purple-500' :
                                                'text-orange-500'
                                }`} />
                            {cat}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-indigo-600/10 dark:bg-indigo-400/5 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Smart Insights</h4>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-300 leading-relaxed">
                            You have 3 meeting requests needing confirmation today.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Email List Section */}
            <main className="w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                <header className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search inbox..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredEmails.map(email => (
                        <div
                            key={email.id}
                            onClick={() => handleEmailClick(email.id)}
                            className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all ${selectedEmailId === email.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-l-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-bold truncate ${!email.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {email.sender.name}
                                </span>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                    {format(email.timestamp, 'HH:mm')}
                                </span>
                            </div>
                            <h4 className={`text-xs font-semibold truncate mb-1 ${!email.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {email.subject}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {email.body}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${email.category === 'meeting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                            email.category === 'action' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                        }`}>
                                        {email.category}
                                    </span>
                                    {email.attachments.length > 0 && <Paperclip className="h-3 w-3 text-slate-300" />}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); togglePriority(email.id); }}
                                    className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 ${email.isPriority ? 'text-amber-400' : 'text-slate-300'}`}
                                >
                                    <Star className={`h-3.5 w-3.5 ${email.isPriority ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredEmails.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Search className="h-10 w-10 mb-4 opacity-20" />
                            <p className="text-sm font-medium">No emails found</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Email Reading Detail Section */}
            <section className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-950/20">
                {selectedEmail ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Detail Header Actions */}
                        <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
                            <div className="flex items-center space-x-4">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                                    <Clock className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                                    <Tag className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center">
                                    <MessageCircle className="h-3.5 w-3.5 mr-2" />
                                    Reply
                                </button>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </header>

                        {/* Email Content Detail */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                            {selectedEmail.subject}
                                        </h1>
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                                                {selectedEmail.sender.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {selectedEmail.sender.name}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        &lt;{selectedEmail.sender.email}&gt;
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    to me • {format(selectedEmail.timestamp, 'MMM d, yyyy, HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center space-x-2">
                                        <Star className={`h-4 w-4 ${selectedEmail.isPriority ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Priority</span>
                                    </div>
                                </div>

                                {/* Smart Actions Bar */}
                                <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/10 p-2 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                    {!selectedEmail.summary ? (
                                        <button
                                            onClick={() => summarizeEmail(selectedEmail.id)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            <span>Summarize with AI</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 ml-2">AI Summary Active</span>
                                            <button
                                                onClick={() => summarizeEmail(selectedEmail.id)}
                                                className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-600"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-800 mx-2" />
                                    {selectedEmail.category === 'meeting' && (
                                        <button
                                            onClick={() => addToCalendar(selectedEmail.id)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black border border-indigo-100 dark:border-indigo-900/30 hover:bg-slate-50 transition-all"
                                        >
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>Add to Calendar</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => extractActionItems(selectedEmail.id)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        <span>Extract Action Items</span>
                                    </button>
                                </div>

                                {/* AI Summary Display */}
                                {selectedEmail.summary && (
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <Sparkles className="h-5 w-5 text-indigo-200" />
                                            <h3 className="text-sm font-black uppercase tracking-widest">Intelligent Summary</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase text-indigo-200">Main Points</h4>
                                                <ul className="space-y-2">
                                                    {selectedEmail.summary.mainPoints.map((pt: string, i: number) => (
                                                        <li key={i} className="text-xs flex items-start">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 mt-1 mr-2 flex-shrink-0" />
                                                            {pt}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase text-indigo-200 mb-2">Important Dates</h4>
                                                    <div className="space-y-2">
                                                        {selectedEmail.summary.dates.map((d: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between bg-white/10 p-2 rounded-xl border border-white/10">
                                                                <span className="text-xs font-medium truncate mr-2">{d.topic}</span>
                                                                <span className="text-[10px] font-black bg-white text-indigo-600 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                                                    {format(new Date(d.date), 'MMM d')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase text-indigo-200 mb-2">Decisions Needed</h4>
                                                    {selectedEmail.summary.decisionsNeeded.map((dec: string, i: number) => (
                                                        <p key={i} className="text-[11px] font-medium bg-purple-500/30 p-2 rounded-xl mb-1 italic">
                                                            "{dec}"
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Body */}
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[200px]">
                                    <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed pb-8">
                                        {selectedEmail.body}
                                    </div>

                                    {/* Action Items List */}
                                    {selectedEmail.actionItems.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xs font-black text-slate-400 uppercase flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Pending Action Items
                                                </h4>
                                                <span className="text-[10px] font-black text-indigo-600">
                                                    {selectedEmail.actionItems.filter(i => i.isCompleted).length} / {selectedEmail.actionItems.length}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {selectedEmail.actionItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => toggleActionItem(selectedEmail.id, item.id)}
                                                        className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group"
                                                    >
                                                        <div className={`h-5 w-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all ${item.isCompleted ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>
                                                            {item.isCompleted && <Zap className="h-3 w-3 text-white fill-current" />}
                                                        </div>
                                                        <span className={`text-sm ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white font-medium'}`}>
                                                            {item.text}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedEmail.attachments.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center">
                                                <Paperclip className="h-4 w-4 mr-2" />
                                                Attachments ({selectedEmail.attachments.length})
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {selectedEmail.attachments.map(att => (
                                                    <div key={att.id} className="flex items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
                                                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mr-4">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                                                                {att.filename}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-medium">
                                                                {(att.size / 1024).toFixed(0)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Smart Replies */}
                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-3">Suggested Replies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {smartReplies.map(reply => (
                                            <button
                                                key={reply.label}
                                                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                                            >
                                                {reply.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Inbox className="h-24 w-24 mb-6 opacity-5" />
                        <h2 className="text-xl font-black text-slate-200 dark:text-slate-800 tracking-tight">Select an email to read</h2>
                        <p className="text-sm font-medium opacity-50">Choose a message from the list to view its contents.</p>
                    </div>
                )}
            </section>

            <SmartComposer
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
            />
        </div>
    );
};
