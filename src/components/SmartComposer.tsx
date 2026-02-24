import React, { useState } from 'react';
import {
    X,
    Sparkles,
    Send,
    Clock,
    ChevronDown,
    PenTool,
    CheckCircle,
    ArrowRight,
    User,
    AlignLeft,
    Zap
} from 'lucide-react';
import { useEmail } from '../context/EmailContext';
import type { EmailDraft, EmailTone } from '../types';

interface SmartComposerProps {
    isOpen: boolean;
    onClose: () => void;
    initialDraft?: Partial<EmailDraft>;
}

export const SmartComposer: React.FC<SmartComposerProps> = ({ isOpen, onClose, initialDraft }) => {
    const { sendEmail, saveDraft, scheduleEmail } = useEmail();
    const [draft, setDraft] = useState<EmailDraft>({
        id: initialDraft?.id || Math.random().toString(36).substr(2, 9),
        to: initialDraft?.to || '',
        subject: initialDraft?.subject || '',
        body: initialDraft?.body || '',
        category: initialDraft?.category || 'internal',
        tone: initialDraft?.tone || 'professional',
        lastSaved: new Date()
    });
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');

    const templates = [
        {
            name: 'Meeting Request',
            icon: Calendar,
            content: "Hi [Name],\n\nI'd like to schedule a meeting to discuss [Topic]. Are you available [Times from calendar]? \n\nBest regards,\n[Your Name]"
        },
        {
            name: 'Meeting Confirmation',
            icon: CheckCircle,
            content: "Hi [Name],\n\nThis confirms our meeting on [Date] at [Time] to discuss [Topic]. Looking forward to it!"
        },
        {
            name: 'Follow-up Email',
            icon: ArrowRight,
            content: "Hi [Name],\n\nThank you for meeting with me on [Date]. As discussed, I'm following up on [Action Items]."
        },
        {
            name: 'Client Update',
            icon: User,
            content: "Hi [Name],\n\nI'm writing to provide a quick update on [Project Name]. We have made significant progress on [Features], and our next steps involve [Next Steps]. \n\nTimeline: [Timeline]\n\nBest regards,"
        }
    ];

    const applyTemplate = (template: string) => {
        setDraft(prev => ({ ...prev, body: template }));
        setIsAIAssistantOpen(false);
    };

    const handleSend = () => {
        if (isScheduling && scheduleDate) {
            scheduleEmail(draft, new Date(scheduleDate));
        } else {
            sendEmail(draft);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex transition-all duration-500 ease-out border border-white/20 ${isAIAssistantOpen ? 'w-[1000px]' : 'w-[600px]'}`}>
                {/* Main Composer */}
                <div className="flex-1 flex flex-col min-w-[600px]">
                    <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <PenTool className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Compose Message</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Recipient</label>
                            <input
                                type="text"
                                placeholder="name@example.com"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                                value={draft.to}
                                onChange={e => setDraft(prev => ({ ...prev, to: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject</label>
                            <input
                                type="text"
                                placeholder="What's this about?"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all tracking-tight"
                                value={draft.subject}
                                onChange={e => setDraft(prev => ({ ...prev, subject: e.target.value }))}
                            />
                        </div>
                        <div className="flex-1 flex flex-col min-h-[300px] space-y-1">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
                                <button
                                    onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                                    className={`flex items-center space-x-2 text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all ${isAIAssistantOpen ? 'bg-blue-600 text-white shadow-lg shadow-indigo-200' : 'bg-blue-50 text-blue-600 dark:bg-indigo-900/20 dark:text-indigo-400 blue-100'}`}
                                >
                                    <Sparkles className="h-3 w-3" />
                                    <span>AI Assistant</span>
                                </button>
                            </div>
                            <textarea
                                placeholder="Start writing your masterpiece..."
                                className="flex-1 w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none leading-relaxed"
                                value={draft.body}
                                onChange={e => setDraft(prev => ({ ...prev, body: e.target.value }))}
                            />
                        </div>
                    </div>

                    <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <button
                                    onClick={() => setIsScheduling(!isScheduling)}
                                    className={`p-2 rounded-xl transition-all ${isScheduling ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                >
                                    <Clock className="h-5 w-5" />
                                </button>
                                {isScheduling && (
                                    <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Schedule Send</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border-none focus:ring-1 focus:ring-blue-500"
                                            value={scheduleDate}
                                            onChange={e => setScheduleDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                            <button className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl">
                                <AlignLeft className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => saveDraft(draft)}
                                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={handleSend}
                                className="px-6 py-2.5 bg-blue-600 blue-700 text-white rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none font-black flex items-center transition-all transform active:scale-95"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {isScheduling ? 'Schedule' : 'Send'}
                            </button>
                        </div>
                    </footer>
                </div>

                {/* AI Assistant Sidebar */}
                {isAIAssistantOpen && (
                    <div className="w-[400px] border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col">
                        <div className="flex items-center space-x-2 mb-8">
                            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Sparkles className="h-4 w-4 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Magic Writing</h3>
                        </div>

                        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                            <section>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 flex items-center">
                                    <ChevronDown className="h-3 w-3 mr-1" /> Templates
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {templates.map(t => (
                                        <button
                                            key={t.name}
                                            onClick={() => applyTemplate(t.content)}
                                            className="w-full text-left p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-indigo-400 transition-all group"
                                        >
                                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 mb-1">{t.name}</p>
                                            <p className="text-[10px] text-slate-400 line-clamp-1">{t.content}</p>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 flex items-center">
                                    <ChevronDown className="h-3 w-3 mr-1" /> Tone Adjuster
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {(['professional', 'friendly', 'brief', 'detailed'] as EmailTone[]).map(tone => (
                                        <button
                                            key={tone}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize border transition-all ${draft.tone === tone ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:border-blue-500'}`}
                                            onClick={() => setDraft(prev => ({ ...prev, tone }))}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                                <button className="w-full mt-4 flex items-center justify-center p-3 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-indigo-200 dark:shadow-none blue-700 transition-all">
                                    <Zap className="h-3.5 w-3.5 mr-2" />
                                    Rewrite in {draft.tone} tone
                                </button>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Help icons mapping
const Calendar = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
