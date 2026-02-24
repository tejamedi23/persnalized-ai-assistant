export type TransitMode = 'flight' | 'train' | 'bus' | 'transit';

export interface TravelOption {
    id: string;
    mode: TransitMode;
    provider: string;
    departure: string;
    arrival: string;
    duration: string;
    price: string;
    stops: number;
    details: string;
}

export const searchTravel = async (from: string, to: string, mode: TransitMode): Promise<TravelOption[]> => {
    // Simulated search results
    await new Promise(resolve => setTimeout(resolve, 1500));

    const providers = {
        flight: ['Air India', 'Indigo', 'Emirates', 'British Airways'],
        train: ['Indian Railways', 'Eurostar', 'Amtrak'],
        bus: ['Greyhound', 'FlixBus', 'National Express'],
        transit: ['Uber', 'Local Metro', 'City Bus']
    };

    const currentProviders = providers[mode] || providers.transit;

    return Array.from({ length: 4 }).map((_, i) => ({
        id: `${mode}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        mode,
        provider: currentProviders[i % currentProviders.length],
        departure: `${from} ${10 + i}:00 AM`,
        arrival: `${to} ${4 + i}:00 PM`,
        duration: '6h 00m',
        price: mode === 'flight' ? `₹${32000 + i * 5000}` : `₹${1200 + i * 400}`,
        stops: i % 2,
        details: mode === 'flight' ? 'Economy Class' : 'Standard Seating'
    }));
};

export interface JourneyComparison {
    fastest: TravelOption;
    cheapest: TravelOption;
    recommendation: string;
}

export const getJourneyComparison = (options: TravelOption[]): JourneyComparison | null => {
    if (options.length === 0) return null;

    const sortedByPrice = [...options].sort((a, b) =>
        parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''))
    );

    const cheapest = sortedByPrice[0];
    const fastest = options[0]; // Simplified for mock

    return {
        fastest,
        cheapest,
        recommendation: `Taking a ${cheapest.mode} will save you ${parseInt(fastest.price.replace(/[^\d]/g, '')) - parseInt(cheapest.price.replace(/[^\d]/g, ''))} compared to the fastest option.`
    };
};
