import React from 'react';
import { X, Check, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarEvent, Conflict } from '../types';

interface ResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    conflict: Conflict | null;
    events: CalendarEvent[];
    onResolve: (eventId: string, newStart: Date) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
    isOpen,
    onClose,
    conflict,
    events,
    onResolve
}) => {
    if (!isOpen || !conflict) return null;

    const event1 = events.find(e => e.id === conflict.eventIds[0]);
    const event2 = events.find(e => e.id === conflict.eventIds[1]);

    if (!event1 || !event2) return null;

    const suggestions = [
        { label: `Move "${event1.title}" to +30m`, offset: 30, primary: true },
        { label: `Move "${event1.title}" to +60m`, offset: 60, primary: false },
        { label: `Move "${event2.title}" to tomorrow`, offset: 1440, primary: false },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Resolve Scheduling Conflict</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Conflicting Events</p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                                <span>{event1.title}</span>
                                <span className="text-slate-400">{format(event1.start, 'h:mm a')}</span>
                            </div>
                            <div className="border-t border-slate-200" />
                            <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                                <span>{event2.title}</span>
                                <span className="text-slate-400">{format(event2.start, 'h:mm a')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <p className="text-sm font-bold text-slate-700">AI-Powered Suggestions</p>
                        </div>
                        <div className="grid gap-3">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => onResolve(event1.id, addMinutes(event1.start, s.offset))}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${s.primary
                                            ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                                            : 'border-slate-100 bg-white hover:border-blue-100 hover:shadow-md'
                                        }`}
                                >
                                    <div>
                                        <p className={`text-sm font-bold ${s.primary ? 'text-blue-700' : 'text-slate-800'}`}>{s.label}</p>
                                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                                            <Clock className="w-3 h-3" />
                                            <span>New Time: {format(addMinutes(event1.start, s.offset), 'h:mm a')}</span>
                                        </div>
                                    </div>
                                    <Check className={`w-5 h-5 ${s.primary ? 'text-blue-500' : 'text-slate-200 group-hover:text-blue-400'} transition-colors`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Ignore for now
                    </button>
                    <button className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-lg">
                        Manual Drag Edit
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
