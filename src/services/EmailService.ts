export type EmailCategory = 'urgent' | 'meeting' | 'social' | 'updates';

export interface Email {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    summary?: string;
    content: string;
    timestamp: string;
    category: EmailCategory;
    isRead: boolean;
}

export const getEmails = async (): Promise<Email[]> => {
    return [
        {
            id: '1',
            from: 'Trip.com',
            subject: 'Your Flight Booking Confirmation',
            snippet: 'Thank you for booking with us. Your flight to London is confirmed...',
            content: 'Hello, your flight from Delhi to London is confirmed for Jan 25th. Seats 22A, 22B. Please check in 3 hours before departure.',
            timestamp: '2 hours ago',
            category: 'updates',
            isRead: false
        },
        {
            id: '2',
            from: 'Atlas Travel',
            subject: 'New Flight Options Available',
            snippet: 'We found some new routes for your upcoming trip to London...',
            content: 'Based on your recent search, we found flights starting from ₹35,000 for next week.',
            timestamp: '5 hours ago',
            category: 'updates',
            isRead: true
        },
        {
            id: '3',
            from: 'Project Manager',
            subject: 'URGENT: API Review Needed',
            snippet: 'Please review the latest API spec before the EOD...',
            content: 'Hi Team, we need to finalize the API endpoints for the Calendar AI project. Please take a look at the attached doc.',
            timestamp: '15 mins ago',
            category: 'urgent',
            isRead: false
        },
        {
            id: '4',
            from: 'Zoom Invitations',
            subject: 'Meeting Invitation: Quarterly Sync',
            snippet: 'You have been invited to a meeting...',
            content: 'Please join us for the Quarterly Business Review on Friday at 2:00 PM.',
            timestamp: '1 hour ago',
            category: 'meeting',
            isRead: false
        }
    ];
};

export const summarizeEmail = async (content: string): Promise<string> => {
    // Simulated AI summarization with more context-aware response
    await new Promise(resolve => setTimeout(resolve, 1000));

    const analysis = content.toLowerCase().includes('urgent')
        ? "🚨 [CRITICAL ALERT] This message requires immediate action. "
        : content.toLowerCase().includes('meeting')
            ? "🗓️ [SCHEDULE UPDATE] Related to upcoming commitments. "
            : "💡 [AI INSIGHT] Summary of communication: ";

    return `${analysis}${content.substring(0, 80)}... [Full vector analysis completed by Personalized Assistant]`;
};

export const categorizeEmail = (subject: string, content: string): EmailCategory => {
    const text = (subject + ' ' + content).toLowerCase();
    if (text.includes('urgent') || text.includes('review needed')) return 'urgent';
    if (text.includes('meeting') || text.includes('invitation') || text.includes('zoom')) return 'meeting';
    if (text.includes('social') || text.includes('invite')) return 'social';
    return 'updates';
};
