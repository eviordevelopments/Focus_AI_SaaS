import GlassCard from '../ui/GlassCard';
import { Check, Flame, ArrowRight } from 'lucide-react';

interface Habit {
    id: string;
    title?: string;
    name?: string;
    completed_dates: string[];
    streak: number;
    frequency: string;
    base_xp?: number;
    system_id: string;
}

interface HabitsWidgetProps {
    habits: Habit[];
    onToggle: (habit: Habit) => void;
    onViewDetails?: (habit: Habit) => void;
    className?: string;
}

export default function HabitsWidget({ habits, onToggle, onViewDetails, className }: HabitsWidgetProps) {
    const today = new Date().toISOString().split('T')[0];
    const completedCount = habits.filter(h => (h.completed_dates || []).includes(today)).length;

    return (
        <GlassCard className={className}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Today's Quests</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Daily Bounty</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">{completedCount}/{habits.length}</span>
                </div>
            </div>

            <div className="space-y-4">
                {habits.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30 italic">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">No quests initialized</span>
                    </div>
                )}

                {habits.map((habit) => {
                    const isCompleted = (habit.completed_dates || []).includes(today);
                    return (
                        <div
                            key={habit.id}
                            className="flex items-center gap-5 bg-white/5 p-5 rounded-[2rem] border border-white/5 hover:border-indigo-500/20 hover:bg-white/10 transition-all duration-300 group/item"
                        >
                            <button
                                onClick={() => onToggle(habit)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isCompleted
                                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                                    : 'bg-black/20 border-white/10 text-gray-400 hover:border-indigo-500/50 backdrop-blur-md'}`}
                            >
                                {isCompleted ? <Check size={20} strokeWidth={4} /> : <div className="w-2.5 h-2.5 rounded-full bg-white/10 group-hover/item:bg-indigo-500/40 transition-colors" />}
                            </button>

                            <div className="flex-1 cursor-pointer" onClick={() => onViewDetails?.(habit)}>
                                <div className={`text-[14px] font-black tracking-tight ${isCompleted ? 'text-gray-600 line-through' : 'text-gray-100'}`}>
                                    {habit.title || habit.name}
                                </div>
                                <div className="flex items-center gap-4 mt-1.5">
                                    <div className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-indigo-500/10">
                                        +{habit.base_xp || 10} XP
                                    </div>
                                    {habit.streak > 0 && (
                                        <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-black uppercase tracking-widest">
                                            <Flame size={12} fill="currentColor" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" />
                                            {habit.streak} STREAK
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => onViewDetails?.(habit)}
                                className="p-3 bg-white/5 rounded-xl opacity-0 hover:bg-white/10 group-hover/item:opacity-100 text-gray-500 hover:text-white transition-all border border-white/5"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
}
