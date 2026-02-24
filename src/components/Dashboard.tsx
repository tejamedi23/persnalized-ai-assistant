import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCalendar } from '../context/CalendarContext';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { MonthView } from './MonthView';
import { AgendaView } from './AgendaView';
import { AnalyticsView } from './AnalyticsView';
import { MiniCalendar } from './MiniCalendar';
import { EventModal } from './EventModal';
import { ConflictSidebar } from './ConflictSidebar';
import { MeetingFinderModal } from './MeetingFinderModal';
import { TravelView } from './TravelView';
import { SettingsModal } from './SettingsModal';
import { ResolutionModal } from './ResolutionModal';
import { AIChat } from './AIChat';
import { Timetable } from './Timetable';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Bell,
    LogOut,
    AlertTriangle,
    Sparkles,
    BarChart2,
    Settings,
    Mail,
    Plane,
    Layout
} from 'lucide-react';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarViewMode } from '../types';

export const Dashboard: React.FC = () => {
    const {
        viewMode,
        currentDate,
        rawEvents: events, // Use rawEvents if needed or events
        conflicts,
        isEventModalOpen,
        setIsEventModalOpen,
        isMeetingFinderOpen,
        setIsMeetingFinderOpen,
        isConflictSidebarOpen,
        setIsConflictSidebarOpen,
        addEvent,
        updateEvent,
        resolveConflict
    } = useCalendar();

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        if (selectedEvent && selectedEvent.id) {
            updateEvent({ ...eventData, id: selectedEvent.id });
        } else {
            addEvent(eventData);
        }
        setIsEventModalOpen(false);
        setSelectedEvent(undefined);
    };

    const handleSlotClick = (date: Date) => {
        setSelectedEvent({
            id: '',
            title: '',
            description: '',
            start: date,
            end: new Date(date.getTime() + 60 * 60 * 1000),
            type: 'meeting'
        });
        setIsEventModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-transparent">
            {/* View Area */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 relative overflow-hidden flex flex-col">
                    {viewMode === 'day' && <DayView currentDate={currentDate} events={events} onEventClick={handleEventClick} onSlotClick={handleSlotClick} />}
                    {viewMode === 'week' && <WeekView currentDate={currentDate} events={events} onEventClick={handleEventClick} onSlotClick={handleSlotClick} />}
                    {viewMode === 'month' && <MonthView currentDate={currentDate} events={events} onDateClick={handleSlotClick} />}
                    {viewMode === 'agenda' && <AgendaView currentDate={currentDate} events={events} onEventClick={handleEventClick} />}
                    {viewMode === 'timetable' && <Timetable />}
                    {viewMode === 'travel' && <TravelView />}
                </main>

                {/* Mini Calendar Sidebar (always visible on desktop) */}
                {['day', 'week', 'month', 'agenda', 'timetable'].includes(viewMode) && (
                    <aside className="w-80 border-l border-slate-100 bg-white hidden xl:flex flex-col shrink-0 z-10 p-6 overflow-y-auto custom-scrollbar">
                        <MiniCalendar />
                        <ConflictSidebar onClose={() => { }} />
                    </aside>
                )}
            </div>

            <AnimatePresence>
                {isConflictSidebarOpen && (
                    <div onClick={() => setIsConflictSidebarOpen(false)} className="fixed inset-0 bg-black/5 z-40 xl:hidden" />
                )}
            </AnimatePresence>

            <ResolutionModal
                isOpen={!!conflicts.length && isConflictSidebarOpen}
                conflict={conflicts[0] || null}
                events={events}
                onResolve={(eventId, newStart) => {
                    const event = events.find(e => e.id === eventId);
                    if (event) {
                        updateEvent({ ...event, start: newStart, end: new Date(newStart.getTime() + (event.end.getTime() - event.start.getTime())) });
                    }
                }}
                onClose={() => setIsConflictSidebarOpen(false)}
            />

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                    setSelectedEvent(undefined);
                }}
                onSave={handleSaveEvent}
                initialEvent={selectedEvent}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            <MeetingFinderModal
                isOpen={isMeetingFinderOpen}
                onClose={() => setIsMeetingFinderOpen(false)}
                onSelectSlot={(start, end) => {
                    setSelectedEvent({
                        id: '',
                        title: 'New Meeting',
                        description: 'Found via AI Meeting Finder',
                        start,
                        end,
                        type: 'meeting'
                    });
                    setIsEventModalOpen(true);
                    setIsMeetingFinderOpen(false);
                }}
            />
        </div>
    );
};
