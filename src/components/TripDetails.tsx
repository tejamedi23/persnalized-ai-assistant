import { X, Plane, Building, Car, Clock, MapPin, ArrowLeft, Trash2, Check } from 'lucide-react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import type { Trip } from '../types';
import { useTravel } from '../context/TravelContext';

interface TripDetailsProps {
    trip: Trip;
    onClose: () => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ trip, onClose }) => {
    const { updateTrip, deleteTrip } = useTravel();
    const [activeTab, setActiveTab] = useState<'itinerary' | 'expenses' | 'checklist'>('itinerary');

    // Combine all events for a chronological timeline
    const timelineEvents = [
        ...trip.flights.map(f => ({ ...f, type: 'flight' as const, time: f.departureTime })),
        ...trip.hotels.map(h => ({ ...h, type: 'hotel' as const, time: h.checkIn })),
        ...trip.transport.map(t => ({ ...t, type: 'transport' as const, time: t.pickupTime }))
    ].sort((a, b) => a.time.getTime() - b.time.getTime());

    const toggleChecklist = (itemId: string) => {
        const updatedChecklist = trip.checklist.map(item =>
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        updateTrip({ ...trip, checklist: updatedChecklist });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this trip? All associated calendar events will remain.')) {
            deleteTrip(trip.id);
            onClose();
        }
    };

    const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
            {/* Header */}
            <header className="bg-indigo-600 px-4 py-4 sm:px-6 flex justify-between items-center text-white">
                <div className="flex items-center space-x-4">
                    <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold">{trip.name}</h2>
                        <p className="text-indigo-100 text-sm flex items-center">
                            <MapPin className="h-3 w-3 mr-1" /> {trip.destination} • {format(trip.startDate, 'MMM d')} - {format(trip.endDate, 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDelete}
                        className="p-2 hover:bg-red-500 rounded-lg transition-colors"
                        title="Delete Trip"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-lg transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {/* Sub-nav */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['itinerary', 'expenses', 'checklist'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                                ${activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'itinerary' && (
                        <div className="space-y-8">
                            {timelineEvents.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <Clock className="mx-auto h-12 w-12 text-slate-300" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No itinerary items</h3>
                                    <p className="mt-1 text-sm text-slate-500 ml-2">Add flights, hotels, or transport to build your timeline.</p>
                                </div>
                            ) : (
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {timelineEvents.map((event, eventIdx) => (
                                            <li key={eventIdx}>
                                                <div className="relative pb-8">
                                                    {eventIdx !== timelineEvents.length - 1 ? (
                                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-50 dark:ring-slate-900 
                                                                ${event.type === 'flight' ? 'bg-blue-500' : event.type === 'hotel' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                                                {event.type === 'flight' && <Plane className="h-4 w-4 text-white" />}
                                                                {event.type === 'hotel' && <Building className="h-4 w-4 text-white" />}
                                                                {event.type === 'transport' && <Car className="h-4 w-4 text-white" />}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                                                            {event.type === 'flight' && `${(event as any).airline} ${(event as any).flightNumber}`}
                                                                            {event.type === 'hotel' && (event as any).name}
                                                                            {event.type === 'transport' && (event as any).type.replace('_', ' ')}
                                                                        </h4>
                                                                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                                            {event.type === 'flight' && `${(event as any).departureCity} to ${(event as any).arrivalCity}`}
                                                                            {event.type === 'hotel' && (event as any).address}
                                                                            {event.type === 'transport' && `${(event as any).pickupLocation} to ${(event as any).dropoffLocation}`}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <time className="block text-sm font-semibold text-slate-900 dark:text-white">
                                                                            {format(event.time, 'HH:mm')}
                                                                        </time>
                                                                        <span className="text-xs text-slate-500">
                                                                            {format(event.time, 'MMM d')}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {event.type === 'flight' && (
                                                                    <div className="mt-4 grid grid-cols-3 gap-4 py-3 border-t border-slate-100 dark:border-slate-700">
                                                                        <div>
                                                                            <span className="block text-[10px] uppercase font-bold text-slate-400">Terminal</span>
                                                                            <span className="text-sm font-medium dark:text-slate-200">{(event as any).terminal || 'TBA'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="block text-[10px] uppercase font-bold text-slate-400">Gate</span>
                                                                            <span className="text-sm font-medium dark:text-slate-200">{(event as any).gate || 'TBA'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="block text-[10px] uppercase font-bold text-slate-400">Status</span>
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                                {(event as any).status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {event.type === 'hotel' && (
                                                                    <div className="mt-4 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
                                                                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>Check-in: {format((event as any).checkIn, 'HH:mm')}</span>
                                                                        </div>
                                                                        <div className="text-indigo-600 font-medium">
                                                                            {(event as any).confirmationNumber || 'Ref: #99281'}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Expense Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Total Trip Cost</span>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">${totalExpenses.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Items Tracked</span>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{trip.expenses.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                        {trip.expenses.map((expense) => (
                                            <tr key={expense.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{expense.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{expense.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900 dark:text-white">${expense.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {trip.expenses.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No expenses recorded for this trip.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'checklist' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trip Preparation</h3>
                                    <span className="text-sm font-medium text-indigo-600">
                                        {trip.checklist.filter(i => i.isCompleted).length} of {trip.checklist.length} completed
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-8">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(trip.checklist.filter(i => i.isCompleted).length / (trip.checklist.length || 1)) * 100}%` }}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {trip.checklist.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleChecklist(item.id)}
                                            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 text-left"
                                        >
                                            <div className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors
                                                ${item.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-500'}`}>
                                                {item.isCompleted && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                            <span className={`flex-1 text-sm ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                                {item.text}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
