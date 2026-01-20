export interface Email {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    summary?: string;
    content: string;
    timestamp: string;
}

export const getEmails = async (): Promise<Email[]> => {
    return [
        {
            id: '1',
            from: 'Trip.com',
            subject: 'Your Flight Booking Confirmation',
            snippet: 'Thank you for booking with us. Your flight to London is confirmed...',
            content: 'Hello, your flight from Delhi to London is confirmed for Jan 25th. Seats 22A, 22B. Please check in 3 hours before departure.',
            timestamp: '2 hours ago'
        },
        {
            id: '2',
            from: 'Atlas Travel',
            subject: 'New Flight Options Available',
            snippet: 'We found some new routes for your upcoming trip to London...',
            content: 'Based on your recent search, we found flights starting from ₹35,000 for next week.',
            timestamp: '5 hours ago'
        }
    ];
};

export const summarizeEmail = async (content: string): Promise<string> => {
    // Simulated AI summarization
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Summary: ${content.substring(0, 50)}... [AI Generated]`;
};
