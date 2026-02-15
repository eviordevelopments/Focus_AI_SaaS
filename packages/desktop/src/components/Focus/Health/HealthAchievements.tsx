import { motion } from 'framer-motion';
import { Star, Flame, Award, Lock } from 'lucide-react';
import { useGetBurnoutScoreQuery } from '../../../features/api/apiSlice';
import GlassCard from '../../ui/GlassCard';

export function HealthAchievements() {
    const { data: burnoutData } = useGetBurnoutScoreQuery();

    const allAchievements = [
        { key: '7_day_streak', name: '🔥 7-Day Warrior', description: 'Log health for 7 consecutive days', xp: 100 },
        { key: '30_day_streak', name: '🏆 Monthly Champion', description: 'Maintain 30-day logging streak', xp: 500 },
        { key: 'sleep_champion', name: '😴 Sleep Champion', description: '7 days of optimal sleep', xp: 150 },
        { key: 'stress_master', name: '🧘 Stress Master', description: '14 days of low stress', xp: 200 },
        { key: 'fitness_warrior', name: '💪 Fitness Warrior', description: '30 days of regular exercise', xp: 300 },
        { key: 'perfect_week', name: '⭐ Perfect Week', description: 'All metrics optimal for 7 days', xp: 250 }
    ];

    const unlockedKeys = burnoutData?.achievements?.map((a: any) => a.key) || [];
    const streakDays = burnoutData?.streak_days || 0;
    const totalXp = burnoutData?.total_xp || 0;
    const level = burnoutData?.level?.level || 'bronze';
    const levelProgress = burnoutData?.level?.progress || 0;
    const nextLevel = burnoutData?.level?.nextLevel || 100;

    // Level colors
    const levelColors: Record<string, string> = {
        bronze: '#cd7f32',
        silver: '#c0c0c0',
        gold: '#ffd700',
        platinum: '#e5e4e2'
    };

    return (
        <GlassCard className="p-8">
            <div className="space-y-8">
                {/* Level Progress */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Award size={24} style={{ color: levelColors[level] }} />
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider capitalize">{level} Tier</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{totalXp} Total XP</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-white italic">{streakDays}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Day Streak</div>
                        </div>
                    </div>

                    {nextLevel !== Infinity && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Progress to next level</span>
                                <span>{levelProgress} / {nextLevel} XP</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: levelColors[level] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(levelProgress / nextLevel) * 100}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Achievements Grid */}
                <div>
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Achievements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {allAchievements.map((achievement, idx) => {
                            const isUnlocked = unlockedKeys.includes(achievement.key);

                            return (
                                <motion.div
                                    key={achievement.key}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`p-4 rounded-2xl border transition-all ${isUnlocked
                                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 hover:scale-105'
                                        : 'bg-white/[0.02] border-white/5 opacity-50'
                                        }`}
                                >
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                                            {isUnlocked ? achievement.name.split(' ')[0] : <Lock size={24} className="text-gray-600" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{achievement.name.split(' ').slice(1).join(' ')}</div>
                                            <div className="text-[10px] text-gray-500 mt-1">{achievement.description}</div>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold">
                                            <Star size={12} className="text-yellow-400" />
                                            <span className={isUnlocked ? 'text-yellow-400' : 'text-gray-600'}>{achievement.xp} XP</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Streak Milestone */}
                {streakDays > 0 && (
                    <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
                        <div className="flex items-center gap-4">
                            <Flame size={32} className="text-orange-400" />
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">Current Streak</h4>
                                <p className="text-xs text-gray-400 mt-1">
                                    {streakDays === 1 ? 'Great start! Keep logging daily to build your streak.' :
                                        streakDays < 7 ? `${7 - streakDays} more days to unlock 7-Day Warrior!` :
                                            streakDays < 30 ? `${30 - streakDays} more days to unlock Monthly Champion!` :
                                                'Amazing! You\'re a health tracking champion!'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
