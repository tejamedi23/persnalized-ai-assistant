import {
    format,
    isSameDay,
    addDays
} from 'date-fns';
import { Clock, AlignLeft, Calendar as CalendarIcon } from 'lucide-react';
import type { CalendarEvent } from '../types';

interface AgendaViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
    currentDate,
    events,
    onEventClick
}) => {
    // Get next 14 days
    const daysToShow = Array.from({ length: 14 }, (_, i) => addDays(currentDate, i));

    // Sort all events
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-y-auto p-6 space-y-8">
            {daysToShow.map(day => {
                const dayEvents = sortedEvents.filter(e => isSameDay(e.start, day));

                if (dayEvents.length === 0) return null;

                return (
                    <div key={day.toISOString()} className="flex items-start">
                        {/* Date Column */}
                        <div className="w-32 flex-shrink-0 text-right pr-6 pt-1">
                            <div className="text-2xl font-bold text-slate-800">{format(day, 'd')}</div>
                            <div className="text-sm font-semibold text-slate-500 uppercase">{format(day, 'EEE')}</div>
                            <div className="text-xs text-slate-400 mt-1">{format(day, 'MMM yyyy')}</div>
                        </div>

                        {/* Events Column */}
                        <div className="flex-1 space-y-4 border-l-2 border-slate-100 pl-6 pb-6 relative">
                            {/* Dot on timeline */}
                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm" />

                            {dayEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                                    onClick={() => onEventClick(event)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center text-sm text-slate-500 mt-2 space-x-4">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1.5 text-slate-400" />
                                                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                                                </div>
                                                {event.description && (
                                                    <div className="flex items-center max-w-md truncate">
                                                        <AlignLeft className="h-4 w-4 mr-1.5 text-slate-400" />
                                                        <span className="truncate">{event.description}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${event.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                                                event.type === 'personal' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {event.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Empty State */}
            {daysToShow.every(day => sortedEvents.filter(e => isSameDay(e.start, day)).length === 0) && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                        <CalendarIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No upcoming events</h3>
                    <p className="text-slate-500">You're all clear for the next 2 weeks!</p>
                </div>
            )}
        </div>
    );
};
