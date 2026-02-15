import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, getHours, getMinutes, differenceInMinutes, addHours, startOfDay } from 'date-fns';

interface WeekViewProps {
    date: Date;
    tasks: any[];
    habits: any[];
    onDateClick?: (date: Date) => void;
    onEventClick?: (task: any) => void;
}

export default function WeekView({ date, tasks, habits, onDateClick, onEventClick }: WeekViewProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const startDate = startOfWeek(date);
    const dayHeaders = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: 24 }).map((_, i) => i); // 0 to 23

    const getSafeDate = (val: any) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    };

    const getTaskStyle = (task: any) => {
        const start = getSafeDate(task.start_time) || getSafeDate(task.due_date);
        if (!start) return { top: '0px', height: '0px', display: 'none' };

        const startHour = getHours(start);
        const startMin = getMinutes(start);

        let durationMinutes = 60;
        if (task.end_time) {
            const end = getSafeDate(task.end_time);
            if (end) {
                durationMinutes = Math.max(differenceInMinutes(end, start), 15);
            }
        }

        const top = (startHour * 64) + (startMin * (64 / 60));
        const height = (durationMinutes * (64 / 60));

        return {
            top: `${top}px`,
            height: `${Math.max(height, 28)}px`,
        };
    };

    const nowTop = (getHours(now) * 64) + (getMinutes(now) * (64 / 60));

    return (
        <div className="flex flex-col h-full bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-white/10 bg-white/5">
                <div className="w-16 flex-shrink-0 border-r border-white/10 bg-black/10" />
                <div className="flex-1 grid grid-cols-7">
                    {dayHeaders.map((day, i) => (
                        <div key={i} className="py-3 text-center border-l border-white/5 first:border-l-0 cursor-pointer hover:bg-white/5" onClick={() => onDateClick && onDateClick(day)}>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{format(day, 'EEE')}</div>
                            <div className={`mt-1 text-lg font-bold ${isSameDay(day, new Date()) ? 'text-indigo-400' : 'text-white'}`}>
                                {format(day, 'd')}
                            </div>
                            {/* Habit Indicators */}
                            <div className="flex justify-center gap-0.5 mt-1 h-1.5">
                                {habits.filter(h => (h.completed_dates || []).includes(format(day, 'yyyy-MM-dd'))).slice(0, 3).map((_, idx) => (
                                    <div key={idx} className="w-1 h-1 rounded-full bg-emerald-500" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="flex min-h-[1536px]"> {/* 24 * 64px */}
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-white/10 bg-white/5 text-[10px] text-gray-500 font-bold relative">
                        {hours.map(hour => (
                            <div key={hour} className="h-16 border-b border-white/5 flex justify-center items-start pt-2 relative">
                                <span className="-mt-1 uppercase">{format(addHours(startOfDay(date), hour), 'ha')}</span>
                            </div>
                        ))}
                        {/* Current Time Indicator Mini */}
                        <div className="absolute left-0 w-full h-px bg-rose-500 z-50 pointer-events-none flex items-center justify-end pr-1" style={{ top: `${nowTop}px` }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        </div>
                    </div>

                    {/* Days Columns */}
                    <div className="flex-1 grid grid-cols-7 relative">
                        {/* Horizontal Hour Lines (Background) */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {hours.map(hour => (
                                <div key={hour} className="h-16 border-b border-white/5 w-full" />
                            ))}
                        </div>

                        {/* Current Time Indicator Line */}
                        <div className="absolute left-0 w-full h-px bg-rose-500 z-40 pointer-events-none" style={{ top: `${nowTop}px` }}>
                            <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                        </div>

                        {dayHeaders.map((day, i) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const dayOfWeek = day.getDay();

                            const dayTasks = tasks.filter(t => {
                                const targetDate = t.start_time || t.due_date;
                                const parsedTarget = getSafeDate(targetDate);
                                if (parsedTarget && isSameDay(parsedTarget, day)) return true;

                                if (t.is_recurring && t.recurring_days) {
                                    try {
                                        const days = typeof t.recurring_days === 'string' ? JSON.parse(t.recurring_days) : t.recurring_days;
                                        const todayDay = format(day, 'EEE');
                                        if (Array.isArray(days) && days.includes(todayDay)) {
                                            const start = getSafeDate(t.start_time || t.created_at) || new Date();
                                            return startOfDay(start) <= startOfDay(day);
                                        }
                                    } catch (e) { return false; }
                                }
                                return false;
                            });

                            const dayHabits = habits.filter(h => {
                                if (h.is_active === false) return false;
                                let days = h.days_of_week;
                                if (typeof days === 'string') {
                                    try { days = JSON.parse(days); } catch { days = []; }
                                }
                                return Array.isArray(days) && days.includes(dayOfWeek);
                            });

                            const allDayEvents = [
                                ...dayTasks.map(t => ({ ...t, calendarType: 'task' })),
                                ...dayHabits.map(h => ({
                                    ...h,
                                    title: h.name,
                                    color: h.color_hex || '#6366f1',
                                    calendarType: 'habit',
                                    isDone: (h.completed_dates || []).includes(dayStr)
                                }))
                            ].sort((a, b) => {
                                const timeA = a.start_time || '00:00';
                                const timeB = b.start_time || '00:00';
                                return timeA.localeCompare(timeB);
                            });

                            return (
                                <div key={i} className="border-l border-white/5 first:border-l-0 relative h-full z-10 text-white">
                                    {allDayEvents.map((item, idx) => {
                                        const style = getTaskStyle(item);
                                        const displayTime = getSafeDate(item.start_time || item.due_date);

                                        return (
                                            <div
                                                key={item.id || idx}
                                                className={`absolute left-[2px] right-[2px] rounded p-1.5 text-[10px] border shadow-md cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all overflow-hidden z-20 ${item.isDone ? 'opacity-50 grayscale' : ''}`}
                                                style={{
                                                    ...style,
                                                    backgroundColor: `${item.color || '#6366f1'}44`,
                                                    borderColor: item.color || '#6366f1',
                                                    borderLeftWidth: '3px',
                                                    textDecoration: item.isDone ? 'line-through' : 'none'
                                                }}
                                                onClick={() => onEventClick && onEventClick(item)}
                                            >
                                                <div className="font-bold text-white truncate shadow-black drop-shadow-sm flex items-center justify-between">
                                                    <span>{item.title}</span>
                                                    {item.calendarType === 'habit' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                                </div>
                                                <div className="text-white/60 font-medium">
                                                    {displayTime ? format(displayTime, 'h:mm a') : 'All Day'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
