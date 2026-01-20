import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Type } from 'lucide-react';
import type { CalendarEvent, EventType } from '../types';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'>) => void;
    initialDate?: Date;
    initialEvent?: CalendarEvent;
}

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
    { value: 'meeting', label: 'Meeting', color: 'bg-blue-500' },
    { value: 'call', label: 'Call', color: 'bg-green-500' },
    { value: 'work', label: 'Work', color: 'bg-purple-500' },
    { value: 'personal', label: 'Personal', color: 'bg-orange-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

export const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialDate,
    initialEvent
}) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [type, setType] = useState<EventType>('meeting');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                setTitle(initialEvent.title);
                setDescription(initialEvent.description);
                setType(initialEvent.type);
                setDate(initialEvent.start.toISOString().split('T')[0]);
                setStartTime(initialEvent.start.toTimeString().slice(0, 5));
                setEndTime(initialEvent.end.toTimeString().slice(0, 5));
            } else {
                // Reset for new event
                setTitle('');
                setDescription('');
                setType('meeting');
                if (initialDate) {
                    setDate(initialDate.toISOString().split('T')[0]);
                } else {
                    setDate(new Date().toISOString().split('T')[0]);
                }
                setStartTime('09:00');
                setEndTime('10:00');
            }
        }
    }, [isOpen, initialDate, initialEvent]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        onSave({
            title,
            description,
            type,
            start: startDateTime,
            end: endDateTime,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white dark:bg-slate-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    {initialEvent ? 'Edit Event' : 'Add New Event'}
                                </h3>

                                <div className="mt-6 space-y-4">
                                    {/* Title */}
                                    <div className="relative rounded-md border border-gray-300 dark:border-slate-600 px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600 bg-white dark:bg-slate-900">
                                        <label htmlFor="title" className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white dark:bg-slate-900 text-xs font-medium text-gray-900 dark:text-gray-200">
                                            Event Title
                                        </label>
                                        <div className="flex items-center">
                                            <Type className="h-4 w-4 text-gray-400 mr-2" />
                                            <input
                                                type="text"
                                                name="title"
                                                id="title"
                                                className="block w-full border-0 p-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:ring-0 sm:text-sm bg-transparent"
                                                placeholder="Team Sync"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {EVENT_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setType(t.value)}
                                                className={`flex flex-col items-center p-2 rounded-md border ${type === t.value ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500' : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <span className={`w-3 h-3 rounded-full ${t.color} mb-1`} />
                                                <span className="text-xs text-gray-600 dark:text-slate-300">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Date & Time */}
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <label htmlFor="date" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Date</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    id="date"
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="w-1/3">
                                            <label htmlFor="start-time" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Start</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <input
                                                    type="time"
                                                    id="start-time"
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="w-1/3">
                                            <label htmlFor="end-time" className="block text-xs font-medium text-gray-700 dark:text-gray-300">End</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <input
                                                    type="time"
                                                    id="end-time"
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={3}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
                                                placeholder="Add details..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Save Event
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
