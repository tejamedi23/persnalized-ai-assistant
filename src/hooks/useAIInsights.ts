import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { format, differenceInMinutes, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { generateScheduleInsights } from '../services/LLMService';

export interface Insight {
    type: 'focus' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const useAIInsights = (events: CalendarEvent[], currentDate: Date, addEvent: (e: any) => void) => {
    const [insight, setInsight] = useState<Insight | null>(null);

    useEffect(() => {
        const analyzeSchedule = async () => {
            const todayEvents = events.filter(e => isSameDay(e.start, currentDate));
            const sortedEvents = todayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

            // 1. Critical Logic (Conflicts) - Keep this fast/local
            let hasConflict = false;
            for (let i = 0; i < sortedEvents.length - 1; i++) {
                if (sortedEvents[i].end > sortedEvents[i + 1].start) {
                    hasConflict = true;
                    break;
                }
            }

            if (hasConflict) {
                setInsight({
                    type: 'warning',
                    title: 'Schedule Conflict',
                    message: `You have overlapping meetings today. You might want to reschedule to avoid stress.`,
                    action: {
                        label: 'Check Schedule',
                        onClick: () => { }
                    }
                });
                return;
            }

            // 2. Real AI Analysis for more subtle patterns
            try {
                const aiMessage = await generateScheduleInsights(todayEvents);
                setInsight({
                    type: 'info',
                    title: 'Personalized AI Insight',
                    message: aiMessage,
                    action: {
                        label: 'View Agenda',
                        onClick: () => { }
                    }
                });
            } catch (error) {
                // Fallback to simple logic if AI fails
                setInsight({
                    type: 'info',
                    title: 'Daily Summary',
                    message: `You have ${todayEvents.length} events scheduled today. Stay on track!`,
                    action: {
                        label: 'View Agenda',
                        onClick: () => { }
                    }
                });
            }
        };

        analyzeSchedule();
    }, [events, currentDate]);

    return insight;
};
