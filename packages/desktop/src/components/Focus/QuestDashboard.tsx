import { useGetSystemsQuery, useGetLogsQuery, useCreateLogMutation, useGetGamifiedDashboardQuery, useGetStreaksQuery } from '../../features/api/apiSlice';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Zap, Trophy, Target, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { StreakDisplay } from './StreakDisplay';
import { ProgressCharts } from './ProgressCharts';
import { useXP } from './XPOverlay';

export function QuestDashboard() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: systems } = useGetSystemsQuery();
    const { data: logs } = useGetLogsQuery({ date: today });
    const { data: streaks } = useGetStreaksQuery();
    const { data: gamifiedDashboard } = useGetGamifiedDashboardQuery();
    const [logActivity] = useCreateLogMutation();
    const { addXP } = useXP();

    const handleComplete = async (systemId: string, completed: boolean) => {
        try {
            const system = systems?.find(s => s.id === systemId);
            const result: any = await logActivity({
                system_id: systemId,
                date: today,
                completed,
                effort_level: 3,
                energy_level: 3,
                mood: 'good'
            }).unwrap();

            if (completed && result) {
                // If the backend returns XP info, show it
                addXP(result.xpEarned || 25, system?.name || 'Quest Complete', result.levelUp);
            }
        } catch (err) {
            console.error('Failed to log quest:', err);
        }
    };

    const completionRate = systems?.length
        ? Math.round((logs?.filter(l => l.completed).length || 0) / systems.length * 100)
        : 0;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Character Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={140} />
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                        <Star className="text-white fill-white" size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Main Character Status</h1>
                        <div className="flex items-center gap-3 mt-1 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                            <span className="px-2 py-0.5 bg-indigo-500/20 rounded-md border border-indigo-500/30">Level {Math.floor(Math.sqrt((gamifiedDashboard?.totalXP || 0) / 100)) + 1}</span>
                            <span>•</span>
                            <span>{gamifiedDashboard?.totalXP || 0} Total XP</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Daily Progress</span>
                        <span>{completionRate}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full border border-white/10 overflow-hidden p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionRate}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Quests */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                            Today's Quests
                        </h2>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Resetting at 5:00 AM</span>
                    </div>

                    <div className="space-y-4">
                        {systems?.map((system) => {
                            const isCompleted = logs?.find(l => l.system_id === system.id)?.completed;
                            const streak = streaks?.find(s => s.system_id === system.id);

                            return (
                                <motion.div
                                    key={system.id}
                                    whileHover={{ scale: 1.01 }}
                                    className={`glass-panel p-6 rounded-[2rem] border transition-all duration-500 ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-indigo-500/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => handleComplete(system.id, !isCompleted)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isCompleted
                                                ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                                                : 'bg-white/5 text-gray-600 border border-white/5 hover:border-indigo-500/30'
                                                }`}
                                        >
                                            {isCompleted ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold transition-colors ${isCompleted ? 'text-emerald-400' : 'text-white text-lg'}`}>
                                                    {system.name}
                                                </h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${system.difficulty === 'hard' ? 'border-rose-500/30 text-rose-400' :
                                                    system.difficulty === 'medium' ? 'border-amber-500/30 text-amber-400' : 'border-indigo-500/30 text-indigo-400'
                                                    } uppercase font-black`}>
                                                    {system.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-1 italic">
                                                Cue: {system.cue}
                                            </p>
                                        </div>

                                        <div className="hidden sm:block">
                                            <StreakDisplay
                                                currentStreak={streak?.current_streak || 0}
                                                bestStreak={streak?.best_streak || 0}
                                                isOnFire={!isCompleted} // Show subtle fire if not completed yet
                                            />
                                        </div>

                                        <div className="text-right ml-4">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Reward</div>
                                            <div className="text-lg font-black text-white">+{system.xp_base || 25} <span className="text-[10px] text-indigo-300">XP</span></div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {systems?.length === 0 && (
                            <div className="text-center py-20 glass-panel rounded-[2rem] border border-dashed border-white/10">
                                <Target size={48} className="mx-auto text-gray-600 mb-4" />
                                <h3 className="text-white font-bold text-lg">No Quests Activated</h3>
                                <p className="text-gray-500 text-sm mt-1">Visit the System Canvas to design your first habit quest.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Identities & Progress */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Target className="text-indigo-400" size={20} />
                            Identity XP
                        </h2>
                        <div className="space-y-4">
                            {gamifiedDashboard?.identities?.map((id: any) => (
                                <div key={id.id} className="glass-panel p-5 rounded-3xl border border-white/10 bg-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-white mb-1">I am a {id.name}</div>
                                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">LVL {id.level}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(id.xp % 100)}%` }} // Simple modulo for visual progress to next lvl
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <span>{id.xp} Total XP</span>
                                            <span>Next Lvl: {Math.ceil((id.level + 1) ** 2 * 100)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                <Trophy className="text-amber-500" size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Daily Quests Bonus</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Complete all your daily rituals to earn a <span className="text-amber-400 font-bold">+50 XP</span> multiplier and lock in your identity!
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
                            <span>Progress</span>
                            <span>{completionRate}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full mt-2 border border-white/5">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${completionRate}%` }} />
                        </div>
                    </section>
                </div>
            </div>

            {/* Longitudinal Analytics */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-indigo-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Longitudinal Analytics</h2>
                </div>
                <ProgressCharts />
            </section>
        </div>
    );
}
