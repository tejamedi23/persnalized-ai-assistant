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
    const { conflicts, updateEvent } = useCalendar();
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
                return 'bg-red-50 border-red-200 text-red-700 z-30 animate-pulse shadow-soft';
            }
            if (conflict.severity === 'warning') {
                return 'bg-amber-50 border-amber-200 text-amber-700 z-30 shadow-soft';
            }
            if (conflict.severity === 'tight') {
                return 'bg-slate-50 border-slate-200 text-slate-700 border-l-4 border-l-orange-400 shadow-soft';
            }
        }

        switch (type) {
            case 'meeting': return 'bg-blue-50 border-blue-200 text-blue-700 hover:shadow-soft hover:bg-blue-100/50';
            case 'call': return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:shadow-soft hover:bg-emerald-100/50';
            case 'work': return 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:shadow-soft hover:bg-indigo-100/50';
            case 'personal': return 'bg-orange-50 border-orange-200 text-orange-700 hover:shadow-soft hover:bg-orange-100/50';
            default: return 'bg-slate-50 border-slate-200 text-slate-700 hover:shadow-soft hover:bg-slate-100/50';
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-surface rounded-[24px] shadow-soft border border-slate-100 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
                <div className="w-16 flex-shrink-0 border-r border-slate-100" />
                <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={`text-center py-4 border-r border-slate-100 last:border-r-0 transition-colors ${
                                isToday(day) 
                                    ? 'bg-blue-50/50 relative overflow-hidden' 
                                    : 'bg-transparent'
                                }`}
                        >
                            {isToday(day) && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-b-full"></div>
                            )}
                            <div className={`text-[10px] font-black uppercase tracking-widest ${
                                isToday(day) ? 'text-blue-600' : 'text-slate-400'
                                }`}>
                                {format(day, 'EEE')}
                            </div>
                            <div className={`mt-1 text-2xl font-light tracking-tight ${
                                isToday(day) ? 'text-blue-700 font-medium' : 'text-slate-700'
                                }`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-brand-surface">
                <div className="flex" style={{ height: HOURS.length * CELL_HEIGHT }}>
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 font-bold tracking-wider text-right pr-3 pt-2 select-none uppercase">
                        {HOURS.map((hour) => (
                            <div key={hour} style={{ height: CELL_HEIGHT }} className="relative -top-2">
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    <div className="flex-1 grid grid-cols-7 relative">
                        {/* Horizontal Lines for Hours and 15-min intervals */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {HOURS.map((_, i) => (
                                <div
                                    key={i}
                                    className="relative w-full border-b border-slate-100"
                                    style={{ height: CELL_HEIGHT, boxSizing: 'border-box' }}
                                >
                                    {/* 15-min sub-lines */}
                                    <div className="absolute inset-0 flex flex-col">
                                        <div className="flex-1 border-b border-slate-50/50 outline-none" />
                                        <div className="flex-1 border-b border-slate-100/50 outline-none" />
                                        <div className="flex-1 border-b border-slate-50/50 outline-none" />
                                        <div className="flex-1" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {weekDays.map((day) => (
                            <div
                                key={day.toISOString()}
                                className={`relative border-r border-slate-100 last:border-r-0 z-10 h-full group transition-colors ${
                                    isToday(day) ? 'bg-blue-50/20' : 'hover:bg-slate-50/30'
                                    }`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const eventId = e.dataTransfer.getData('eventId');
                                    if (eventId && updateEvent) {
                                        const event = events.find(ev => ev.id === eventId);
                                        if (event) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const y = e.clientY - rect.top;
                                            const minutesFrom8AM = (y / CELL_HEIGHT) * 60;
                                            const totalMinutes = 8 * 60 + minutesFrom8AM;
                                            const hours = Math.floor(totalMinutes / 60);
                                            const mins = Math.floor((totalMinutes % 60) / 15) * 15; // Snap to 15 mins

                                            const newStart = new Date(day);
                                            newStart.setHours(hours, mins, 0, 0);
                                            const duration = event.end.getTime() - event.start.getTime();
                                            const newEnd = new Date(newStart.getTime() + duration);

                                            updateEvent({ ...event, start: newStart, end: newEnd });
                                        }
                                    }
                                }}
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
                                            className={`absolute inset-x-[3px] rounded-xl px-2.5 py-1.5 text-xs border cursor-pointer transition-all ${getEventColor(event.type, event.id)}`}
                                            style={{
                                                ...getEventStyle(event),
                                                zIndex: hasConflict ? 30 : 20
                                            }}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('eventId', event.id);
                                                e.dataTransfer.effectAllowed = 'move';
                                                e.currentTarget.style.opacity = '0.5';
                                            }}
                                            onDragEnd={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick(event);
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="font-bold tracking-tight leading-snug">{event.title}</span>
                                                {hasConflict && <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />}
                                            </div>
                                            <div className="opacity-70 text-[10px] font-medium mt-0.5">
                                                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Current Time Line if Today */}
                                {isToday(day) && (
                                    <div
                                        className="absolute w-full border-t border-red-500 z-30 pointer-events-none"
                                        style={{
                                            top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) * (CELL_HEIGHT / 60)}px`
                                        }}
                                    >
                                        <div className="absolute -left-[5px] -top-1.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-sm" />
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
