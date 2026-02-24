import React from 'react';
import {
    isSameDay,
    differenceInMinutes,
    setHours,
} from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import type { CalendarEvent, EventType } from '../types';
import { useCalendar } from '../context/CalendarContext';

interface DayViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onSlotClick: (date: Date) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const CELL_HEIGHT = 80; // 80px per hour for day view (taller than week)

export const DayView: React.FC<DayViewProps> = ({
    currentDate,
    events,
    onEventClick,
    onSlotClick
}) => {
    const { conflicts } = useCalendar();

    const getEventStyle = (event: CalendarEvent) => {
        const startHour = event.start.getHours();
        const startMin = event.start.getMinutes();

        const minutesFrom8AM = (startHour - 8) * 60 + startMin;
        const top = minutesFrom8AM * (CELL_HEIGHT / 60);

        const durationMins = differenceInMinutes(event.end, event.start);
        const height = durationMins * (CELL_HEIGHT / 60);

        return {
            top: `${top}px`,
            height: `${height}px`,
            left: '60px', // Offset for time column
            right: '10px'
        };
    };

    const getEventColor = (type: EventType, eventId: string) => {
        const conflict = conflicts.find(c => c.eventIds.includes(eventId));

        if (conflict) {
            if (conflict.severity === 'critical') {
                return 'bg-red-50 border-red-500 text-red-900 border-l-[6px] shadow-sm';
            }
            if (conflict.severity === 'warning') {
                return 'bg-amber-50 border-amber-500 text-amber-900 border-l-[6px] shadow-sm';
            }
        }

        switch (type) {
            case 'meeting': return 'bg-blue-50 border-blue-600 text-blue-900 border-l-[6px] hover:bg-blue-100/50';
            case 'call': return 'bg-slate-50 border-slate-600 text-slate-900 border-l-[6px] hover:bg-slate-100/50';
            case 'work': return 'bg-indigo-50 border-indigo-600 text-indigo-900 border-l-[6px] hover:bg-indigo-100/50';
            case 'personal': return 'bg-emerald-50 border-emerald-600 text-emerald-900 border-l-[6px] hover:bg-emerald-100/50';
            default: return 'bg-slate-50 border-slate-400 text-slate-900 border-l-[6px] hover:bg-slate-100/50';
        }
    };

    const dayEvents = events.filter(e => isSameDay(e.start, currentDate));

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="relative" style={{ height: HOURS.length * CELL_HEIGHT }}>
                    {/* Time Column & Lines */}
                    {HOURS.map((hour, i) => (
                        <div key={hour} className="absolute w-full flex" style={{ top: i * CELL_HEIGHT, height: CELL_HEIGHT }}>
                            <div className="w-16 flex-shrink-0 text-[10px] text-slate-400 font-bold text-right pr-4 pt-2 -mt-2.5 uppercase tracking-tighter">
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                            <div className="flex-1 border-t border-slate-200 relative">
                                {/* 15-min sub-lines */}
                                <div className="absolute inset-0 flex flex-col pointer-events-none">
                                    <div className="flex-1 border-b border-slate-50 outline-none" />
                                    <div className="flex-1 border-b border-slate-100 outline-none" />
                                    <div className="flex-1 border-b border-slate-50 outline-none" />
                                    <div className="flex-1" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Events */}
                    {dayEvents.map(event => {
                        const hasConflict = conflicts.some(c => c.eventIds.includes(event.id));
                        return (
                            <div
                                key={event.id}
                                className={`absolute rounded-r-md px-4 py-2 text-sm cursor-pointer transition-all shadow-sm ${getEventColor(event.type, event.id)}`}
                                style={{
                                    ...getEventStyle(event),
                                    zIndex: hasConflict ? 30 : 20
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(event);
                                }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold">{event.title}</span>
                                    {hasConflict && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                </div>
                                <div className="text-xs opacity-80 mb-2">
                                    {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                    {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {event.description && (
                                    <div className="text-xs opacity-70 line-clamp-2">
                                        {event.description}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Click areas */}
                    {HOURS.map((hour, i) => (
                        <div
                            key={`click-${hour}`}
                            className="absolute left-16 right-0 z-10 hover:bg-slate-50/50"
                            style={{ top: i * CELL_HEIGHT, height: CELL_HEIGHT }}
                            onClick={() => onSlotClick(setHours(currentDate, hour))}
                        />
                    ))}

                    {/* Current Time Line */}
                    {isSameDay(new Date(), currentDate) && (
                        <div
                            className="absolute w-full border-t-2 border-red-500 z-30 pointer-events-none left-16 right-0"
                            style={{
                                top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) * (CELL_HEIGHT / 60)}px`
                            }}
                        >
                            <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
