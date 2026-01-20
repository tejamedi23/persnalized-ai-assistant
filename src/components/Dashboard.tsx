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
import { AIChat } from './AIChat';
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
        user,
        logout,
        viewMode,
        setViewMode,
        currentDate,
        next,
        prev,
        goToToday,
        events,
        conflicts,
        addEvent,
        updateEvent,
        isEventModalOpen,
        setIsEventModalOpen,
        isMeetingFinderOpen,
        setIsMeetingFinderOpen,
        isConflictSidebarOpen,
        setIsConflictSidebarOpen
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
        <div className="flex h-full bg-transparent overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* View Area */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative overflow-hidden flex flex-col">
                        {viewMode === 'day' && <DayView currentDate={currentDate} events={events} onEventClick={handleEventClick} onSlotClick={handleSlotClick} />}
                        {viewMode === 'week' && <WeekView currentDate={currentDate} events={events} onEventClick={handleEventClick} onSlotClick={handleSlotClick} />}
                        {viewMode === 'month' && <MonthView currentDate={currentDate} events={events} onDateClick={handleSlotClick} />}
                        {viewMode === 'agenda' && <AgendaView currentDate={currentDate} events={events} onEventClick={handleEventClick} />}
                        {viewMode === 'travel' && <TravelView />}
                        {viewMode === 'analytics' && <AnalyticsView />}
                    </div>

                    {/* Mini Calendar Sidebar (always visible on desktop) */}
                    {['day', 'week', 'month', 'agenda'].includes(viewMode) && (
                        <div className="w-64 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 hidden xl:flex z-10">
                            <MiniCalendar />
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {isConflictSidebarOpen && (
                    <ConflictSidebar onClose={() => setIsConflictSidebarOpen(false)} />
                )}
            </AnimatePresence>

            <AIChat />

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

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
        >
            <span className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'}>
                {icon}
            </span>
            <span className="ml-3 tracking-tight">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
        </button>
    );
};
