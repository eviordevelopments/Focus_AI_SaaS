import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, CheckCircle2 } from 'lucide-react';
import { useGetHabitsQuery, useGetLogsQuery, useCreateLogMutation } from '../../../features/api/apiSlice';

interface DayDetailModalProps {
    date: Date;
    onClose: () => void;
}

export function DayDetailModal({ date, onClose }: DayDetailModalProps) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data: habits = [] } = useGetHabitsQuery({});
    const { data: logs = [] } = useGetLogsQuery({ date: dateStr });
    const [createLog] = useCreateLogMutation();

    const scheduledHabits = habits.filter((h: any) => {
        if (!h.is_active) return false;
        if (!h.days_of_week) return true;
        let days = [];
        try {
            days = typeof h.days_of_week === 'string' ? JSON.parse(h.days_of_week) : h.days_of_week;
        } catch (e) {
            days = [0, 1, 2, 3, 4, 5, 6];
        }
        return days.includes(date.getDay());
    });

    const completionRate = scheduledHabits.length > 0
        ? Math.round((logs.filter((l: any) => l.completed).length / scheduledHabits.length) * 100)
        : 0;

    const handleToggle = async (habitId: string, currentStatus: boolean) => {
        try {
            const habit = habits.find((h: any) => h.id === habitId);
            if (!habit) return;

            // Optimistic update handled by tag invalidation usually, but we ensure payload is correct
            await createLog({
                habit_id: habitId,
                // Fallback to existing system_id or a generic one if missing, though schema usually requires it.
                // If habit.system_id is missing, we might need to handle it.
                system_id: habit.system_id || 'default',
                date: dateStr,
                completed: !currentStatus,
                effort_level: 3
            }).unwrap();
        } catch (error) {
            console.error('Failed to toggle habit:', error);
        }
    };

    const completedHabits = logs.filter((l: any) => l.completed).length;
    const totalScheduled = scheduledHabits.length;
    const isAllDone = completedHabits === totalScheduled && totalScheduled > 0;

    const statusColor = completionRate >= 80 ? 'text-emerald-500' : completionRate >= 40 ? 'text-orange-500' : 'text-rose-500';
    const statusBg = completionRate >= 80 ? 'bg-emerald-500/10' : completionRate >= 40 ? 'bg-orange-500/10' : 'bg-rose-500/10';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-[420px] bg-[#0c0c0e] text-white rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
            >
                {/* Header Decoration */}
                <div className={`absolute top-0 inset-x-0 h-32 ${statusBg} blur-3xl opacity-50 pointer-events-none`} />

                {/* Header Content */}
                <div className="relative p-10 pb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 ${statusBg} rounded-[20px] flex items-center justify-center border border-white/5`}>
                            <CheckCircle2 className={statusColor} size={28} />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Day Intelligence Report</label>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                            {format(date, 'EEEE, MMM d')}
                        </h2>
                    </div>

                    <div className="mt-8 flex items-end gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between mb-2 items-end">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Daily Progression</span>
                                <span className={`text-2xl font-black italic tracking-tighter ${statusColor}`}>
                                    {completionRate}%
                                </span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    className={`h-full ${statusColor.replace('text', 'bg')} transition-all duration-700`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checklist Content */}
                <div className="relative flex-1 overflow-y-auto px-10 pb-10 space-y-3 custom-scrollbar">
                    <div className="h-px bg-white/5 mb-6" />
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Habit Checklist</label>

                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {scheduledHabits.map((habit: any) => {
                                const isDone = logs.some((l: any) => l.habit_id === habit.id && l.completed);
                                return (
                                    <motion.div
                                        key={habit.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => handleToggle(habit.id, isDone)}
                                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${isDone
                                            ? 'bg-white/[0.02] border-white/[0.05] grayscale opacity-60'
                                            : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isDone
                                            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                            : 'bg-transparent border-gray-700 group-hover:border-indigo-500'
                                            }`}>
                                            {isDone && <CheckCircle2 size={14} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-bold tracking-tight truncate ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                                                {habit.name}
                                            </h4>
                                            {!isDone && (
                                                <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest mt-0.5">
                                                    Pending
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {scheduledHabits.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center opacity-20">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                Optimal Resting State<br />No Habits Allocated
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Insight */}
                <div className="p-8 px-10 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    <div className="flex gap-4">
                        <span className="text-gray-400">{completedHabits} Hits</span>
                        <span>{totalScheduled - completedHabits} Misses</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isAllDone ? 'bg-emerald-500 animate-pulse' : 'bg-gray-800'}`} />
                        {isAllDone ? 'Optimal Execution' : 'In Progress'}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
