import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { format, differenceInMinutes, startOfDay, endOfDay, isSameDay } from 'date-fns';

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
        const analyzeSchedule = () => {
            const todayEvents = events.filter(e => isSameDay(e.start, currentDate));
            const sortedEvents = todayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

            // 1. Critical Logic (Conflicts) - Local, no API call
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

            // 2. Local smart analysis (no API call to save quota)
            const totalMinutes = sortedEvents.reduce((sum, e) => sum + differenceInMinutes(e.end, e.start), 0);
            const hours = Math.round(totalMinutes / 60 * 10) / 10;

            if (todayEvents.length === 0) {
                setInsight({
                    type: 'success',
                    title: 'Clear Day Ahead',
                    message: 'No events scheduled today — perfect for deep work or catching up on tasks.',
                    action: {
                        label: 'View Agenda',
                        onClick: () => { }
                    }
                });
            } else if (todayEvents.length >= 5) {
                setInsight({
                    type: 'warning',
                    title: 'Busy Day Detected',
                    message: `You have ${todayEvents.length} events (${hours}h of meetings) today. Consider protecting focus time between blocks.`,
                    action: {
                        label: 'View Agenda',
                        onClick: () => { }
                    }
                });
            } else {
                setInsight({
                    type: 'info',
                    title: 'Daily Summary',
                    message: `You have ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} scheduled today (${hours}h total). Stay on track!`,
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
