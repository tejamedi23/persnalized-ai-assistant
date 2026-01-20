import { addDays, setHours, setMinutes, addMinutes, isBefore, isAfter, isWeekend, areIntervalsOverlapping, differenceInMinutes } from 'date-fns';
import type { CalendarEvent } from '../types';

export interface TimeSlot {
    start: Date;
    end: Date;
    score: number;
    reason: string;
    context: string;
}

export const findAvailableSlots = (
    events: CalendarEvent[],
    durationMinutes: number,
    searchDays: number = 14
): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const workStartHour = 9;
    const workEndHour = 17; // 5 PM

    // Generate candidates
    for (let i = 0; i < searchDays; i++) {
        const currentDate = addDays(now, i);

        // Skip weekends
        if (isWeekend(currentDate)) continue;

        // Define working hours for the day
        let slotStart = setMinutes(setHours(currentDate, workStartHour), 0);
        const dayEnd = setMinutes(setHours(currentDate, workEndHour), 0);

        // If checking today, start from next half hour
        if (i === 0) {
            if (isAfter(now, dayEnd)) continue; // Day is over
            if (isAfter(now, slotStart)) {
                // Round up to next 30 min
                const minutes = now.getMinutes();
                const remainder = 30 - (minutes % 30);
                const nextSlot = addMinutes(now, remainder);
                slotStart = nextSlot;
            }
        }

        // Iterate through day in 30 min increments
        while (isBefore(addMinutes(slotStart, durationMinutes), dayEnd)) {
            const slotEnd = addMinutes(slotStart, durationMinutes);

            // 1. Check for overlaps (hard constraint)
            const hasConflict = events.some(event =>
                areIntervalsOverlapping(
                    { start: slotStart, end: slotEnd },
                    { start: event.start, end: event.end }
                )
            );

            if (!hasConflict) {
                // 2. Score availability
                let score = 10; // Base score
                let reasons: string[] = [];
                let context = "Available slot";

                // Buffer Check: Ensure 15 min buffer if possible (soft constraint)
                const tightSqueeze = events.some(event => {
                    const gapBefore = Math.abs(differenceInMinutes(slotStart, event.end));
                    const gapAfter = Math.abs(differenceInMinutes(event.start, slotEnd));
                    return gapBefore < 15 || gapAfter < 15;
                });

                if (tightSqueeze) {
                    score -= 5;
                    context = "Tight spacing";
                } else {
                    score += 2;
                }

                // Patterns/Heuristics

                // "Efficiency": Adjacent to existing meeting (but with buffer)
                const isAdjacent = events.some(event => {
                    const gapBefore = Math.abs(differenceInMinutes(slotStart, event.end));
                    return gapBefore >= 15 && gapBefore <= 30;
                });
                if (isAdjacent) {
                    score += 5;
                    reasons.push("Efficient scheduling");
                    context = "Right after your previous commitment";
                }

                // Time of day preferences
                const hour = slotStart.getHours();
                if (hour >= 9 && hour < 12) {
                    score += 3;
                    reasons.push("Morning productivity");
                    if (!context.includes("Right after")) context = "Good for morning focus";
                } else if (hour >= 13 && hour <= 15) {
                    score += 2;
                    if (!context.includes("Right after")) context = "Afternoon block";
                } else if (hour >= 16) {
                    score -= 1; // Late afternoon penalty
                    if (!context.includes("Right after")) context = "End of day wrap-up";
                }

                slots.push({
                    start: slotStart,
                    end: slotEnd,
                    score,
                    reason: reasons[0] || "Open slot",
                    context
                });
            }

            slotStart = addMinutes(slotStart, 30);
        }
    }

    // Sort by score (desc), then time (asc)
    return slots.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.start.getTime() - b.start.getTime();
    }).slice(0, 5); // Return top 5
};
