import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Email, EmailDraft, EmailCategory, EmailTone, EmailSummary, EmailActionItem } from '../types';
import { useCalendar } from './CalendarContext';
import { getEmails } from '../services/EmailService';
import { analyzeEmailContent } from '../services/LLMService';

interface EmailContextType {
    emails: Email[];
    drafts: EmailDraft[];
    scheduledEmails: Email[];
    unreadCount: number;
    sendEmail: (draft: EmailDraft) => void;
    saveDraft: (draft: EmailDraft) => void;
    deleteDraft: (id: string) => void;
    markAsRead: (id: string) => void;
    togglePriority: (id: string) => void;
    deleteEmail: (id: string) => void;
    summarizeEmail: (id: string) => Promise<void>;
    scheduleEmail: (draft: EmailDraft, date: Date) => void;
    addToCalendar: (emailId: string) => void;
    extractActionItems: (emailId: string) => void;
    toggleActionItem: (emailId: string, actionItemId: string) => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { addEvent, googleToken } = useCalendar();
    const [emails, setEmails] = useState<Email[]>([]);
    const [drafts, setDrafts] = useState<EmailDraft[]>([]);
    const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Real Emails from Gmail
    const fetchRealEmails = async (token: string) => {
        setIsLoading(true);
        const realEmails = await getEmails(token);
        // Map the service Email to the context Email if types differ slightly
        const formattedEmails: any[] = realEmails.map(e => ({
            id: e.id,
            sender: { name: e.from, email: e.from },
            subject: e.subject,
            body: e.content,
            timestamp: e.timestamp.includes(':') ? new Date() : new Date(e.timestamp), // Fallback if string is relative
            isRead: e.isRead,
            isPriority: e.category === 'urgent',
            category: e.category,
            attachments: [],
            actionItems: []
        }));
        setEmails(formattedEmails);
        setIsLoading(false);
    };

    // Persistence & Token Sync
    useEffect(() => {
        if (googleToken) {
            fetchRealEmails(googleToken);
        } else {
            const storedEmails = localStorage.getItem('calendar_emails');
            if (storedEmails) {
                setEmails(JSON.parse(storedEmails).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));
            } else if (!googleToken) {
                setEmails(generateMockEmails());
            }
        }

        const storedDrafts = localStorage.getItem('calendar_drafts');
        const storedScheduled = localStorage.getItem('calendar_scheduled');

        if (storedDrafts) setDrafts(JSON.parse(storedDrafts).map((d: any) => ({ ...d, lastSaved: new Date(d.lastSaved) })));
        if (storedScheduled) setScheduledEmails(JSON.parse(storedScheduled).map((s: any) => ({ ...s, timestamp: new Date(s.timestamp), scheduledFor: new Date(s.scheduledFor) })));
    }, [googleToken]);

    useEffect(() => {
        localStorage.setItem('calendar_emails', JSON.stringify(emails));
    }, [emails]);

    useEffect(() => {
        localStorage.setItem('calendar_drafts', JSON.stringify(drafts));
    }, [drafts]);

    useEffect(() => {
        localStorage.setItem('calendar_scheduled', JSON.stringify(scheduledEmails));
    }, [scheduledEmails]);

    const unreadCount = emails.filter(e => !e.isRead).length;

    const sendEmail = (draft: EmailDraft) => {
        // In a real app, this would call an API
        const newEmail: Email = {
            id: Math.random().toString(36).substr(2, 9),
            sender: { name: 'Me', email: 'me@example.com' },
            subject: draft.subject,
            body: draft.body,
            timestamp: new Date(),
            isRead: true,
            isPriority: false,
            category: draft.category || 'internal',
            attachments: [],
            actionItems: []
        };
        // Normally we'd add to "Sent" folder, but for this sim we'll just remove the draft
        setDrafts(prev => prev.filter(d => d.id !== draft.id));
        alert('Email sent successfully!');
    };

    const saveDraft = (draft: EmailDraft) => {
        setDrafts(prev => {
            const exists = prev.find(d => d.id === draft.id);
            if (exists) return prev.map(d => d.id === draft.id ? { ...draft, lastSaved: new Date() } : d);
            return [...prev, { ...draft, lastSaved: new Date() }];
        });
    };

    const deleteDraft = (id: string) => setDrafts(prev => prev.filter(d => d.id !== id));

    const markAsRead = (id: string) => {
        setEmails(prev => prev.map(e => e.id === id ? { ...e, isRead: true } : e));
    };

    const togglePriority = (id: string) => {
        setEmails(prev => prev.map(e => e.id === id ? { ...e, isPriority: !e.isPriority } : e));
    };

    const deleteEmail = (id: string) => setEmails(prev => prev.filter(e => e.id !== id));

    const summarizeEmail = async (id: string) => {
        const email = emails.find(e => e.id === id);
        if (!email) return;

        try {
            const analysis = await analyzeEmailContent(email.body);

            setEmails(prev => prev.map(e => {
                if (e.id === id) {
                    const summary: EmailSummary = {
                        mainPoints: analysis.keyInsights,
                        actionItems: analysis.suggestedActions.filter(a => a.type === 'info').map(a => a.label),
                        dates: analysis.suggestedActions
                            .filter(a => a.type === 'schedule')
                            .map(a => ({ date: new Date(), topic: a.label })), // Rough date extraction
                        decisionsNeeded: []
                    };
                    return { ...e, summary };
                }
                return e;
            }));
        } catch (error) {
            console.error("Failed to summarize email:", error);
        }
    };

    const scheduleEmail = (draft: EmailDraft, date: Date) => {
        const scheduled: Email = {
            id: Math.random().toString(36).substr(2, 9),
            sender: { name: 'Me', email: 'me@example.com' },
            subject: draft.subject,
            body: draft.body,
            timestamp: new Date(),
            scheduledFor: date,
            isRead: true,
            isPriority: false,
            category: draft.category || 'internal',
            attachments: [],
            actionItems: []
        };
        setScheduledEmails(prev => [...prev, scheduled]);
        setDrafts(prev => prev.filter(d => d.id !== draft.id));
    };

    const addToCalendar = (emailId: string) => {
        const email = emails.find(e => e.id === emailId);
        if (!email) return;

        // Mock parsing extraction
        const start = new Date();
        start.setHours(start.getHours() + 24, 0, 0, 0); // Tomorrow at current time
        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        addEvent({
            title: `Meeting: ${email.subject}`,
            description: `Auto-generated from email: ${email.sender.name}`,
            start,
            end,
            type: 'meeting'
        });
        alert('Event added to calendar!');
    };

    const extractActionItems = (emailId: string) => {
        setEmails(prev => prev.map(e => {
            if (e.id === emailId) {
                const actionItems: EmailActionItem[] = [
                    { id: '1', text: 'Review project proposal', isCompleted: false },
                    { id: '2', text: 'Send feedback to Sarah', isCompleted: false },
                    { id: '3', text: 'Update the spreadsheet', isCompleted: true }
                ];
                return { ...e, actionItems };
            }
            return e;
        }));
    };

    const toggleActionItem = (emailId: string, actionItemId: string) => {
        setEmails(prev => prev.map(e => {
            if (e.id === emailId) {
                return {
                    ...e,
                    actionItems: e.actionItems.map(item =>
                        item.id === actionItemId ? { ...item, isCompleted: !item.isCompleted } : item
                    )
                };
            }
            return e;
        }));
    };

    return (
        <EmailContext.Provider value={{
            emails, drafts, scheduledEmails, unreadCount,
            sendEmail, saveDraft, deleteDraft, markAsRead, togglePriority,
            deleteEmail, summarizeEmail, scheduleEmail, addToCalendar,
            extractActionItems, toggleActionItem
        }}>
            {children}
        </EmailContext.Provider>
    );
};

