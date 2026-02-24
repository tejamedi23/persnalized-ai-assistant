import React, { useMemo } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { AlertTriangle, CheckCircle, X, ArrowRight, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { suggestAlternative } from '../utils/conflictDetection';

export const ConflictSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { conflicts, events, resolveConflict } = useCalendar();

    const stats = useMemo(() => {
        const critical = conflicts.filter(c => c.severity === 'critical').length;
        const warning = conflicts.filter(c => c.severity === 'warning').length;
        const tight = conflicts.filter(c => c.severity === 'tight').length;
        return [
            { name: 'Critical', value: critical, color: '#ef4444' },
            { name: 'Warning', value: warning, color: '#f59e0b' },
            { name: 'Tight', value: tight, color: '#3b82f6' },
        ].filter(s => s.value > 0);
    }, [conflicts]);

    const handleAutoResolve = (conflictId: string, eventId: string) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const newStart = suggestAlternative(event, events);

        if (newStart) {
            resolveConflict(conflictId, eventId, newStart);
        } else {
            alert('Could not find an automatic slot. Please move manually.');
        }
    };

    return (
        <div className="w-96 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl absolute right-0 top-0 z-50 transform transition-transform duration-300">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h2 className="font-semibold text-slate-800">Conflict Analytics</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full">
                    <X className="h-5 w-5 text-slate-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Status Card */}
                <div className={`${conflicts.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">Overall Status</span>
                        {conflicts.length > 0 ? (
                            <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                {conflicts.length} Issues Found
                            </span>
                        ) : (
                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Optimization 100%
                            </span>
                        )}
                    </div>
                    {conflicts.length === 0 ? (
                        <div className="flex items-center text-green-700 mt-2">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm font-medium">Schedule is clear!</span>
                        </div>
                    ) : (
                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Conflict List */}
                {conflicts.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Action Required
                        </h3>
                        {conflicts.map(conflict => {
                            const event1 = events.find(e => e.id === conflict.eventIds[0]);
                            const event2 = events.find(e => e.id === conflict.eventIds[1]);
                            if (!event1 || !event2) return null;

                            return (
                                <div key={conflict.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${conflict.severity === 'critical' ? 'text-red-500' :
                                            conflict.severity === 'warning' ? 'text-orange-500' : 'text-blue-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                {conflict.description}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {format(event1.start, 'EEE, h:mm a')}
                                            </p>

                                            <div className="mt-3 flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleAutoResolve(conflict.id, event1.id)}
                                                    className="flex-1 flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-bold rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                                                >
                                                    Move "{event1.title}"
                                                    <ArrowRight className="ml-1 h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="mt-2 text-[10px] text-slate-400 text-center">
                                                AI Suggestion: +30min ~ +2hrs
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
