import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Trip, Flight, Hotel } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TravelContextType {
    trips: Trip[];
    activeTrip: Trip | null;
    addTrip: (trip: Omit<Trip, 'id' | 'flights' | 'hotels' | 'transport' | 'expenses' | 'checklist'>) => void;
    updateTrip: (trip: Trip) => void;
    deleteTrip: (id: string) => void;
    selectTrip: (id: string) => void;

    // Sub-item managers (simplified for now, usually would update Trip directly)
    addFlight: (tripId: string, flight: Omit<Flight, 'id'>) => void;
    addHotel: (tripId: string, hotel: Omit<Hotel, 'id'>) => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

    // Load from local storage
    useEffect(() => {
        const storedTrips = localStorage.getItem('calendar_trips');
        if (storedTrips) {
            try {
                // Need to revive dates
                const parsed = JSON.parse(storedTrips, (key, value) => {
                    if (key.includes('Date') || key.includes('Time') || key === 'checkIn' || key === 'checkOut') {
                        return new Date(value);
                    }
                    return value;
                });
                setTrips(parsed);
            } catch (e) {
                console.error("Failed to parse trips", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        if (trips.length > 0) {
            localStorage.setItem('calendar_trips', JSON.stringify(trips));
        }
    }, [trips]);

    const addTrip = (tripData: Omit<Trip, 'id' | 'flights' | 'hotels' | 'transport' | 'expenses' | 'checklist'>) => {
        const newTrip: Trip = {
            ...tripData,
            id: uuidv4(),
            flights: [],
            hotels: [],
            transport: [],
            expenses: [],
            checklist: [
                { id: uuidv4(), text: 'Book Flights', isCompleted: false },
                { id: uuidv4(), text: 'Book Hotel', isCompleted: false },
                { id: uuidv4(), text: 'Pack Bags', isCompleted: false },
            ]
        };
        setTrips([...trips, newTrip]);
        setActiveTrip(newTrip);
    };

    const updateTrip = (updatedTrip: Trip) => {
        setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
        if (activeTrip?.id === updatedTrip.id) {
            setActiveTrip(updatedTrip);
        }
    };

    const deleteTrip = (id: string) => {
        setTrips(trips.filter(t => t.id !== id));
        if (activeTrip?.id === id) {
            setActiveTrip(null);
        }
    };

    const selectTrip = (id: string) => {
        const trip = trips.find(t => t.id === id);
        setActiveTrip(trip || null);
    };

    const addFlight = (tripId: string, flightData: Omit<Flight, 'id'>) => {
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return;

        const newFlight: Flight = { ...flightData, id: uuidv4() };
        const updatedTrip = { ...trip, flights: [...trip.flights, newFlight] };
        updateTrip(updatedTrip);
    };

    const addHotel = (tripId: string, hotelData: Omit<Hotel, 'id'>) => {
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return;

        const newHotel: Hotel = { ...hotelData, id: uuidv4() };
        const updatedTrip = { ...trip, hotels: [...trip.hotels, newHotel] };
        updateTrip(updatedTrip);
    };

    return (
        <TravelContext.Provider value={{
            trips,
            activeTrip,
            addTrip,
            updateTrip,
            deleteTrip,
            selectTrip,
            addFlight,
            addHotel
        }}>
            {children}
        </TravelContext.Provider>
    );
};

export const useTravel = () => {
    const context = useContext(TravelContext);
    if (!context) throw new Error('useTravel must be used within a TravelProvider');
    return context;
};
