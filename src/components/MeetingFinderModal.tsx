import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Check, ArrowRight, Sparkles, X, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useCalendar } from '../context/CalendarContext';
import { findAvailableSlots, type TimeSlot } from '../utils/aiScheduler';
// import { CalendarEvent } from '../types'; // Not used in this file directly if we trust context


interface MeetingFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSlot: (start: Date, end: Date) => void;
}

export const MeetingFinderModal: React.FC<MeetingFinderModalProps> = ({ isOpen, onClose, onSelectSlot }) => {
    const { events } = useCalendar();
    const [step, setStep] = useState<'config' | 'results'>('config');
    const [duration, setDuration] = useState(30);
    const [days, setDays] = useState(7);
    const [results, setResults] = useState<TimeSlot[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = () => {
        setIsSearching(true);
        // Simulate AI thinking time for effect
        setTimeout(() => {
            const slots = findAvailableSlots(events, duration, days);
            setResults(slots);
            setStep('results');
            setIsSearching(false);
        }, 800);
    };

    const handleBack = () => {
        setStep('config');
        setResults([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600">
                    <div className="flex items-center text-white">
                        <Sparkles className="h-5 w-5 mr-2" />
                        <h2 className="text-lg font-semibold">AI Scheduling Assistant</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {step === 'config' ? (
                            <motion.div
                                key="config"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Meeting Duration</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[15, 30, 45, 60].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setDuration(m)}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${duration === m
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {m} min
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setDuration(90)}
                                            className={`col-span-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${duration === 90
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            90 min
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Look Ahead (Days)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="14"
                                        value={days}
                                        onChange={(e) => setDays(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>Today</span>
                                        <span className="font-semibold text-indigo-600">{days} Days</span>
                                        <span>2 Weeks</span>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start">
                                    <Clock className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-indigo-900">Analysis Mode</h4>
                                        <p className="text-xs text-indigo-700 mt-1">
                                            We'll scan your working hours (9 AM - 5 PM) and prioritize slots that minimize fragmentation and maximize focus time.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg font-semibold flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                                            Analyzing Schedule...
                                        </>
                                    ) : (
                                        <>
                                            Find Available Times
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">Top Suggestions</h3>
                                    <button onClick={handleBack} className="text-sm text-indigo-600 hover:underline">
                                        Change Criteria
                                    </button>
                                </div>

                                {results.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4">
                                            <CalendarIcon className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500">No free slots found in this range.</p>
                                        <button onClick={handleBack} className="mt-2 text-indigo-600 font-medium hover:underline">Try modifying criteria</button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {results.map((slot, idx) => (
                                            <div
                                                key={idx}
                                                className="group border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white relative overflow-hidden"
                                                onClick={() => onSelectSlot(slot.start, slot.end)}
                                            >
                                                {/* Score indicator */}
                                                {idx === 0 && (
                                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg">
                                                        Best Match
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-bold text-slate-800 text-lg">
                                                                {format(slot.start, 'h:mm a')}
                                                            </span>
                                                            <span className="text-slate-400 text-sm">
                                                                - {format(slot.end, 'h:mm a')}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm font-semibold text-indigo-600 mt-0.5">
                                                            {format(slot.start, 'EEEE, MMM d')}
                                                        </div>
                                                    </div>
                                                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-start space-x-2">
                                                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs text-slate-500 leading-tight">
                                                        {slot.context}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
