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
}

export default function HabitsWidget({ habits, onToggle, onViewDetails }: HabitsWidgetProps) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-white">Today's Quests</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Daily Bounty</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-black text-indigo-400">{habits.filter(h => (h.completed_dates || []).includes(today)).length}/{habits.length}</span>
                </div>
            </div>

            <div className="space-y-3">
                {habits.length === 0 && <div className="text-gray-500 text-sm">No habits yet.</div>}

                {habits.map((habit) => {
                    const isCompleted = (habit.completed_dates || []).includes(today);
                    return (
                        <div
                            key={habit.id}
                            className="flex items-center gap-4 bg-white/5 p-4 rounded-[1.5rem] border border-white/5 hover:border-indigo-500/30 transition-all group"
                        >
                            <button
                                onClick={() => onToggle(habit)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/10 text-gray-400 hover:border-indigo-400 backdrop-blur-md'}`}
                            >
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                            </button>

                            <div className="flex-1 cursor-pointer" onClick={() => onViewDetails?.(habit)}>
                                <div className={`text-sm font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>{habit.title || habit.name}</div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tight">+{habit.base_xp || 10} XP</div>
                                    {habit.streak > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                                            <Flame size={10} fill="currentColor" /> {habit.streak} STREAK
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => onViewDetails?.(habit)}
                                className="p-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
}
