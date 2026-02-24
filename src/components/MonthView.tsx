import React from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    format
} from 'date-fns';
import type { CalendarEvent } from '../types';
import { useCalendar } from '../context/CalendarContext';

interface MonthViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
    currentDate,
    events,
    onDateClick
}) => {
    const { conflicts } = useCalendar();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto">
                {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const dayEvents = events.filter(e => isSameDay(e.start, day));
                    // Sort by time
                    dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 cursor-pointer flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
                                }`}
                            onClick={() => onDateClick(day)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday(day)
                                    ? 'bg-blue-600 text-white'
                                    : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                                    }`}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="flex-1 space-y-1 overflow-hidden">
                                {dayEvents.slice(0, 3).map(event => {
                                    const hasConflict = conflicts.some(c => c.eventIds.includes(event.id));
                                    return (
                                        <div
                                            key={event.id}
                                            className={`text-[10px] truncate px-1.5 py-0.5 rounded border-l-2 ${hasConflict ? 'bg-red-50 border-red-500 text-red-700 font-bold' :
                                                event.type === 'meeting' ? 'bg-blue-50 border-blue-400 text-blue-700' :
                                                    event.type === 'personal' ? 'bg-orange-50 border-orange-400 text-orange-700' :
                                                        'bg-slate-100 border-slate-400 text-slate-700'
                                                }`}
                                        >
                                            {format(event.start, 'h:mma')} {event.title}
                                        </div>
                                    );
                                })}
                                {dayEvents.length > 3 && (
                                    <div className="text-[10px] text-slate-400 pl-1">
                                        + {dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
