import React, { useState } from 'react';
import { Bell, X, Check, Clock, AlertTriangle, Info, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: Date;
    type: 'meeting' | 'travel' | 'system' | 'alert';
    read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Meeting in 10m',
        message: 'Weekly Team Standup is starting soon in Room 302.',
        time: new Date(),
        type: 'meeting',
        read: false
    },
    {
        id: '2',
        title: 'Flight Delayed',
        message: 'Your flight BA2490 to London is delayed by 45 minutes.',
        time: new Date(Date.now() - 3600000),
        type: 'travel',
        read: false
    },
    {
        id: '3',
        title: 'Schedule Conflict',
        message: 'A new event overlaps with "Deep Work: API Design".',
        time: new Date(Date.now() - 7200000),
        type: 'alert',
        read: true
    }
];

export const NotificationCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex justify-end items-start p-4 pt-16 pointer-events-none">
                <div className="fixed inset-0 pointer-events-auto" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto mt-2"
                >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-slate-800 text-sm italic">Notification Center</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearAll}
                                className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline"
                            >
                                Clear All
                            </button>
                            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-medium">All caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-xl h-fit ${notification.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                                                notification.type === 'travel' ? 'bg-purple-100 text-purple-600' :
                                                    notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {notification.type === 'meeting' && <Clock className="w-4 h-4" />}
                                            {notification.type === 'travel' && <Calendar className="w-4 h-4" />}
                                            {notification.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                                            {notification.type === 'system' && <Info className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className="font-bold text-slate-800 text-sm truncate pr-4">{notification.title}</h4>
                                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{format(notification.time, 'h:mm a')}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full group-hover:hidden" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-50 bg-slate-50/50 text-center">
                        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                            View All History
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
