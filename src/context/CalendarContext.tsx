import React, { createContext, useContext, useEffect, useState } from 'react';
import { addWeeks, subWeeks, addDays, subDays, addMonths, subMonths, startOfWeek } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent, User, Conflict, CalendarViewMode } from '../types';
import { generateSampleEvents } from '../utils/sampleData';
import { detectConflicts } from '../utils/conflictDetection';

type Theme = 'light' | 'dark' | 'system';

interface CalendarContextType {
    user: User | null;
    events: CalendarEvent[];
    rawEvents: CalendarEvent[];
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
    googleToken: string | null;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const expandRecurringEvents = (events: CalendarEvent[], _date: Date): CalendarEvent[] => {
    const expanded: CalendarEvent[] = [];
    const windowStart = startOfWeek(_date, { weekStartsOn: 1 });
    const windowEnd = addDays(windowStart, 30); // Expand for a month for safety

    events.forEach(event => {
        expanded.push(event);

        if (event.recurrence && event.recurrence !== 'none') {
            let nextStart = new Date(event.start);
            let nextEnd = new Date(event.end);

            // Limited expansion for demo/performance
            for (let i = 0; i < 52; i++) { // Up to a year
                if (event.recurrence === 'daily') {
                    nextStart = addDays(nextStart, 1);
                    nextEnd = addDays(nextEnd, 1);
                } else if (event.recurrence === 'weekly') {
                    nextStart = addDays(nextStart, 7);
                    nextEnd = addDays(nextEnd, 7);
                } else if (event.recurrence === 'monthly') {
                    nextStart = addMonths(nextStart, 1);
                    nextEnd = addMonths(nextEnd, 1);
                }

                if (nextStart > windowEnd) break;

                expanded.push({
                    ...event,
                    id: `${event.id}-occ-${i}`,
                    start: new Date(nextStart),
                    end: new Date(nextEnd),
                });
            }
        }
    });

    return expanded;
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... rest of provider ...
    const [user, setUser] = useState<User | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [googleToken, setGoogleToken] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
    const [theme, setThemeState] = useState<Theme>('light');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isMeetingFinderOpen, setIsMeetingFinderOpen] = useState(false);
    const [isConflictSidebarOpen, setIsConflictSidebarOpen] = useState(false);

    // Fetch Real Events from Google
    const fetchGoogleEvents = async (token: string) => {
        try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${token}`);

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn("Google token expired. Clearing session.");
                    setGoogleToken(null);
                    localStorage.removeItem('google_token');
                }
                return;
            }

            const data = await response.json();
            if (data.items) {
                const googleEvents = data.items.map((item: any) => ({
                    id: item.id,
                    title: item.summary || 'No Title',
                    description: item.description || '',
                    start: new Date(item.start.dateTime || item.start.date),
                    end: new Date(item.end.dateTime || item.end.date),
                    type: 'meeting'
                }));
                setEvents(googleEvents);
                localStorage.setItem('calendar_events', JSON.stringify(googleEvents));
            }
        } catch (error) {
            console.error("Failed to fetch Google events:", error);
        }
    };

    // Load from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('calendar_user');
        const storedEvents = localStorage.getItem('calendar_events');
        const storedTheme = localStorage.getItem('calendar_theme') as Theme;
        const storedToken = localStorage.getItem('google_token');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (storedToken) {
            setGoogleToken(storedToken);
            fetchGoogleEvents(storedToken);
        } else if (storedEvents) {
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
                setEvents([]); // Better than mock data if user is logged in
            }
        } else {
            // Only generate samples for true "New User" (unauthenticated)
            if (!storedToken) {
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
        if (googleToken) {
            localStorage.setItem('google_token', googleToken);
        } else {
            localStorage.removeItem('google_token');
        }
    }, [googleToken]);

    useEffect(() => {
        if (events.length > 0) {
            localStorage.setItem('calendar_events', JSON.stringify(events));

            const detectedConflicts = detectConflicts(events);
            setConflicts(detectedConflicts);
        }
    }, [events]);

    const login = (name: string, email: string, avatar?: string, token?: string) => {
        const newUser = {
            id: uuidv4(),
            name,
            email,
            avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff`
        };
        setUser(newUser);

        if (token) {
            setGoogleToken(token);
            fetchGoogleEvents(token);
        } else {
            const storedEvents = localStorage.getItem('calendar_events');
            if (!storedEvents) {
                const samples = generateSampleEvents();
                setEvents(samples);
                localStorage.setItem('calendar_events', JSON.stringify(samples));
            }
        }
    };

    const logout = () => {
        setUser(null);
        setGoogleToken(null);
        setEvents([]);
        localStorage.removeItem('calendar_user');
        localStorage.removeItem('google_token');
        localStorage.removeItem('calendar_events');
        localStorage.removeItem('calendar_emails');
        window.location.reload(); // Hard reset for clean state
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

    const expandedEvents = expandRecurringEvents(events, currentDate);

    return (
        <CalendarContext.Provider value={{
            user,
            events: expandedEvents,
            rawEvents: events, // Added to type soon
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
            setIsConflictSidebarOpen,
            googleToken
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
