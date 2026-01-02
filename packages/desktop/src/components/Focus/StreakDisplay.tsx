import { motion } from 'framer-motion';
import { Flame, Shield, Trophy } from 'lucide-react';

interface StreakProps {
    currentStreak: number;
    bestStreak: number;
    lastDate?: string;
    isOnFire?: boolean;
}

export function StreakDisplay({ currentStreak, bestStreak, isOnFire = true }: StreakProps) {
    // 66 days to automaticity
    const progress = Math.min((currentStreak / 66) * 100, 100);

    // Phases
    const phase = currentStreak < 21 ? 'Conscious Effort' : currentStreak < 66 ? 'Transition' : 'Automaticity';
    const phaseColor = currentStreak < 21 ? 'text-indigo-400' : currentStreak < 66 ? 'text-amber-400' : 'text-emerald-400';

    return (
        <div className="glass-panel p-4 rounded-3xl border border-white/10 relative overflow-hidden bg-white/5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {isOnFire && currentStreak > 0 && (
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"
                            />
                        )}
                        <Flame className={`${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-600'} transition-colors duration-500`} size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Streak</div>
                        <div className="text-2xl font-black text-white">{currentStreak} <span className="text-sm font-medium text-gray-400">days</span></div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-end gap-1">
                        <Trophy size={10} /> Personal Best
                    </div>
                    <div className="text-lg font-bold text-white/80">{bestStreak}</div>
                </div>
            </div>

            {/* Neural Pathway Progress */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${phaseColor}`}>{phase}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{Math.round(progress)}% to Automaticity</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${currentStreak < 21 ? 'bg-indigo-500' :
                            currentStreak < 66 ? 'bg-amber-500' : 'bg-emerald-500'
                            } shadow-[0_0_10px_rgba(99,102,241,0.5)]`}
                    />
                </div>
            </div>

            {/* Streak Freeze Indicator */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <Shield size={12} />
                    <span className="font-bold uppercase tracking-widest">Streak Freeze Active</span>
                </div>
                <span className="text-gray-500 italic">One-day protection</span>
            </div>
        </div>
    );
}
