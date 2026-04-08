import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useCalendar } from '../context/CalendarContext';
import { Clock, BookOpen, User, Briefcase, Upload, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { extractScheduleFromImage } from '../services/LLMService';

export const Timetable: React.FC = () => {
    const { events, currentDate, addEvent, setCurrentDate } = useCalendar();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [syncResult, setSyncResult] = React.useState<{ count: number; success: boolean } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startDate, i)); // Mon-Fri
    const timeSlots = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSyncing(true);
        setSyncResult(null);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const aiEvents = await extractScheduleFromImage(base64, currentDate);

            if (aiEvents && aiEvents.length > 0) {
                aiEvents.forEach(evt => {
                    addEvent({
                        title: evt.title,
                        description: evt.description || `Synced from timetable`,
                        start: new Date(evt.start),
                        end: new Date(evt.end),
                        type: evt.type || 'work',
                        recurrence: 'none'
                    });
                });
                // Auto-navigate to the first event's week
                setCurrentDate(new Date(aiEvents[0].start));
                setSyncResult({ count: aiEvents.length, success: true });
            } else {
                setSyncResult({ count: 0, success: false });
            }
            setIsSyncing(false);
            // Reset file input so the same file can be re-uploaded
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    // Get ALL events that start during a given hour slot on a given day
    const getEventsForSlot = (day: Date, hour: number) => {
        return events.filter(e => {
            const eventStart = new Date(e.start);
            return isSameDay(eventStart, day) && eventStart.getHours() === hour;
        });
    };

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'meeting': return <Briefcase className="w-3 h-3" />;
            case 'personal': return <User className="w-3 h-3" />;
            default: return <BookOpen className="w-3 h-3" />;
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'meeting': return "bg-blue-50 border-blue-100 text-blue-700";
            case 'work': return "bg-indigo-50 border-indigo-100 text-indigo-700";
            case 'personal': return "bg-amber-50 border-amber-100 text-amber-700";
            case 'call': return "bg-green-50 border-green-100 text-green-700";
            default: return "bg-slate-50 border-slate-100 text-slate-700";
        }
    };

    // Count total synced events in the current week
    const weekEventCount = weekDays.reduce((total, day) => {
        return total + events.filter(e => isSameDay(new Date(e.start), day)).length;
    }, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6 overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Timetable</h2>
                    <p className="text-slate-500 text-sm">
                        Synchronized with your Professional Ecosystem
                        {weekEventCount > 0 && (
                            <span className="ml-2 text-blue-600 font-bold">• {weekEventCount} events this week</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleUploadClick}
                        disabled={isSyncing}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all",
                            isSyncing ? "bg-slate-50 text-slate-400 border-slate-200" : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
                        )}
                    >
                        {isSyncing ? (
                            <>
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-3 h-3" />
                                Upload & Sync
                            </>
                        )}
                    </button>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        LIVE SYNC ACTIVE
                    </div>
                </div>
            </div>

            {/* Sync Result Notification */}
            {syncResult && (
                <div className={clsx(
                    "mb-4 px-4 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all",
                    syncResult.success
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-600"
                )}>
                    {syncResult.success ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Successfully synced {syncResult.count} events from timetable!
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Could not extract events. Try a clearer image.
                        </>
                    )}
                    <button
                        onClick={() => setSyncResult(null)}
                        className="ml-auto text-xs opacity-60 hover:opacity-100"
                    >✕</button>
                </div>
            )}

            <div className="flex-1 overflow-auto glass-panel p-1">
                <div className="min-w-[800px] h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex flex-col">
                    {/* Header */}
                    <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="p-4 border-r border-slate-100 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        {weekDays.map((day, idx) => (
                            <div key={`day-header-${idx}`} className={clsx(
                                "p-4 text-center border-r border-slate-100 last:border-r-0",
                                isSameDay(day, new Date()) && "bg-blue-50/50"
                            )}>
                                <p className={clsx(
                                    "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                                    isSameDay(day, new Date()) ? "text-blue-600" : "text-slate-400"
                                )}>{format(day, 'EEEE')}</p>
                                <p className={clsx(
                                    "text-sm font-bold",
                                    isSameDay(day, new Date()) ? "text-blue-700" : "text-slate-700"
                                )}>{format(day, 'MMM dd')}</p>
                            </div>
                        ))}
                    </div>

                    {/* Grid Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {timeSlots.map(hour => (
                            <div key={hour} className="grid grid-cols-6 border-b border-slate-50 last:border-b-0 min-h-[80px]">
                                <div className="p-4 border-r border-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-50/20">
                                    {hour % 12 || 12} {hour >= 12 ? 'PM' : 'AM'}
                                </div>
                                {weekDays.map((day, dayIdx) => {
                                    const slotEvents = getEventsForSlot(day, hour);
                                    return (
                                        <div key={`slot-${dayIdx}-${hour}`} className={clsx(
                                            "p-1 border-r border-slate-50 last:border-r-0 relative group",
                                            isSameDay(day, new Date()) && "bg-blue-50/20"
                                        )}>
                                            {slotEvents.length > 0 ? (
                                                <div className="flex flex-col gap-1 h-full">
                                                    {slotEvents.map((event, evtIdx) => (
                                                        <div
                                                            key={`${event.id}-${evtIdx}`}
                                                            className={clsx(
                                                                "flex-1 rounded-xl p-2.5 flex flex-col border shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
                                                                getEventColor(event.type)
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                {getCategoryIcon(event.type)}
                                                                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">
                                                                    {event.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] font-bold truncate leading-tight">{event.title}</p>
                                                            <p className="text-[9px] opacity-70 mt-auto">
                                                                {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full w-full rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-[10px] font-bold text-blue-500 hover:text-blue-700 py-1 px-2 bg-blue-50 rounded-lg">
                                                        + ADD
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
