import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import {
    Plus,
    Calendar,
    MapPin,
    Plane,
    Briefcase,
    User,
    Users,
    ChevronRight,
    Clock
} from 'lucide-react';
import { TripWizard } from './TripWizard';
import { TripDetails } from './TripDetails';
import { format, differenceInDays } from 'date-fns';
import type { Trip } from '../types';

export const TravelView: React.FC = () => {
    const { trips } = useTravel();
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const activeTrip = trips.find(t => t.id === selectedTripId);

    const totalBudget = trips.reduce((sum, t) => sum + t.expenses.reduce((s, e) => s + e.amount, 0), 0);
    const totalTrips = trips.length;
    const upcomingTrips = trips.filter(t => t.startDate > new Date()).length;

    const filteredTrips = trips.filter(trip => {
        const now = new Date();
        if (filter === 'upcoming') return new Date(trip.endDate) >= now;
        if (filter === 'past') return new Date(trip.endDate) < now;
        return true;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
        <div className="flex-1 bg-white p-6 overflow-y-auto custom-scrollbar h-full">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Travel & Trips</h1>
                        <p className="text-slate-500">Manage your itineraries, flights, and expenses</p>
                    </div>
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-medium transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Plan New Trip
                    </button>
                </div>

                {/* Statistics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Trips</span>
                        <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{totalTrips}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming</span>
                        <p className="text-2xl font-black text-blue-600 tracking-tight mt-1">{upcomingTrips}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Budget</span>
                        <p className="text-2xl font-black text-emerald-600 tracking-tight mt-1">${totalBudget.toFixed(2)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex space-x-2 border-b border-slate-100 pb-1">
                    {(['upcoming', 'past', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${filter === f
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Trip List */}
                {filteredTrips.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <div className="mx-auto h-12 w-12 text-slate-300">
                            <Plane className="h-full w-full stroke-[1.5]" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No trips found</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by planning a new adventure.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => setIsWizardOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                New Trip
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredTrips.map(trip => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                onClick={() => setSelectedTripId(trip.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <TripWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
            />

            {activeTrip && (
                <TripDetails
                    trip={activeTrip}
                    onClose={() => setSelectedTripId(null)}
                />
            )}
        </div>
    );
};

const TripCard: React.FC<{ trip: Trip; onClick: () => void }> = ({ trip, onClick }) => {
    const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
    const daysUntil = differenceInDays(new Date(trip.startDate), new Date());

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all cursor-pointer group"
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${trip.purpose === 'business' ? 'bg-blue-50 text-blue-600' :
                            trip.purpose === 'conference' ? 'bg-purple-50 text-purple-600' :
                                'bg-orange-50 text-orange-600'
                            }`}>
                            {trip.purpose === 'business' ? <Briefcase className="h-6 w-6" /> :
                                trip.purpose === 'conference' ? <Users className="h-6 w-6" /> :
                                    <User className="h-6 w-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {trip.name}
                            </h3>
                            <div className="flex items-center text-slate-500 mt-1">
                                <MapPin className="h-4 w-4 mr-1 stroke-2" />
                                <span className="text-sm font-medium">{trip.destination}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        {daysUntil > 0 ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                in {daysUntil} days
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                Active
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                    <div className="flex space-x-6">
                        <div className="flex items-center text-sm text-slate-600 font-medium">
                            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                            {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 font-medium">
                            <Clock className="h-4 w-4 mr-2 text-slate-400" />
                            {duration} Days
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                            <Plane className="h-3 w-3 mr-1" />
                            {trip.flights.length} Flights
                        </div>
                        <button className="text-blue-600 text-sm font-bold hover:text-blue-700 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            View Itinerary <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-slate-50/50 px-6 py-3 flex items-center justify-between border-t border-slate-50">
                <div className="flex space-x-2">
                    {trip.checklist.slice(0, 3).map(item => (
                        <div key={item.id} className={`h-1.5 w-8 rounded-full ${item.isCompleted ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-200'}`} />
                    ))}
                </div>
                <span className="text-xs font-bold text-slate-400">
                    {trip.checklist.filter(i => i.isCompleted).length}/{trip.checklist.length} Tasks
                </span>
            </div>
        </div>
    );
};
