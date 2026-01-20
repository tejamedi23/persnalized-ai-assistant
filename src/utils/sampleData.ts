import { addDays, setHours, setMinutes, startOfWeek } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent } from '../types';

export const generateSampleEvents = (): CalendarEvent[] => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday start

    const events: CalendarEvent[] = [
        {
            id: uuidv4(),
            title: 'Weekly Team Standup',
            description: 'Review progress and blockers for the week.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 10), 0), // Mon 10:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 11), 0),   // Mon 11:00
            type: 'meeting',
        },
        {
            id: uuidv4(),
            title: 'Client Call: Tech Corp',
            description: 'Discuss Q1 requirements.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 14), 0), // Mon 14:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 0), 15), 0),   // Mon 15:00
            type: 'call',
        },
        {
            id: uuidv4(),
            title: 'Deep Work: API Design',
            description: 'Focus time for backend architecture.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 9), 0),  // Tue 09:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 12), 0),   // Tue 12:00
            type: 'work',
        },
        {
            id: uuidv4(),
            title: 'Lunch with Sarah',
            description: 'Catch up at The Place.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 12), 30), // Tue 12:30
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 13), 30),   // Tue 13:30
            type: 'personal',
        },
        {
            id: uuidv4(),
            title: 'Project Planning',
            description: 'Roadmap planning for Q2.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 11), 0), // Wed 11:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 12), 30),  // Wed 12:30
            type: 'meeting',
        },
        {
            id: uuidv4(),
            title: 'Design Review',
            description: 'Review new UI mockups.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 15), 0), // Wed 15:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 16), 0),   // Wed 16:00
            type: 'meeting',
        },
        {
            id: uuidv4(),
            title: 'Gym',
            description: 'Cardio day.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 3), 17), 30), // Thu 17:30
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 3), 19), 0),    // Thu 19:00
            type: 'personal',
        },
        {
            id: uuidv4(),
            title: 'Marketing Sync',
            description: 'Weekly sync with marketing team.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 4), 10), 0),  // Fri 10:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 4), 11), 0),    // Fri 11:00
            type: 'meeting',
        },
        {
            id: uuidv4(),
            title: 'Wrap Up',
            description: 'Weekly wrap up and report submission.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 4), 16), 0),  // Fri 16:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 4), 17), 0),    // Fri 17:00
            type: 'work',
        },
        // Weekend stuff
        {
            id: uuidv4(),
            title: 'Grocery Shopping',
            description: 'Buy vegetables and fruits.',
            start: setMinutes(setHours(addDays(startOfCurrentWeek, 5), 10), 0),  // Sat 10:00
            end: setMinutes(setHours(addDays(startOfCurrentWeek, 5), 11), 30),   // Sat 11:30
            type: 'personal',
        }
    ];

    return events;
};
