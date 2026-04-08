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
import { model } from '../services/LLMService';

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
                    content: `Hi! I'm your Personalized AI Assistant. I've synced your calendar and emails. What can I do for you today?`,
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

        try {
            const prompt = `
                You are a professional AI Executive Assistant named Personalized AI Assistant. 
                You help the user with their calendar, emails, and travel.
                Current Context:
                - Unread Emails: ${unreadCount}
                - Upcoming Events: ${events.length}
                
                Important: Use a professional, helpful tone. If the user asks about their schedule or mail, be specific.
                User Message: "${content}"
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text() || 'No response received.';

            addMessage({
                id: Math.random().toString(36).substring(2, 9),
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
                actions: []
            });
        } catch (error: any) {
            const errorMsg = error?.message || '';
            const isQuotaError = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED');
            
            console.error("Gemini Chat failed:", errorMsg);
            addMessage({
                id: Math.random().toString(36).substring(2, 9),
                role: 'assistant',
                content: isQuotaError
                    ? `I'm currently experiencing high demand. Here's what I can tell you locally:\n\n📅 You have **${events.length} events** on your calendar.\n📧 You have **${unreadCount} unread emails**.\n\nThe AI service will be available again shortly. Please try again in a minute!`
                    : `Sorry, I encountered an issue: ${errorMsg || 'Please try again.'}`,
                timestamp: new Date()
            });
        }

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
