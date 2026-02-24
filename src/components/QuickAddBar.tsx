import React, { useState } from 'react';
import { Search, Plus, Calendar, Clock, Type, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickAddBarProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (text: string) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ isOpen, onClose, onAdd }) => {
    const [input, setInput] = useState('');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                >
                    <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type to schedule... (e.g., 'Coffee with Jane tomorrow at 10am')"
                            className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-slate-800 placeholder:text-slate-400"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && input.trim()) {
                                    onAdd(input);
                                    setInput('');
                                    onClose();
                                } else if (e.key === 'Escape') {
                                    onClose();
                                }
                            }}
                        />
                        <div className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">Enter</div>
                    </div>

                    <div className="p-4 bg-slate-50 flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Smart Parsing Enabled</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Natural Language</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
