import { format, addHours, startOfDay, getHours, getMinutes, differenceInMinutes, isSameDay } from 'date-fns';
import { useMemo, useState } from 'react';
import { MapPin, Clock, Zap, ChevronRight, X, Link as LinkIcon } from 'lucide-react';

interface DayViewProps {
    date: Date;
    tasks: any[];
    habits: any[];
    onTimeClick?: (date: Date) => void;
    onEventClick?: (task: any) => void;
}

export default function DayView({ date, tasks, habits, onTimeClick, onEventClick }: DayViewProps) {
    const hours = Array.from({ length: 24 }).map((_, i) => i); // 0 to 23
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    // Filter tasks for this day
    const dayTasks = useMemo(() => {
        return tasks.filter(t => {
            const targetDate = t.start_time || t.due_date;
            if (targetDate && isSameDay(new Date(targetDate), date)) return true;

            if (t.is_recurring && t.recurring_days) {
                try {
                    const days = typeof t.recurring_days === 'string' ? JSON.parse(t.recurring_days) : t.recurring_days;
                    const todayDay = format(date, 'EEE');
                    if (Array.isArray(days) && days.includes(todayDay)) {
                        const start = new Date(t.start_time || t.created_at || new Date());
                        return start <= date;
                    }
                } catch (e) {
                    return false;
                }
            }
            return false;
        });
    }, [tasks, date]);

    // Calculate positioning
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
            height: `${Math.max(height, 32)}px`,
        };
    };

    return (
        <div className="flex flex-col h-full bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{format(date, 'EEEE, MMMM do')}</h2>
                <div className="flex gap-2">
                    {habits.filter(h => (h.completed_dates || []).includes(format(date, 'yyyy-MM-dd'))).map(h => (
                        <div key={h.id} className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-bold uppercase tracking-widest" title={h.name}>
                            {h.name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative" onClick={() => setSelectedTask(null)}>
                <div className="relative h-[1536px]"> {/* 24 * 64px */}

                    {/* Grid Lines & Times */}
                    {hours.map(hour => (
                        <div
                            key={hour}
                            className="absolute w-full border-b border-white/5 flex items-start group hover:bg-white/5 transition-colors"
                            style={{ top: `${hour * 64}px`, height: '64px' }}
                            onClick={() => {
                                const clickDate = startOfDay(date);
                                clickDate.setHours(hour);
                                onTimeClick && onTimeClick(clickDate);
                            }}
                        >
                            <span className="w-16 text-right pr-4 text-xs text-gray-500 -mt-2 group-hover:text-white transition-colors">
                                {format(addHours(startOfDay(date), hour), 'h a')}
                            </span>
                        </div>
                    ))}

                    {/* Events */}
                    <div className="absolute left-16 right-4 top-0 bottom-0 pointer-events-none">
                        {dayTasks.map((task, i) => {
                            const style = getTaskStyle(task);
                            const isActive = selectedTask?.id === task.id;

                            return (
                                <div
                                    key={task.id || i}
                                    className={`absolute left-0 right-0 rounded-lg p-2 border shadow-lg cursor-pointer pointer-events-auto hover:brightness-110 hover:scale-[1.01] transition-all overflow-hidden ${isActive ? 'ring-2 ring-white z-20' : 'z-10'}`}
                                    style={{
                                        ...style,
                                        backgroundColor: task.color || '#6366f1',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTask(task);
                                    }}
                                    onMouseEnter={() => setSelectedTask(task)}
                                >
                                    <div className="font-bold text-white text-sm shadow-black drop-shadow-md truncate">
                                        {task.title}
                                    </div>
                                    <div className="text-xs text-white/80 truncate flex items-center gap-1">
                                        {format(new Date(task.start_time || task.due_date), 'h:mm a')}
                                        {task.location && <span>• {task.location}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Popover */}
                    {selectedTask && (
                        <div
                            className="absolute z-[100] w-72 bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
                            style={{
                                top: `${Math.min(parseFloat(getTaskStyle(selectedTask).top), 1536 - 250)}px`,
                                left: '70px',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: selectedTask.color || '#6366f1' }}>
                                    <Clock className="text-white" size={16} />
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">{selectedTask.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                <Clock size={12} />
                                <span>
                                    {format(new Date(selectedTask.start_time || selectedTask.due_date), 'h:mm a')}
                                    {selectedTask.end_time && ` - ${format(new Date(selectedTask.end_time), 'h:mm a')}`}
                                </span>
                            </div>

                            <div className="space-y-3 mb-5">
                                {selectedTask.location && (
                                    <div className="flex items-center gap-2 text-xs text-gray-300">
                                        <MapPin size={12} className="text-gray-500" />
                                        <span>{selectedTask.location}</span>
                                    </div>
                                )}
                                {selectedTask.links && (
                                    <div className="flex items-center gap-2 text-xs text-blue-400">
                                        <LinkIcon size={12} />
                                        <span className="truncate">{selectedTask.links}</span>
                                    </div>
                                )}
                                {selectedTask.description && (
                                    <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-white/10 pl-2">
                                        {selectedTask.description}
                                    </p>
                                )}
                            </div>

                            {selectedTask.session_config && (
                                <button
                                    onClick={() => {
                                        onEventClick && onEventClick(selectedTask);
                                        setSelectedTask(null);
                                    }}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group"
                                >
                                    <Zap size={14} className="fill-current" />
                                    Start Focus Session
                                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Current Time Line (if today) */}
                    {isSameDay(date, new Date()) && (
                        <div
                            className="absolute left-16 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
                            style={{ top: `${(getHours(new Date()) * 64) + (getMinutes(new Date()) * (64 / 60))}px` }}
                        >
                            <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
