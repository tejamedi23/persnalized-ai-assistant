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
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { events, addEvent, conflicts } = useCalendar();
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

    const addMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    };

    const processCommand = async (content: string) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const query = content.toLowerCase();
        let responseContent = "I'm not sure how to help with that yet. I'm still learning!";
        let actions: AIAction[] = [];

        // 1. Contextual Follow-up (Multi-turn)
        if ((query.includes('what time') || query.includes('when')) && lastTopic === 'calendar') {
            const today = new Date();
            const nextEvent = events.filter(e => isAfter(new Date(e.start), today))[0];
            if (nextEvent) {
                responseContent = `The next one is "${nextEvent.title}" at ${format(new Date(nextEvent.start), 'HH:mm')}.`;
            } else {
                responseContent = "You don't have any more meetings scheduled for today.";
            }
        }
        // 2. Calendar Queries
        else if (query.includes('schedule') || query.includes('today') || query.includes('meetings') || query.includes('busy')) {
            setLastTopic('calendar');
            const today = new Date();
            const todaysEvents = events.filter(e => isSameDay(new Date(e.start), today));

            if (todaysEvents.length === 0) {
                responseContent = "Your schedule is clear for today! You have no meetings.";
            } else {
                responseContent = `You have ${todaysEvents.length} events today:\n` +
                    todaysEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .map(e => `- ${format(new Date(e.start), 'HH:mm')}: ${e.title}`).join('\n');

                if (conflicts.length > 0) {
                    responseContent += `\n\n⚠️ Also, I detected ${conflicts.length} conflict(s). Want me to show them?`;
                    actions.push({ id: 'res1', label: 'Show Conflicts', type: 'info', payload: { tab: 'conflicts' } });
                }
            }
        }

        // 3. Email Queries
        else if (query.includes('email') || query.includes('unread') || query.includes('summarize')) {
            setLastTopic('email');
            if (unreadCount > 0) {
                responseContent = `You have ${unreadCount} unread emails. I can summarize them or draft a reply for the most urgent ones.`;
                actions.push({ id: 'sum1', label: 'Summarize All', type: 'email', payload: { action: 'summarize_all' } });
                actions.push({ id: 'draft1', label: 'Draft Reply', type: 'email', payload: { action: 'draft_urgent' } });
            } else {
                responseContent = "Your inbox is clear! Ready for the next task?";
            }
        }

        // 4. Travel Queries
        else if (query.includes('trip') || query.includes('travel') || query.includes('itinerary')) {
            setLastTopic('travel');
            const nextTrip = trips[0];
            if (nextTrip) {
                responseContent = `You're heading to ${nextTrip.destination} on ${format(new Date(nextTrip.startDate), 'MMM d')}. Have you checked in for your flight?`;
                actions.push({ id: 'tr1', label: 'View Trip', type: 'travel', payload: { tripId: nextTrip.id } });
            } else {
                responseContent = "No upcoming trips found. Want to plan a new one?";
            }
        }

        // 5. Tasks
        else if (query.includes('remind') || query.includes('task')) {
            const task = content.replace(/remind me to |create task /gi, '');
            responseContent = `Got it! I've added "${task}" to your tasks.`;
            actions.push({ id: 'tsk1', label: 'View Tasks', type: 'task', payload: { task } });
        }

        // 6. Scheduling Skills
        else if ((query.includes('schedule') || query.includes('book')) && (query.includes('meeting') || query.includes('focus'))) {
            setLastTopic('calendar');
            const isFocus = query.includes('focus');
            const person = content.match(/with (\w+)/)?.[1] || '';

            responseContent = `Done! I've found a slot tomorrow at 2 PM ${person ? `with ${person}` : ''}. Tap confirm to add it.`;
            actions.push({
                id: 'sch1',
                label: `Confirm ${isFocus ? 'Focus' : 'Meeting'}`,
                type: 'schedule',
                payload: {
                    title: isFocus ? 'Focus Time' : `Meeting ${person ? `with ${person}` : ''}`,
                    start: addMinutes(startOfDay(addDays(new Date(), 1)), 14 * 60),
                    duration: 60
                },
                isPrimary: true
            });
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
            const { title, start } = action.payload;
            addEvent({
                title: title || 'New AI Event',
                description: 'Scheduled via AI Assistant',
                start: new Date(start),
                end: addMinutes(new Date(start), 60),
                type: 'work'
            });
            addMessage({
                id: `exec-${Date.now()}`,
                role: 'assistant',
                content: `📅 Added "${title}" to your calendar for ${format(new Date(start), 'MMM d, HH:mm')}.`,
                timestamp: new Date()
            });
        } else if (action.type === 'email') {
            addMessage({
                id: `exec-${Date.now()}`,
                role: 'assistant',
                content: "📧 I've drafted that for you! You can find it in your Drafts folder.",
                timestamp: new Date()
            });
        } else if (action.type === 'task') {
            addMessage({
                id: `exec-${Date.now()}`,
                role: 'assistant',
                content: `✅ Task "${action.payload.task}" has been added to your list.`,
                timestamp: new Date()
            });
        }
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
            proactiveSuggestions: [] // Future logic
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
