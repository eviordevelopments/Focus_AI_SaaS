import { format, addDays, startOfWeek, isSameDay, getHours, getMinutes, differenceInMinutes, addHours, startOfDay } from 'date-fns';

interface WeekViewProps {
    date: Date;
    tasks: any[];
    habits: any[];
    onDateClick?: (date: Date) => void;
    onEventClick?: (task: any) => void;
}

export default function WeekView({ date, tasks, habits, onDateClick, onEventClick }: WeekViewProps) {
    const startDate = startOfWeek(date);
    const dayHeaders = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: 24 }).map((_, i) => i); // 0 to 23

    const getTaskStyle = (task: any) => {
        const start = task.start_time ? new Date(task.start_time) : new Date(task.due_date);
        const startHour = getHours(start);
        const startMin = getMinutes(start);
        const durationMinutes = task.end_time
            ? differenceInMinutes(new Date(task.end_time), start)
            : 60;

        const top = (startHour * 64) + (startMin * (64 / 60));
        const height = (durationMinutes * (64 / 60));

        return {
            top: `${top}px`,
            height: `${Math.max(height, 28)}px`,
        };
    };

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
                    <div className="w-16 flex-shrink-0 border-r border-white/10 bg-white/5 text-[10px] text-gray-500 font-bold">
                        {hours.map(hour => (
                            <div key={hour} className="h-16 border-b border-white/5 flex justify-center items-start pt-2 relative">
                                <span className="-mt-1 uppercase">{format(addHours(startOfDay(date), hour), 'ha')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    <div className="flex-1 grid grid-cols-7 relative">
                        {/* Horizontal Hour Lines (Background) */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {hours.map(hour => (
                                <div key={hour} className="h-16 border-b border-white/5 w-full" />
                            ))}
                        </div>

                        {dayHeaders.map((day, i) => {
                            const dayTasks = tasks.filter(t => {
                                const targetDate = t.start_time || t.due_date;
                                if (targetDate && isSameDay(new Date(targetDate), day)) return true;
                                if (t.is_recurring && t.recurring_days) {
                                    try {
                                        const days = typeof t.recurring_days === 'string' ? JSON.parse(t.recurring_days) : t.recurring_days;
                                        const todayDay = format(day, 'EEE');
                                        if (Array.isArray(days) && days.includes(todayDay)) {
                                            const start = new Date(t.start_time || t.created_at || new Date());
                                            return start <= day;
                                        }
                                    } catch (e) { return false; }
                                }
                                return false;
                            });

                            return (
                                <div key={i} className="border-l border-white/5 first:border-l-0 relative h-full z-10">
                                    {dayTasks.map((task, idx) => {
                                        const style = getTaskStyle(task);
                                        return (
                                            <div
                                                key={task.id || idx}
                                                className="absolute left-[2px] right-[2px] rounded p-1.5 text-[10px] border shadow-md cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all overflow-hidden z-20"
                                                style={{
                                                    ...style,
                                                    backgroundColor: `${task.color || '#6366f1'}44`,
                                                    borderColor: task.color || '#6366f1',
                                                    borderLeftWidth: '3px'
                                                }}
                                                onClick={() => onEventClick && onEventClick(task)}
                                            >
                                                <div className="font-bold text-white truncate shadow-black drop-shadow-sm">{task.title}</div>
                                                <div className="text-white/60 font-medium">
                                                    {format(new Date(task.start_time || task.due_date), 'h:mm a')}
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
