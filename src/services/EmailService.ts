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

export const getEmails = async (token?: string): Promise<Email[]> => {
    if (!token) {
        // Fallback to sample data if no token
        return [
            {
                id: '1',
                from: 'Trip.com',
                subject: 'Your Flight Booking Confirmation',
                snippet: 'Thank you for booking with us...',
                content: 'Hello, your flight from Delhi to London is confirmed for Jan 25th.',
                timestamp: '2 hours ago',
                category: 'updates',
                isRead: false
            }
        ];
    }

    try {
        // Fetch message list from Gmail
        const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&access_token=${token}`);
        const listData = await listRes.json();

        if (!listData.messages) return [];

        const emails: Email[] = await Promise.all(listData.messages.map(async (m: any) => {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?access_token=${token}`);
            const detail = await detailRes.json();

            const headers = detail.payload.headers;
            const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
            const date = headers.find((h: any) => h.name === 'Date')?.value || '';

            return {
                id: detail.id,
                from,
                subject,
                snippet: detail.snippet,
                content: detail.snippet, // For deep analysis, we'd need to parse parts, but snippet works for demo
                timestamp: new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                category: categorizeEmail(subject, detail.snippet),
                isRead: !detail.labelIds?.includes('UNREAD')
            };
        }));

        return emails;
    } catch (error) {
        console.error("Gmail fetch failed:", error);
        return [];
    }
};

import { analyzeEmailContent } from './LLMService';

export const summarizeEmail = async (content: string): Promise<string> => {
    const analysis = await analyzeEmailContent(content);

    // Combine summary and key insights for a rich display
    const insightsStr = analysis.keyInsights.length > 0
        ? `\n\n**Key Insights:**\n• ${analysis.keyInsights.join('\n• ')}`
        : "";

    return `${analysis.summary}${insightsStr}`;
};

export const categorizeEmail = (subject: string, content: string): EmailCategory => {
    const text = (subject + ' ' + content).toLowerCase();
    if (text.includes('urgent') || text.includes('review needed')) return 'urgent';
    if (text.includes('meeting') || text.includes('invitation') || text.includes('zoom')) return 'meeting';
    if (text.includes('social') || text.includes('invite')) return 'social';
    return 'updates';
};
