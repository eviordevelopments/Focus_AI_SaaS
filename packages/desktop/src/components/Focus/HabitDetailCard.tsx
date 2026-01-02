import GlassCard from '../ui/GlassCard';
import { Flame, Star, Trophy, ArrowRight, Zap } from 'lucide-react';
import { useGetHabitAnalyticsQuery } from '../../features/api/apiSlice';

interface HabitDetailCardProps {
    habit: any;
    onClose?: () => void;
}

export function HabitDetailCard({ habit, onClose }: HabitDetailCardProps) {
    const { data: analytics, isLoading } = useGetHabitAnalyticsQuery(habit.id);

    if (isLoading) return <div className="p-10 text-center text-gray-400">Loading Analytics...</div>;

    const adherence = analytics?.adherence || 0;
    const streak = analytics?.streak || habit.streak || 0;
    const bestStreak = analytics?.best_streak || streak;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Header Info */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black text-white">{habit.title || habit.name}</h2>
                    <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-black">Daily Evolution Quest</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                        <ArrowRight className="rotate-180" size={20} />
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center !bg-indigo-500/10 border-indigo-500/20">
                    <Flame className="text-orange-500 mb-2" size={24} fill="currentColor" />
                    <div className="text-2xl font-black text-white">{streak}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Current Streak</div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
                    <Trophy className="text-amber-400 mb-2" size={24} fill="currentColor" />
                    <div className="text-2xl font-black text-white">{bestStreak}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Best Streak</div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
                    <Zap className="text-blue-400 mb-2" size={24} fill="currentColor" />
                    <div className="text-2xl font-black text-white">{adherence}%</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Adherence</div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
                    <Star className="text-purple-400 mb-2" size={24} fill="currentColor" />
                    <div className="text-2xl font-black text-white">+{habit.base_xp || 10}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Base XP</div>
                </GlassCard>
            </div>

            {/* Longitudinal Progress visualization (SVG Mini-Chart) */}
            <GlassCard className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white uppercase tracking-widest text-xs">90-Day Performance History</h3>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
                    </div>
                </div>

                <div className="h-32 flex items-end gap-1 px-2">
                    {(analytics?.history || Array.from({ length: 30 })).map((h: any, i: number) => {
                        const isDone = h?.completed;
                        return (
                            <div
                                key={i}
                                className={`flex-1 rounded-t-sm transition-all duration-1000 ${isDone ? 'bg-indigo-500/60 h-[var(--h)]' : 'bg-white/5 h-2'}`}
                                style={{ '--h': isDone ? `${40 + (i % 5) * 10}%` : '8px' } as any}
                            />
                        );
                    })}
                </div>
            </GlassCard>

            {/* Rewards / Milestones */}
            <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-1">Upcoming Milestones</h4>
                <div className="space-y-2">
                    {[
                        { label: 'Consistency King', desc: 'Maintain a 30-day streak', progress: Math.min((streak / 30) * 100, 100), xp: 500 },
                        { label: 'Habit Master', desc: 'Complete 100 total log entries', progress: Math.min(((analytics?.daysFulfilled || 0) / 100) * 100, 100), xp: 1000 }
                    ].map((milestone, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center text-xl">🏆</div>
                            <div className="flex-1">
                                <div className="flex justify-between text-sm font-bold text-white mb-1">
                                    <span>{milestone.label}</span>
                                    <span className="text-indigo-400">+{milestone.xp} XP</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${milestone.progress}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
