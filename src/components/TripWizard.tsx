import React, { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { format } from 'date-fns';
import type { Flight, Hotel, Transport, Expense, TripPurpose } from '../types';
import { useTravel } from '../context/TravelContext';
import { useCalendar } from '../context/CalendarContext';

interface TripWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'details' | 'flights' | 'hotels' | 'transport' | 'expenses' | 'review';

export const TripWizard: React.FC<TripWizardProps> = ({ isOpen, onClose }) => {
    const { addTrip } = useTravel();
    const { addEvent } = useCalendar();

    const [step, setStep] = useState<Step>('details');
    const [tripData, setTripData] = useState<{
        name: string;
        destination: string;
        startDate: string;
        endDate: string;
        purpose: TripPurpose;
        flights: Omit<Flight, 'id'>[];
        hotels: Omit<Hotel, 'id'>[];
        transport: Omit<Transport, 'id'>[];
        expenses: Omit<Expense, 'id'>[];
    }>({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        purpose: 'business',
        flights: [],
        hotels: [],
        transport: [],
        expenses: []
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 'details') setStep('flights');
        else if (step === 'flights') setStep('hotels');
        else if (step === 'hotels') setStep('transport');
        else if (step === 'transport') setStep('expenses');
        else if (step === 'expenses') setStep('review');
        else handleSubmit();
    };

    const handleBack = () => {
        if (step === 'review') setStep('expenses');
        else if (step === 'expenses') setStep('transport');
        else if (step === 'transport') setStep('hotels');
        else if (step === 'hotels') setStep('flights');
        else if (step === 'flights') setStep('details');
    };

    const handleSubmit = () => {
        const start = new Date(tripData.startDate);
        const end = new Date(tripData.endDate);

        // Created Trip
        addTrip({
            name: tripData.name,
            destination: tripData.destination,
            startDate: start,
            endDate: end,
            purpose: tripData.purpose
        });

        // Add Calendar Event for the whole trip
        addEvent({
            title: `Trip to ${tripData.destination}`,
            description: `Purpose: ${tripData.purpose}`,
            start: start,
            end: end,
            type: tripData.purpose === 'personal' ? 'personal' : 'work' // simplistic mapping
        });

        // Add specific flight events to calendar
        tripData.flights.forEach(f => {
            addEvent({
                title: `Flight: ${f.airline} ${f.flightNumber}`,
                description: `From ${f.departureCity} to ${f.arrivalCity}`,
                start: f.departureTime,
                end: f.arrivalTime,
                type: 'work'
            });

            // Add Travel Time Buffer (2 hours before flight)
            const bufferStart = new Date(f.departureTime.getTime() - 2 * 60 * 60 * 1000);
            addEvent({
                title: `Travel to Airport (${f.departureCity})`,
                description: "Automatic buffer for flight departure",
                start: bufferStart,
                end: f.departureTime,
                type: 'other'
            });
        });

        // Add hotel events
        tripData.hotels.forEach(h => {
            addEvent({
                title: `Hotel: ${h.name}`,
                description: `Check-in at ${h.address}`,
                start: h.checkIn,
                end: h.checkOut,
                type: 'work'
            });
        });

        // Add transport events
        tripData.transport.forEach(t => {
            addEvent({
                title: `${t.type.replace('_', ' ')} Pickup`,
                description: `From ${t.pickupLocation} to ${t.dropoffLocation}`,
                start: t.pickupTime,
                end: t.dropoffTime,
                type: 'other'
            });
        });

        onClose();
        setStep('details'); // Reset
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center space-x-4 mb-8">
            {(['details', 'flights', 'hotels', 'transport', 'expenses', 'review'] as Step[]).map((s, idx) => (
                <div key={s} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step === s ? 'bg-blue-600 text-white' :
                        (['details', 'flights', 'hotels', 'transport', 'expenses', 'review'].indexOf(step) > idx) ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {(['details', 'flights', 'hotels', 'transport', 'expenses', 'review'].indexOf(step) > idx) ? <Check className="h-4 w-4" /> : idx + 1}
                    </div>
                    {idx < 5 && <div className={`w-8 h-1 mx-1 ${(['details', 'flights', 'hotels', 'transport', 'expenses', 'review'].indexOf(step) > idx) ? 'bg-green-500' : 'bg-slate-200'}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-blue-600 px-4 py-3 sm:px-6 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-white">
                            Plan New Trip
                        </h3>
                        <button onClick={onClose} className="text-indigo-200 hover:text-white">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="px-4 py-5 sm:p-6">
                        {renderStepIndicator()}

                        {/* Step Content */}
                        <div className="min-h-[300px]">
                            {step === 'details' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Trip Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                                            placeholder="e.g. Q4 Sales Conference"
                                            value={tripData.name}
                                            onChange={e => setTripData({ ...tripData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Destination</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                                            placeholder="City, Country"
                                            value={tripData.destination}
                                            onChange={e => setTripData({ ...tripData, destination: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                                            <input
                                                type="date"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                                                value={tripData.startDate}
                                                onChange={e => setTripData({ ...tripData, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                                            <input
                                                type="date"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                                                value={tripData.endDate}
                                                onChange={e => setTripData({ ...tripData, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Purpose</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                                            value={tripData.purpose}
                                            onChange={e => setTripData({ ...tripData, purpose: e.target.value as TripPurpose })}
                                        >
                                            <option value="business">Business</option>
                                            <option value="personal">Personal</option>
                                            <option value="conference">Conference</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {step === 'transport' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Ground Transportation</h3>
                                        <span className="text-sm text-slate-500">rental cars, rideshare, etc.</span>
                                    </div>

                                    {tripData.transport.map((t, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg relative border border-slate-200 dark:border-slate-600">
                                            <button
                                                onClick={() => {
                                                    const newT = [...tripData.transport];
                                                    newT.splice(idx, 1);
                                                    setTripData({ ...tripData, transport: newT });
                                                }}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <p className="font-medium text-slate-900 dark:text-white capitalize">{t.type.replace('_', ' ')}</p>
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-300">
                                                {format(new Date(t.pickupTime), 'MMM d, HH:mm')}
                                            </div>
                                            <div className="text-xs text-slate-50 mt-1">{t.pickupLocation} to {t.dropoffLocation}</div>
                                        </div>
                                    ))}

                                    <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Type</label>
                                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="trans-type">
                                                    <option value="uber">Uber / Lyft</option>
                                                    <option value="taxi">Taxi / Sedan</option>
                                                    <option value="rental_car">Rental Car</option>
                                                    <option value="train">Train / Metro</option>
                                                    <option value="bus">Coach / Bus</option>
                                                    <option value="public_transit">Public Transit</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Pickup</label>
                                                <input type="text" placeholder="Airport Terminal 1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="trans-pickup" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Dropoff</label>
                                                <input type="text" placeholder="Hotel Name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="trans-dropoff" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Pickup Time</label>
                                                <input type="datetime-local" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="trans-time" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Confirmation #</label>
                                                <input type="text" placeholder="Optional" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="trans-conf" />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const type = (document.getElementById('trans-type') as HTMLSelectElement).value;
                                                const pickup = (document.getElementById('trans-pickup') as HTMLInputElement).value;
                                                const dropoff = (document.getElementById('trans-dropoff') as HTMLInputElement).value;
                                                const time = (document.getElementById('trans-time') as HTMLInputElement).value;
                                                const conf = (document.getElementById('trans-conf') as HTMLInputElement).value;

                                                if (pickup && dropoff && time) {
                                                    const newT = {
                                                        type: type as any,
                                                        pickupLocation: pickup,
                                                        dropoffLocation: dropoff,
                                                        pickupTime: new Date(time),
                                                        dropoffTime: new Date(new Date(time).getTime() + 30 * 60 * 1000), // assume 30m
                                                        confirmationNumber: conf,
                                                        cost: 0
                                                    };
                                                    setTripData({ ...tripData, transport: [...tripData.transport, newT] });
                                                    (document.getElementById('trans-pickup') as HTMLInputElement).value = '';
                                                    (document.getElementById('trans-dropoff') as HTMLInputElement).value = '';
                                                }
                                            }}
                                            className="mt-4 w-full py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            Add Transportation
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'expenses' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Estimated Expenses</h3>
                                        <span className="text-sm text-slate-500">track trip budget</span>
                                    </div>

                                    {tripData.expenses.map((e, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{e.category}</p>
                                                <p className="text-xs text-slate-500">{e.description}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="font-bold text-slate-900 dark:text-white">${e.amount}</span>
                                                <button onClick={() => {
                                                    const nextE = [...tripData.expenses];
                                                    nextE.splice(idx, 1);
                                                    setTripData({ ...tripData, expenses: nextE });
                                                }} className="text-slate-400 hover:text-red-500">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Category</label>
                                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="exp-cat">
                                                    <option value="flight">Flight</option>
                                                    <option value="hotel">Hotel</option>
                                                    <option value="transport">Transport</option>
                                                    <option value="meal">Meal</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Amount ($)</label>
                                                <input type="number" placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="exp-amount" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">Description</label>
                                                <input type="text" placeholder="Lunch at airport" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 sm:text-sm" id="exp-desc" />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const cat = (document.getElementById('exp-cat') as HTMLSelectElement).value;
                                                const amount = (document.getElementById('exp-amount') as HTMLInputElement).value;
                                                const desc = (document.getElementById('exp-desc') as HTMLInputElement).value;

                                                if (amount && desc) {
                                                    const newE = {
                                                        category: cat as any,
                                                        amount: parseFloat(amount),
                                                        description: desc,
                                                        date: new Date()
                                                    };
                                                    setTripData({ ...tripData, expenses: [...tripData.expenses, newE] });
                                                    (document.getElementById('exp-amount') as HTMLInputElement).value = '';
                                                    (document.getElementById('exp-desc') as HTMLInputElement).value = '';
                                                }
                                            }}
                                            className="mt-4 w-full py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            Add Expense
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center text-lg font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <span>Total Estimated Cost</span>
                                        <span>${tripData.expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            {step === 'review' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Summary</h3>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-2">
                                        <p><strong>Trip:</strong> {tripData.name}</p>
                                        <p><strong>Destination:</strong> {tripData.destination}</p>
                                        <p><strong>Dates:</strong> {tripData.startDate} to {tripData.endDate}</p>
                                        <p><strong>Purpose:</strong> {tripData.purpose}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                                        <div className="w-4 h-4 rounded border border-blue-600 bg-blue-600 flex items-center justify-center text-white">
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <span>Automatically add to calendar</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleNext}
                        >
                            {step === 'review' ? 'Create Trip' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                        {step !== 'details' && (
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={handleBack}
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
