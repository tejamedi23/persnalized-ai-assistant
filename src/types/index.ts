export type EventType = 'meeting' | 'call' | 'personal' | 'work' | 'other';

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    start: Date;
    end: Date;
    type: EventType;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export type ConflictSeverity = 'critical' | 'warning' | 'tight';

export interface Conflict {
    id: string;
    eventIds: string[];
    severity: ConflictSeverity;
    description: string;
    timestamp: Date;
}

export type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda' | 'analytics' | 'travel' | 'email';

export interface CalendarState {
    events: CalendarEvent[];
    user: User | null;
    currentDate: Date;
    conflicts: Conflict[];
    viewMode: CalendarViewMode;
    setViewMode: (mode: CalendarViewMode) => void;
}

// Travel Types
export type TripPurpose = 'business' | 'personal' | 'conference';
export type FlightStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed';
export type TransportType = 'rental_car' | 'taxi' | 'uber' | 'train' | 'bus';

export interface Flight {
    id: string;
    airline: string;
    flightNumber: string;
    departureCity: string;
    arrivalCity: string;
    departureTime: Date;
    arrivalTime: Date;
    gate?: string;
    terminal?: string;
    seat?: string;
    status: FlightStatus;
    cost: number;
}

export interface Hotel {
    id: string;
    name: string;
    address: string;
    checkIn: Date;
    checkOut: Date;
    confirmationNumber: string;
    roomType: string;
    cost: number;
}

export interface Transport {
    id: string;
    type: TransportType;
    pickupLocation: string;
    pickupTime: Date;
    dropoffLocation: string;
    dropoffTime: Date;
    confirmationNumber?: string;
    cost: number;
}

export interface Expense {
    id: string;
    category: 'flight' | 'hotel' | 'transport' | 'meal' | 'other';
    amount: number;
    description: string;
    date: Date;
}

export interface ChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
    dueDate?: Date;
}

export interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    purpose: TripPurpose;
    flights: Flight[];
    hotels: Hotel[];
    transport: Transport[];
    expenses: Expense[];
    checklist: ChecklistItem[];
}

// Email Types
export type EmailCategory = 'meeting' | 'action' | 'fyi' | 'project' | 'client' | 'internal' | 'personal';
export type EmailTone = 'professional' | 'friendly' | 'brief' | 'detailed';

export interface EmailAttachment {
    id: string;
    filename: string;
    size: number;
    type: string;
    url: string;
}

export interface EmailSummary {
    mainPoints: string[];
    actionItems: string[];
    dates: { date: Date; topic: string }[];
    decisionsNeeded: string[];
}

export interface EmailActionItem {
    id: string;
    text: string;
    isCompleted: boolean;
    dueDate?: Date;
}

export interface Email {
    id: string;
    sender: {
        name: string;
        email: string;
        avatar?: string;
    };
    subject: string;
    body: string;
    timestamp: Date;
    isRead: boolean;
    isPriority: boolean;
    category: EmailCategory;
    attachments: EmailAttachment[];
    summary?: EmailSummary;
    actionItems: EmailActionItem[];
    threadId?: string;
    scheduledFor?: Date;
}

export interface EmailDraft {
    id: string;
    to: string;
    subject: string;
    body: string;
    category?: EmailCategory;
    tone?: EmailTone;
    lastSaved: Date;
}

export type AIActionType = 'schedule' | 'email' | 'travel' | 'task' | 'search' | 'info';

export interface AIAction {
    id: string;
    label: string;
    type: AIActionType;
    payload: any;
    isPrimary?: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    actions?: AIAction[];
    isDrafting?: boolean;
}

export interface UserPreferences {
    preferredMeetingTime: 'morning' | 'afternoon' | 'any';
    workStart: string; // "09:00"
    workEnd: string; // "18:00"
    travelBufferMinutes: number;
    emailResponseStyle: EmailTone;
}
