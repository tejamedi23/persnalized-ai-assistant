import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useCalendar } from '../context/CalendarContext';
import { Clock, BookOpen, User, Briefcase, Upload, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { extractScheduleFromImage } from '../services/LLMService';

export const Timetable: React.FC = () => {
    const { events, currentDate, addEvent, setCurrentDate } = useCalendar();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startDate, i)); // Mon-Fri
    const timeSlots = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSyncing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const aiEvents = await extractScheduleFromImage(base64, currentDate);

            if (aiEvents && aiEvents.length > 0) {
                aiEvents.forEach(evt => {
                    addEvent({
                        ...evt,
                        start: new Date(evt.start),
                        end: new Date(evt.end)
                    });
                });
                // Auto-navigate to the first event's week
                setCurrentDate(new Date(aiEvents[0].start));
            }
            setIsSyncing(false);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const getEventForSlot = (day: Date, hour: number) => {
        return events.find(e => {
            const eventDate = new Date(e.start);
            return isSameDay(eventDate, day) && eventDate.getHours() === hour;
        });
    };

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'meeting': return <Briefcase className="w-3 h-3" />;
            case 'personal': return <User className="w-3 h-3" />;
            default: return <BookOpen className="w-3 h-3" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6 overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Timetable</h2>
                    <p className="text-slate-500 text-sm">Synchronized with your Professional Ecosystem</p>
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

            <div className="flex-1 overflow-auto glass-panel p-1">
                <div className="min-w-[800px] h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex flex-col">
                    {/* Header */}
                    <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="p-4 border-r border-slate-100 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{format(day, 'EEE')}</p>
                                <p className="text-sm font-bold text-slate-700">{format(day, 'MM/dd')}</p>
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
                                {weekDays.map(day => {
                                    const event = getEventForSlot(day, hour);
                                    return (
                                        <div key={day.toISOString()} className="p-1 border-r border-slate-50 last:border-r-0 relative group">
                                            {event ? (
                                                <div className={clsx(
                                                    "h-full w-full rounded-xl p-3 flex flex-col border shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
                                                    event.type === 'meeting' ? "bg-blue-50 border-blue-100 text-blue-700" :
                                                        event.type === 'personal' ? "bg-amber-50 border-amber-100 text-amber-700" :
                                                            "bg-slate-50 border-slate-100 text-slate-700"
                                                )}>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        {getCategoryIcon(event.type)}
                                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                                                            {event.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-bold truncate leading-tight">{event.title}</p>
                                                    <p className="text-[10px] opacity-70 mt-auto">{format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}</p>
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
