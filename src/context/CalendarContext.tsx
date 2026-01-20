import React, { createContext, useContext, useEffect, useState } from 'react';
import { addWeeks, subWeeks, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent, User, Conflict, CalendarViewMode } from '../types';
import { generateSampleEvents } from '../utils/sampleData';
import { detectConflicts } from '../utils/conflictDetection';

type Theme = 'light' | 'dark' | 'system';

interface CalendarContextType {
    user: User | null;
    events: CalendarEvent[];
    currentDate: Date;
    conflicts: Conflict[];
    viewMode: CalendarViewMode;
    theme: Theme;
    setViewMode: (mode: CalendarViewMode) => void;
    setTheme: (theme: Theme) => void;
    login: (name: string, email: string) => void;
    logout: () => void;
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    updateEvent: (event: CalendarEvent) => void;
    deleteEvent: (id: string) => void;
    resolveConflict: (conflictId: string, adoptionEventId: string, newStart: Date) => void;
    next: () => void;
    prev: () => void;
    goToToday: () => void;
    setCurrentDate: (date: Date) => void;
    isEventModalOpen: boolean;
    setIsEventModalOpen: (open: boolean) => void;
    isMeetingFinderOpen: boolean;
    setIsMeetingFinderOpen: (open: boolean) => void;
    isConflictSidebarOpen: boolean;
    setIsConflictSidebarOpen: (open: boolean) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
    const [theme, setThemeState] = useState<Theme>('light');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isMeetingFinderOpen, setIsMeetingFinderOpen] = useState(false);
    const [isConflictSidebarOpen, setIsConflictSidebarOpen] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('calendar_user');
        const storedEvents = localStorage.getItem('calendar_events');
        const storedTheme = localStorage.getItem('calendar_theme') as Theme;

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (storedEvents) {
            try {
                const parsedEvents = JSON.parse(storedEvents).map((e: any) => ({
                    ...e,
                    start: new Date(e.start),
                    end: new Date(e.end),
                }));
                setEvents(parsedEvents);
            } catch (e) {
                console.error("Failed to parse calendar events from storage", e);
                localStorage.removeItem('calendar_events');
                setEvents(generateSampleEvents());
            }
        }

        if (storedTheme) {
            setThemeState(storedTheme);
        } else {
            setThemeState('system');
        }
    }, []);

    // Theme Logic
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('calendar_theme', newTheme);
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    // Save changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('calendar_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('calendar_user');
        }
    }, [user]);

    useEffect(() => {
        if (events.length > 0) {
            localStorage.setItem('calendar_events', JSON.stringify(events));

            const detectedConflicts = detectConflicts(events);
            setConflicts(detectedConflicts);
        }
    }, [events]);

    const login = (name: string, email: string) => {
        const newUser = { id: uuidv4(), name, email };
        setUser(newUser);

        const storedEvents = localStorage.getItem('calendar_events');
        if (!storedEvents) {
            const samples = generateSampleEvents();
            setEvents(samples);
            localStorage.setItem('calendar_events', JSON.stringify(samples));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('calendar_user');
    };

    const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = { ...eventData, id: uuidv4() };
        setEvents([...events, newEvent]);
    };

    const updateEvent = (updatedEvent: CalendarEvent) => {
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    };

    const deleteEvent = (id: string) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const resolveConflict = (_conflictId: string, adoptionEventId: string, newStart: Date) => {
        const eventToMove = events.find(e => e.id === adoptionEventId);
        if (!eventToMove) return;

        const duration = eventToMove.end.getTime() - eventToMove.start.getTime();
        const newEnd = new Date(newStart.getTime() + duration);

        updateEvent({
            ...eventToMove,
            start: newStart,
            end: newEnd
        });
    };

    const next = () => {
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === 'agenda') setCurrentDate(addDays(currentDate, 7)); // Agenda jumps a week
    };

    const prev = () => {
        if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === 'agenda') setCurrentDate(subDays(currentDate, 7));
    };

    const goToToday = () => setCurrentDate(new Date());

    return (
        <CalendarContext.Provider value={{
            user,
            events,
            currentDate,
            conflicts,
            viewMode,
            theme,
            setViewMode,
            setTheme,
            login,
            logout,
            addEvent,
            updateEvent,
            deleteEvent,
            resolveConflict,
            next,
            prev,
            goToToday,
            setCurrentDate,
            isEventModalOpen,
            setIsEventModalOpen,
            isMeetingFinderOpen,
            setIsMeetingFinderOpen,
            isConflictSidebarOpen,
            setIsConflictSidebarOpen
        }}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};
