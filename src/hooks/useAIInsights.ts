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

            // 1. Check for Conflicts
            // Simple overlap check
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
                        onClick: () => { /* Action handled by consumer */ }
                    }
                });
                return;
            }

            // 2. Check for Meeting Overload
            const totalMeetingMinutes = todayEvents.reduce((acc, curr) => {
                return acc + differenceInMinutes(curr.end, curr.start);
            }, 0);

            if (totalMeetingMinutes > 5 * 60) {
                setInsight({
                    type: 'warning',
                    title: 'Heavy Load Detected',
                    message: `You have ${Math.round(totalMeetingMinutes / 60)} hours of meetings today. Consider declining low-priority syncing.`,
                    action: {
                        label: 'Review Commitments',
                        onClick: () => { /* */ }
                    }
                });
                return;
            }

            // 3. Find "Deep Work" Gaps (9 AM - 5 PM)
            const workStart = startOfDay(currentDate);
            workStart.setHours(9, 0, 0, 0);
            const workEnd = endOfDay(currentDate);
            workEnd.setHours(17, 0, 0, 0);

            let maxGap = 0;
            let gapStart = workStart;
            let bestGapStart = workStart;

            // Simplified gap finding
            if (sortedEvents.length === 0) {
                setInsight({
                    type: 'success',
                    title: 'Clear Schedule',
                    message: 'Your calendar is completely empty today. Great day for deep focus or strategic planning.',
                    action: {
                        label: 'Plan Focus Block',
                        onClick: () => addEvent({
                            title: 'Strategic Planning',
                            description: 'Deep work block',
                            start: new Date(new Date().setHours(10, 0)),
                            end: new Date(new Date().setHours(12, 0)),
                            type: 'work'
                        })
                    }
                });
                return;
            }

            // Check gaps between events in work hours
            // This is a simplified heuristic
            let lastEnd = workStart;

            for (const event of sortedEvents) {
                // If event starts after work hours, stop
                if (event.start >= workEnd) break;

                // Clamp event to work hours for calculation
                const effectiveStart = event.start < workStart ? workStart : event.start;
                const effectiveEnd = event.end > workEnd ? workEnd : event.end;

                const gap = differenceInMinutes(effectiveStart, lastEnd);
                if (gap > maxGap) {
                    maxGap = gap;
                    bestGapStart = lastEnd;
                }

                lastEnd = effectiveEnd > lastEnd ? effectiveEnd : lastEnd;
            }

            // Check final gap till 5 PM
            if (lastEnd < workEnd) {
                const gap = differenceInMinutes(workEnd, lastEnd);
                if (gap > maxGap) {
                    maxGap = gap;
                    bestGapStart = lastEnd;
                }
            }

            if (maxGap >= 120) { // 2 Hours
                const startStr = format(bestGapStart, 'h:mm a');
                const endStr = format(new Date(bestGapStart.getTime() + maxGap * 60000), 'h:mm a');
                setInsight({
                    type: 'focus',
                    title: 'Deep Work Opportunity',
                    message: `You have a ${Math.floor(maxGap / 60)}h ${maxGap % 60 > 0 ? (maxGap % 60) + 'm' : ''} gap between ${startStr} and ${endStr}.`,
                    action: {
                        label: 'Schedule Focus',
                        onClick: () => addEvent({
                            title: 'Focus Time',
                            description: 'Auto-scheduled via AI Insight',
                            start: bestGapStart,
                            end: new Date(bestGapStart.getTime() + maxGap * 60000),
                            type: 'work'
                        })
                    }
                });
                return;
            }

            // Default
            setInsight({
                type: 'info',
                title: 'Daily Summary',
                message: `You have ${todayEvents.length} events scheduled today. Stay on track!`,
                action: {
                    label: 'View Agenda',
                    onClick: () => { }
                }
            });

        };

        analyzeSchedule();
    }, [events, currentDate]);

    return insight;
};
