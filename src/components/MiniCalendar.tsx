import React from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

export const MiniCalendar: React.FC = () => {
    const { currentDate, setCurrentDate, events } = useCalendar();

    // We want the mini calendar to show the MONTH of the current view, 
    // but maybe standalone navigation?
    // Usually mini calendar navigates the main view.

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentDate(addMonths(currentDate, 1));
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                    {format(currentDate, 'MMMM yyyy')}
                </h3>
                <div className="flex space-x-1">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold text-slate-400">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const dayEventsCount = events.filter(e => isSameDay(e.start, day)).length;
                    const isSelected = isSameDay(day, currentDate);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setCurrentDate(day)}
                            className={`
                                h-7 w-7 rounded-full flex items-center justify-center text-xs relative transition-all
                                ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-700'}
                                ${!isCurrentMonth && !isSelected ? 'text-slate-300' : ''}
                                ${isToday(day) && !isSelected ? 'text-indigo-600 font-bold bg-indigo-50' : ''}
                            `}
                        >
                            {format(day, 'd')}

                            {/* Density Dots */}
                            {dayEventsCount > 0 && !isSelected && (
                                <div className="absolute bottom-0.5 flex space-x-0.5">
                                    <div className={`h-1 w-1 rounded-full ${isCurrentMonth ? 'bg-indigo-400' : 'bg-indigo-200'}`} />
                                    {dayEventsCount > 2 && <div className={`h-1 w-1 rounded-full ${isCurrentMonth ? 'bg-indigo-400' : 'bg-indigo-200'}`} />}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
