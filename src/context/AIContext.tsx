import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChatMessage, AIAction, UserPreferences } from '../types';
import { useCalendar } from './CalendarContext';
import { useEmail } from './EmailContext';
import { useTravel } from './TravelContext';
import {
    format,
    addDays,
    startOfDay,
    isSameDay,
    addMinutes,
    isAfter
} from 'date-fns';

interface AIContextType {
    messages: ChatMessage[];
    isTyping: boolean;
    sendMessage: (content: string) => Promise<void>;
    clearChat: () => void;
    executeAction: (action: AIAction) => void;
    preferences: UserPreferences;
    updatePreferences: (prefs: Partial<UserPreferences>) => void;
    proactiveSuggestions: AIAction[];
    user: any;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { events, addEvent, conflicts, user } = useCalendar();
    const { unreadCount } = useEmail();
    const { trips } = useTravel();

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem('calendar_ai_messages');
            return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: "Hi Teja! I'm your AI Assistant. I can help you manage your calendar, draft emails, and track your trips. What can I do for you today?",
                    timestamp: new Date(),
                    actions: [
                        { id: 'a1', label: "What's on my schedule?", type: 'search', payload: { query: 'schedule today' } },
                        { id: 'a2', label: "Summarize unread emails", type: 'email', payload: { action: 'summarize_unread' } }
                    ]
                }
            ];
        } catch (e) {
            console.error("Failed to parse AI messages from storage", e);
            localStorage.removeItem('calendar_ai_messages');
            return [];
        }
    });

    const [isTyping, setIsTyping] = useState(false);
    const [lastTopic, setLastTopic] = useState<'calendar' | 'email' | 'travel' | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences>(() => {
        try {
            const saved = localStorage.getItem('calendar_ai_preferences');
            return saved ? JSON.parse(saved) : {
                preferredMeetingTime: 'morning',
                workStart: '09:00',
                workEnd: '18:00',
                travelBufferMinutes: 30,
                emailResponseStyle: 'professional'
            };
        } catch (e) {
            console.error("Failed to parse AI preferences from storage", e);
            localStorage.removeItem('calendar_ai_preferences');
            return {
                preferredMeetingTime: 'morning',
                workStart: '09:00',
                workEnd: '18:00',
                travelBufferMinutes: 30,
                emailResponseStyle: 'professional'
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('calendar_ai_messages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('calendar_ai_preferences', JSON.stringify(preferences));
    }, [preferences]);

    // Proactive Intelligence Check
    useEffect(() => {
        const checkProactive = async () => {
            const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            for (let i = 0; i < sortedEvents.length - 1; i++) {
                const end = new Date(sortedEvents[i].end);
                const nextStart = new Date(sortedEvents[i + 1].start);
                const diff = (nextStart.getTime() - end.getTime()) / (1000 * 60);

                if (diff < 5 && diff >= 0 && isSameDay(end, nextStart)) {
                    const lastAlert = localStorage.getItem('last_proactive_alert');
                    if (!lastAlert || isAfter(new Date(), addDays(new Date(lastAlert), 1))) {
                        addMessage({
                            id: `proactive-${Date.now()}`,
                            role: 'assistant',
                            content: `I noticed you have back-to-back meetings: "${sortedEvents[i].title}" and "${sortedEvents[i + 1].title}". Would you like me to add a 15-minute buffer?`,
                            timestamp: new Date(),
                            actions: [{ id: 'buf', label: 'Add Buffer', type: 'schedule', payload: { action: 'add_buffer', eventId: sortedEvents[i + 1].id } }]
                        });
                        localStorage.setItem('last_proactive_alert', new Date().toISOString());
                    }
                }
            }
        };
        const timer = setTimeout(checkProactive, 5000);
        return () => clearTimeout(timer);
    }, [events]);

    const [proactiveSuggestions, setProactiveSuggestions] = useState<AIAction[]>([]);

    // Proactive Intelligence Check
    useEffect(() => {
        const checkProactive = async () => {
            const suggestions: AIAction[] = [];

            // 1. Conflict detection
            if (conflicts.length > 0) {
                suggestions.push({
                    id: 'conf-suggest',
                    label: `Resolve ${conflicts.length} Conflicts`,
                    type: 'info',
                    payload: { action: 'open_conflicts', count: conflicts.length },
                    isPrimary: true
                });
            }

            // 2. Unread emails
            if (unreadCount > 5) {
                suggestions.push({
                    id: 'email-suggest',
                    label: 'Summarize Urgent Mail',
                    type: 'email',
                    payload: { action: 'summarize_urgent' }
                });
            }

            // 3. Travel check-in
            const upcomingTrips = trips.filter(t => {
                const start = new Date(t.startDate);
                const diff = (start.getTime() - new Date().getTime()) / (1000 * 60 * 60);
                return diff > 0 && diff < 24;
            });

            if (upcomingTrips.length > 0) {
                suggestions.push({
                    id: 'travel-suggest',
                    label: 'Check Flight Status',
                    type: 'travel',
                    payload: { tripId: upcomingTrips[0].id }
                });
            }

            setProactiveSuggestions(suggestions);
        };

        checkProactive();
        const interval = setInterval(checkProactive, 30000);
        return () => clearInterval(interval);
    }, [events, conflicts, unreadCount, trips]);

    const addMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    };

    const processCommand = async (content: string) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const query = content.toLowerCase();

        // Time Zone Awareness
        if (query.includes('timezone') || query.includes('pst') || query.includes('ist') || query.includes('gmt') || query.includes('london')) {
            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `🌐 **Time Zone Conversion Detected**\n\nI've analyzed your query and converted the times to your local IST zone:\n- **10:00 AM PST** ➔ **11:30 PM IST**\n- **4:00 PM GMT** ➔ **9:30 PM IST**\n\nWould you like me to schedule a meeting using these converted times?`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
            return;
        }

        let responseContent = "";
        let actions: AIAction[] = [];

        // 1. App-Specific Data Integration
        if (query.includes('next') && (query.includes('meeting') || query.includes('event'))) {
            setLastTopic('calendar');
            const now = new Date();
            const nextEvent = events.filter(e => isAfter(new Date(e.start), now))
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

            if (nextEvent) {
                responseContent = `Your next meeting is "${nextEvent.title}" at ${format(new Date(nextEvent.start), 'HH:mm')}. Would you like the location?`;
                actions.push({ id: 'loc1', label: 'View Details', type: 'info', payload: { eventId: nextEvent.id } });
            } else {
                responseContent = "You don't have any more meetings scheduled for today.";
            }
        }
        else if (query.includes('summarize') || query.includes('email') || query.includes('mail')) {
            setLastTopic('email');
            responseContent = `You have ${unreadCount} unread emails. Your most urgent one is from Sarah Miller about the Q3 Strategy. Should I draft a reply?`;
            actions.push({ id: 'email-sum', label: 'Summarize Urgent', type: 'email', payload: { action: 'summarize_urgent' }, isPrimary: true });
        }
        else if (query.includes('travel') || query.includes('flight') || query.includes('trip')) {
            setLastTopic('travel');
            const trip = trips[0];
            if (trip) {
                responseContent = `Your trip to ${trip.destination} is scheduled for ${format(new Date(trip.startDate), 'MMM do')}. I can check the flight status or local weather.`;
                actions.push({ id: 'tr1', label: 'Check Status', type: 'travel', payload: { tripId: trip.id } });
            } else {
                responseContent = "No upcoming trips found. Want to search for a new destination?";
                actions.push({ id: 'tr3', label: 'Search Travel', type: 'travel', payload: { action: 'open_search' }, isPrimary: true });
            }
        }
        // 2. Timetable related
        else if (query.includes('timetable') || query.includes('class') || query.includes('lecture')) {
            responseContent = "I've organized your weekly timetable. You can see your full commitment block in the dedicated Timetable view.";
            actions.push({ id: 'tt1', label: 'Open Timetable', type: 'schedule', payload: { action: 'switch_to_timetable' }, isPrimary: true });
        }
        // 3. User Identity Integration
        else if (query.includes('who am i') || query.includes('my profile')) {
            if (user) {
                responseContent = `You are logged in as **${user.name}** (${user.email}). You're currently on the Pro Plan.`;
            } else {
                responseContent = "You're currently browsing as a guest. Please sign in with Google to sync your personal assistant!";
                actions.push({ id: 'login-suggest', label: 'Sign in with Google', type: 'info', payload: { action: 'login' }, isPrimary: true });
            }
        }
        // 4. General Knowledge / Universal Assistant (Simulated)
        else if (query.includes('weather')) {
            responseContent = "It's currently 22°C and sunny in your location. Perfect weather for that focus block you have later!";
        }
        else if (query.includes('hello') || query.includes('hi')) {
            responseContent = user ? `Hi ${user.name.split(' ')[0]}! I'm your Personalized AI Assistant. How can I help you optimize your day?` : "Hello! I'm your Personalized AI Assistant. Please sign in to get started, or ask me anything!";
        }
        else {
            // General "Universal" response for anything else
            responseContent = `I've looked into "${content}". While I'm still expanding my knowledge for specific topics, I can help you manage your Google ecosystem data or find information related to your productivity! Try asking about your emails or schedule.`;
        }

        addMessage({
            id: Math.random().toString(36).substring(2, 9),
            role: 'assistant',
            content: responseContent,
            timestamp: new Date(),
            actions
        });

        setIsTyping(false);
    };

    const sendMessage = async (content: string) => {
        addMessage({
            id: Math.random().toString(36).substr(2, 9),
            role: 'user',
            content,
            timestamp: new Date()
        });
        await processCommand(content);
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem('calendar_ai_messages');
    };

    const executeAction = (action: AIAction) => {
        if (action.type === 'schedule') {
            // Logic for scheduling actions
        } else if (action.type === 'email') {
            // Logic for email actions
        }
        // Add more action handlers as needed
    };

    const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
        setPreferences(prev => ({ ...prev, ...newPrefs }));
    };

    return (
        <AIContext.Provider value={{
            messages,
            isTyping,
            sendMessage,
            clearChat,
            executeAction,
            preferences,
            updatePreferences,
            proactiveSuggestions,
            user
        }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};
