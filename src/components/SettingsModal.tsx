import React from 'react';
import { X, Moon, Sun, Monitor, Bell, Clock, Calendar } from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useCalendar();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Theme Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                            <Monitor className="h-4 w-4 mr-2" />
                            Appearance
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'light'
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Sun className="h-6 w-6 mb-2" />
                                <span className="text-xs font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'dark'
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Moon className="h-6 w-6 mb-2" />
                                <span className="text-xs font-medium">Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'system'
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Monitor className="h-6 w-6 mb-2" />
                                <span className="text-xs font-medium">System</span>
                            </button>
                        </div>
                    </div>

                    {/* Preferences (Placeholder for now) */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar Preferences
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-slate-500 mr-3" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">24-hour time</span>
                                </div>
                                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-600 rounded-full cursor-not-allowed relative">
                                    <div className="h-5 w-5 bg-white rounded-full shadow-sm border border-slate-200 absolute left-0" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center">
                                    <Bell className="h-4 w-4 text-slate-500 mr-3" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Desktop Notifications</span>
                                </div>
                                <div className="w-10 h-5 bg-indigo-600 rounded-full cursor-pointer relative">
                                    <div className="h-5 w-5 bg-white rounded-full shadow-sm border border-slate-200 absolute right-0" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