export const useEmail = () => {
    const context = useContext(EmailContext);
    if (context === undefined) {
        throw new Error('useEmail must be used within an EmailProvider');
    }
    return context;
};

// Helper to generate mock emails
function generateMockEmails(): Email[] {
    const categories: EmailCategory[] = ['meeting', 'action', 'fyi', 'project', 'client', 'internal'];
    const senders = [
        { name: 'Sarah Miller', email: 'sarah.m@company.com' },
        { name: 'John Peterson', email: 'john.p@client-corp.com' },
        { name: 'Google Calendar', email: 'calendar-notification@google.com' },
        { name: 'Michael Ross', email: 'm.ross@internal.com' },
        { name: 'Emma Watson', email: 'emma@design-studio.io' }
    ];

    return [
        {
            id: '1',
            sender: senders[0],
            subject: 'Q3 Strategy Meeting Request',
            body: 'Hi, I would like to schedule a meeting to discuss our Q3 strategy. Are you available sometime next week? Looking forward to your thoughts.',
            timestamp: new Date(Date.now() - 3600000), // 1h ago
            isRead: false,
            isPriority: true,
            category: 'meeting',
            attachments: [],
            actionItems: []
        },
        {
            id: '2',
            sender: senders[1],
            subject: 'Project Update: Phase 2 Completion',
            body: 'We have finished Phase 2 of the project. Please review the attached report and let me know if you have any feedback by Friday.',
            timestamp: new Date(Date.now() - 7200000 * 2), // 4h ago
            isRead: false,
            isPriority: false,
            category: 'action',
            attachments: [{ id: 'a1', filename: 'Phase2_Report.pdf', size: 1024000, type: 'application/pdf', url: '#' }],
            actionItems: []
        },
        {
            id: '3',
            sender: senders[2],
            subject: 'Invitation: Weekly Sync @ Mon Jan 19, 2026 10am - 11am',
            body: 'You have been invited to the following event: Weekly Sync. When: Jan 19, 2026, 10:00 - 11:00 AM.',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            isRead: true,
            isPriority: false,
            category: 'meeting',
            attachments: [],
            actionItems: []
        },
        {
            id: '4',
            sender: senders[3],
            subject: 'Feedback needed on internal tool',
            body: 'Hey, can you take a look at the new internal dashboard? I want to make sure the metrics are displaying correctly before we show it to the board.',
            timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
            isRead: true,
            isPriority: false,
            category: 'internal',
            attachments: [],
            actionItems: []
        },
        {
            id: '5',
            sender: senders[4],
            subject: 'Client Assets for New Campaign',
            body: 'Hi! Here are the updated assets for the brand campaign. Please share them with the social media team.',
            timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
            isRead: true,
            isPriority: false,
            category: 'client',
            attachments: [
                { id: 'a2', filename: 'Logo_Final.png', size: 512000, type: 'image/png', url: '#' },
                { id: 'a3', filename: 'Campaign_Brief.docx', size: 2048000, type: 'application/msword', url: '#' }
            ],
            actionItems: []
        }
    ];
}
