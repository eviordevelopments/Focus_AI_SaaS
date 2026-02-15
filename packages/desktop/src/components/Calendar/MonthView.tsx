import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, startOfDay } from 'date-fns';

interface MonthViewProps {
    date: Date;
    tasks: any[];
    habits: any[];
    onDateClick?: (date: Date) => void;
}

const getSafeDate = (val: any) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
};

export default function MonthView({ date, tasks, habits, onDateClick }: MonthViewProps) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    return (
        <div className="flex flex-col h-full bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                {dayLabels.map((day, i) => (
                    <div key={i} className="py-3 text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
                {calendarDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayOfWeek = day.getDay();

                    // Filter Tasks (including systems and recurring tasks)
                    const dayTasks = tasks.filter(t => {
                        const dayStrFull = format(day, 'yyyy-MM-dd');
                        if (t.due_date?.startsWith(dayStrFull)) return true;
                        if (t.start_time?.startsWith(dayStrFull)) return true;

                        if (t.is_recurring && t.recurring_days) {
                            try {
                                const days = typeof t.recurring_days === 'string' ? JSON.parse(t.recurring_days) : t.recurring_days;
                                const todayDay = format(day, 'EEE');
                                if (Array.isArray(days) && days.includes(todayDay)) {
                                    // Make sure it started before or on this day
                                    const start = getSafeDate(t.start_time || t.created_at || '2000-01-01');
                                    if (!start) return false;
                                    return startOfDay(start) <= startOfDay(day);
                                }
                            } catch (e) { return false; }
                        }
                        return false;
                    });

                    // Filter Scheduled Habits
                    const dayHabits = habits.filter(h => {
                        if (h.is_active === false) return false;
                        let days = h.days_of_week;
                        // Handle parsing if it comes as string from DB
                        if (typeof days === 'string') {
                            try { days = JSON.parse(days); } catch { days = []; }
                        }
                        return Array.isArray(days) && days.includes(dayOfWeek);
                    });

                    // Merge items for display
                    const allItems = [
                        ...dayHabits.map(h => ({
                            id: `habit-${h.id}-${dayStr}`,
                            title: h.name,
                            color: h.color_hex || '#6366f1',
                            type: 'habit',
                            isDone: (h.completed_dates || []).includes(dayStr),
                            time: h.start_time
                        })),
                        ...dayTasks.map(t => ({
                            id: t.id,
                            title: t.title,
                            color: t.color || '#10b981',
                            type: 'task',
                            isDone: t.status === 'done',
                            time: (() => {
                                if (!t.start_time) return null;
                                const d = new Date(t.start_time);
                                return isNaN(d.getTime()) ? null : format(d, 'HH:mm');
                            })()
                        }))
                    ].sort((a, b) => {
                        // Simple sort by time if available
                        if (a.time && b.time) return a.time.localeCompare(b.time);
                        if (a.time) return -1;
                        if (b.time) return 1;
                        return 0;
                    });

                    const isSelectedMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                border-r border-b border-white/5 p-2 relative group hover:bg-white/5 transition-colors cursor-pointer flex flex-col gap-1
                                ${!isSelectedMonth ? 'opacity-30 bg-black/10' : ''}
                                ${isToday(day) ? 'bg-indigo-500/10' : ''}
                            `}
                            onClick={() => onDateClick && onDateClick(day)}
                        >
                            <div className="flex justify-between items-start shrink-0">
                                <span className={`
                                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday(day) ? 'bg-indigo-500 text-white' : 'text-gray-300'}
                                `}>
                                    {format(day, dateFormat)}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-0">
                                {allItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-[9px] px-1.5 py-0.5 rounded truncate border-l-2 mb-0.5 flex items-center justify-between gap-1 shadow-sm`}
                                        style={{
                                            backgroundColor: `${item.color}44`, // 25% opacity
                                            borderColor: item.color,
                                            color: item.isDone ? '#9ca3af' : 'white',
                                            textDecoration: item.isDone ? 'line-through' : 'none',
                                            opacity: item.isDone ? 0.4 : 1
                                        }}
                                        title={`${item.title} ${item.time ? '@ ' + item.time : ''}`}
                                    >
                                        <span className="truncate">{item.title}</span>
                                        {item.time && <span className="opacity-70 text-[8px]">{item.time}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
