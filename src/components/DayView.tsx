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
                return 'bg-red-100 border-red-500 text-red-900 border-l-[6px] animate-pulse ring-2 ring-red-400';
            }
            if (conflict.severity === 'warning') {
                return 'bg-amber-100 border-amber-500 text-amber-900 border-l-[6px] ring-2 ring-amber-300';
            }
        }

        switch (type) {
            case 'meeting': return 'bg-blue-50 border-blue-500 text-blue-900 border-l-[6px] hover:bg-blue-100';
            case 'call': return 'bg-green-50 border-green-500 text-green-900 border-l-[6px] hover:bg-green-100';
            case 'work': return 'bg-purple-50 border-purple-500 text-purple-900 border-l-[6px] hover:bg-purple-100';
            case 'personal': return 'bg-orange-50 border-orange-500 text-orange-900 border-l-[6px] hover:bg-orange-100';
            default: return 'bg-gray-50 border-gray-500 text-gray-900 border-l-[6px] hover:bg-gray-100';
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
                            <div className="w-16 flex-shrink-0 text-xs text-slate-500 font-medium text-right pr-4 pt-2 -mt-2.5">
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                            <div className="flex-1 border-t border-slate-100" />
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
