import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    differenceInMinutes,
    format
} from 'date-fns';
import type { CalendarEvent, Conflict } from '../types';

export interface CalendarMetrics {
    totalMeetings: number;
    totalHours: number;
    focusTimeBlocks: number; // 2h+ free blocks
    calendarHealthScore: number; // 0-100
    busiestDay: string;
    meetingDistribution: { name: string; value: number; color: string }[];
    dailyLoad: { name: string; meetings: number; hours: number }[];
    insights: string[];
}

export const calculateMetrics = (events: CalendarEvent[], conflicts: Conflict[]): CalendarMetrics => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Filter events for this week
    const weeklyEvents = events.filter(e => e.start >= weekStart && e.end <= weekEnd);

    // 1. Basic Counts
    const totalMeetings = weeklyEvents.length;
    const totalMinutes = weeklyEvents.reduce((acc, e) => acc + differenceInMinutes(e.end, e.start), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // 2. Daily Load
    const dailyLoad = days.map(day => {
        const daysEvents = weeklyEvents.filter(e => isSameDay(e.start, day));
        const hours = daysEvents.reduce((acc, e) => acc + differenceInMinutes(e.end, e.start), 0) / 60;
        return {
            name: format(day, 'EEE'),
            meetings: daysEvents.length,
            hours: Math.round(hours * 10) / 10
        };
    });

    // 3. Distribution
    const distributionMap = new Map<string, number>();
    weeklyEvents.forEach(e => {
        const type = e.type;
        distributionMap.set(type, (distributionMap.get(type) || 0) + 1);
    });

    const colors: Record<string, string> = {
        meeting: '#3b82f6', // blue
        call: '#10b981', // green
        work: '#8b5cf6', // purple
        personal: '#f97316', // orange
        other: '#64748b' // gray
    };

    const meetingDistribution = Array.from(distributionMap.entries()).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: colors[name] || '#64748b'
    }));

    // 4. Focus Time & Health Score
    // Simplified focus time: Count 2h gaps between 9-5
    // ... logic for focus blocks would go here (complex) -> Simplified for mockup:
    // Assume 40h work week - meeting hours = potential focus

    // Health Score Algorithm
    // Start at 100
    // -5 per conflict
    // -1 per hour over 20h meetings
    // +5 for keeping meetings under 15
    let health = 100;
    health -= conflicts.length * 5;
    if (totalHours > 20) health -= (totalHours - 20);
    if (totalMeetings < 15) health += 5;
    // Clamp 0-100
    health = Math.max(0, Math.min(100, Math.round(health)));

    // 5. Insights
    const insights: string[] = [];

    const busiest = dailyLoad.reduce((prev, current) => (prev.meetings > current.meetings) ? prev : current);
    insights.push(`Your busiest day is ${busiest.name} with ${busiest.meetings} meetings.`);

    if (totalHours > 20) {
        insights.push("High meeting load detected. Consider decluttering.");
    } else {
        insights.push("Great balance! You have ample focus time.");
    }

    if (conflicts.length > 0) {
        insights.push(`You have ${conflicts.length} unresolved conflicts to fix.`);
    }

    return {
        totalMeetings,
        totalHours,
        focusTimeBlocks: Math.round((40 - totalHours) / 2), // Rough estimate
        calendarHealthScore: health,
        busiestDay: busiest.name,
        meetingDistribution,
        dailyLoad,
        insights
    };
};
