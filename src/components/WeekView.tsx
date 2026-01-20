import React from 'react';
import {
    startOfWeek,
    addDays,
    format,
    isSameDay,
    isToday,
    differenceInMinutes,
    setHours,
} from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import type { CalendarEvent, EventType } from '../types';
import { useCalendar } from '../context/CalendarContext';

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onSlotClick: (date: Date) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const CELL_HEIGHT = 60; // 60px per hour

export const WeekView: React.FC<WeekViewProps> = ({
    currentDate,
    events,
    onEventClick,
    onSlotClick
}) => {
    const { conflicts } = useCalendar();
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const getEventStyle = (event: CalendarEvent) => {
        const startHour = event.start.getHours();
        const startMin = event.start.getMinutes();

        // Calculate top offset relative to 8 AM
        // (Hour - 8) * 60 + Minutes
        const minutesFrom8AM = (startHour - 8) * 60 + startMin;
        const top = minutesFrom8AM * (CELL_HEIGHT / 60);

        // Calculate height
        const durationMins = differenceInMinutes(event.end, event.start);
        const height = durationMins * (CELL_HEIGHT / 60);

        return {
            top: `${top}px`,
            height: `${height}px`,
        };
    };

    const getEventColor = (type: EventType, eventId: string) => {
        // Check for conflicts
        const conflict = conflicts.find(c => c.eventIds.includes(eventId));

        if (conflict) {
            if (conflict.severity === 'critical') {
                return 'bg-red-100 border-red-500 text-red-900 z-30 animate-pulse ring-2 ring-red-400';
            }
            if (conflict.severity === 'warning') {
                return 'bg-amber-100 border-amber-500 text-amber-900 z-30 ring-2 ring-amber-300';
            }
            if (conflict.severity === 'tight') {
                return 'bg-blue-50 border-blue-400 text-blue-900 border-l-4 border-l-orange-500';
            }
        }

        switch (type) {
            case 'meeting': return 'bg-blue-100 border-blue-600 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-900/70';
            case 'call': return 'bg-green-100 border-green-600 text-green-700 dark:bg-green-900/50 dark:border-green-500 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-900/70';
            case 'work': return 'bg-purple-100 border-purple-600 text-purple-700 dark:bg-purple-900/50 dark:border-purple-500 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-900/70';
            case 'personal': return 'bg-orange-100 border-orange-600 text-orange-700 dark:bg-orange-900/50 dark:border-orange-500 dark:text-orange-100 hover:bg-orange-200 dark:hover:bg-orange-900/70';
            default: return 'bg-gray-100 border-gray-600 text-gray-700 dark:bg-slate-700 dark:border-slate-500 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" />
                <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={`text-center py-3 border-r border-slate-100 dark:border-slate-700/50 last:border-r-0 ${isToday(day) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-800'
                                }`}
                        >
                            <div className={`text-xs font-semibold uppercase tracking-wide ${isToday(day) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                {format(day, 'EEE')}
                            </div>
                            <div className={`mt-1 text-2xl font-light ${isToday(day) ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'
                                }`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="flex" style={{ height: HOURS.length * CELL_HEIGHT }}>
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 font-medium text-right pr-2 pt-2 select-none">
                        {HOURS.map((hour) => (
                            <div key={hour} style={{ height: CELL_HEIGHT }}>
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    <div className="flex-1 grid grid-cols-7 relative">
                        {/* Horizontal Lines for Hours */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {HOURS.map((_, i) => (
                                <div
                                    key={i}
                                    className="border-b border-slate-100 dark:border-slate-700/30 w-full"
                                    style={{ height: CELL_HEIGHT, boxSizing: 'border-box' }}
                                />
                            ))}
                        </div>

                        {weekDays.map((day) => (
                            <div
                                key={day.toISOString()}
                                className={`relative border-r border-slate-100 dark:border-slate-700/30 last:border-r-0 z-10 h-full group ${isToday(day) ? 'bg-indigo-50/10 dark:bg-indigo-900/5' : ''
                                    }`}
                                onClick={() => {
                                    // Simple click to add
                                    onSlotClick(setHours(day, 9));
                                }}
                            >
                                {/* Render Events for this day */}
                                {events.filter(e => isSameDay(e.start, day)).map(event => {
                                    const hasConflict = conflicts.some(c => c.eventIds.includes(event.id));

                                    return (
                                        <div
                                            key={event.id}
                                            className={`absolute inset-x-1 rounded px-2 py-1 text-xs border-l-4 cursor-pointer transition-all shadow-sm ${getEventColor(event.type, event.id)}`}
                                            style={{
                                                ...getEventStyle(event),
                                                zIndex: hasConflict ? 30 : 20
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick(event);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold truncate">{event.title}</span>
                                                {hasConflict && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                                            </div>
                                            <div className="opacity-75 truncate text-[10px]">
                                                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Current Time Line if Today */}
                                {isToday(day) && (
                                    <div
                                        className="absolute w-full border-t-2 border-red-500 z-30 pointer-events-none"
                                        style={{
                                            top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) * (CELL_HEIGHT / 60)
                                                }px`
                                        }}
                                    >
                                        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
