import type { CalendarEvent, Conflict } from '../types';
import { differenceInMinutes, areIntervalsOverlapping, addMinutes } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const detectConflicts = (events: CalendarEvent[]): Conflict[] => {
    const conflicts: Conflict[] = [];
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    for (let i = 0; i < sortedEvents.length; i++) {
        const current = sortedEvents[i];

        // Check against all subsequent events (since it's sorted)
        for (let j = i + 1; j < sortedEvents.length; j++) {
            const next = sortedEvents[j];

            // Optimization: If next event starts after current ends + some buffer, we can stop checking this current event against future ones
            // But for 'Tight' schedule we check strictly.
            // Actually simply: if next.start >= current.end, then NO overlap.
            // But we need to check for 'tight' schedule which is effectively next.start == current.end.

            if (next.start > current.end) {
                // If the next event starts way later, no need to check further for 'current'
                // Break inner loop, move to next 'current'
                break;
            }

            // 1. Critical: Actual Overlap
            if (areIntervalsOverlapping(
                { start: current.start, end: current.end },
                { start: next.start, end: next.end },
                { inclusive: false } // Strict overlap
            )) {
                conflicts.push({
                    id: uuidv4(),
                    eventIds: [current.id, next.id],
                    severity: 'critical',
                    description: `Overlap between "${current.title}" and "${next.title}"`,
                    timestamp: new Date()
                });
                continue; // Found a critical conflict, proceed
            }

            // 2. Warning: Partial Overlap (Assuming this means very small overlaps allowed? Or close proximity?)
            // The user requirement: "Warning: Partial overlap under 15 minutes"
            // This is ambiguous. Usually overlap IS critical. 
            // Maybe they mean "if overlap is small" it's just a warning?
            // Let's implement: If overlap exists and overlap duration < 15 mins -> Warning. Else -> Critical.

            // But wait, `areIntervalsOverlapping` catches ANY overlap.
            // Let's refine the logic inside the overlap check.

            // Let's redo:
            const startMax = current.start > next.start ? current.start : next.start;
            const endMin = current.end < next.end ? current.end : next.end;

            if (startMax < endMin) {
                // There IS an overlap
                const overlapDuration = differenceInMinutes(endMin, startMax);

                if (overlapDuration < 15) {
                    conflicts.push({
                        id: uuidv4(),
                        eventIds: [current.id, next.id],
                        severity: 'warning',
                        description: `Minor overlap (${overlapDuration}m) between "${current.title}" and "${next.title}"`,
                        timestamp: new Date()
                    });
                } else {
                    conflicts.push({
                        id: uuidv4(),
                        eventIds: [current.id, next.id],
                        severity: 'critical',
                        description: `Major conflict between "${current.title}" and "${next.title}"`,
                        timestamp: new Date()
                    });
                }
                continue;
            }

            // 3. Tight: Back-to-back (0-5 mins buffer)
            // If we are here, there is NO overlap.
            // Check if next.start is very close to current.end
            const gap = differenceInMinutes(next.start, current.end);
            if (gap >= 0 && gap < 5) {
                conflicts.push({
                    id: uuidv4(),
                    eventIds: [current.id, next.id],
                    severity: 'tight',
                    description: `Tight schedule between "${current.title}" and "${next.title}"`,
                    timestamp: new Date()
                });
            }
        }
    }

    return conflicts;
};

export const suggestAlternative = (event: CalendarEvent, events: CalendarEvent[]): Date | null => {
    // Naive implementation: Try to find a slot +/- 2 hours
    // This is complex to do perfectly, effectively 1D bin packing.
    // Let's just try moving it +30 mins, +60 mins, etc until no conflict.

    const intervalsToCheck = [30, 60, 90, 120, -30, -60, -90, -120];

    for (const offset of intervalsToCheck) {
        const newStart = addMinutes(event.start, offset);
        const newEnd = addMinutes(event.end, offset);

        // Check if this new slot conflicts with anything (excluding itself)
        const hasConflict = events.some(e => {
            if (e.id === event.id) return false;
            return areIntervalsOverlapping(
                { start: newStart, end: newEnd },
                { start: e.start, end: e.end }
            );
        });

        if (!hasConflict) {
            return newStart;
        }
    }

    return null; // Could not find simple alternative
};
