import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Award, Flame, Target } from 'lucide-react';
import { useGetBurnoutScoreQuery } from '../../../features/api/apiSlice';
import GlassCard from '../../ui/GlassCard';

export function BurnoutDashboard() {
    const { data: burnoutData, isLoading } = useGetBurnoutScoreQuery();

    if (isLoading) {
        return (
            <GlassCard className="p-8">
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Loading burnout analysis...
                </div>
            </GlassCard>
        );
    }

    if (!burnoutData || burnoutData.overall_score === 0) {
        return (
            <GlassCard className="p-8">
                <div className="text-center space-y-4">
                    <div className="text-4xl">📊</div>
                    <h3 className="text-xl font-black text-white">Start Tracking Your Health</h3>
                    <p className="text-gray-400 text-sm">Log your first health entry to unlock burnout prevention insights</p>
                </div>
            </GlassCard>
        );
    }

    const { overall_score, risk_level, breakdown, recommendations, doctor_referral, streak_days, level: levelData } = burnoutData;

    // Risk level styling
    const riskConfig = {
        optimal: { color: '#10b981', label: '🟢 Thriving', bg: 'from-emerald-500/20 to-emerald-600/10' },
        moderate: { color: '#f59e0b', label: '🟡 Balanced', bg: 'from-amber-500/20 to-amber-600/10' },
        warning: { color: '#f97316', label: '🟠 At Risk', bg: 'from-orange-500/20 to-orange-600/10' },
        critical: { color: '#ef4444', label: '🔴 Burnout Alert', bg: 'from-red-500/20 to-red-600/10' }
    };

    const config = riskConfig[risk_level as keyof typeof riskConfig] || riskConfig.moderate;

    // Calculate circle progress
    const circumference = 2 * Math.PI * 80;
    const progress = circumference * (1 - overall_score / 100);

    return (
        <div className="space-y-6">
            {/* Main Burnout Score Card */}
            <div className={`p-8 bg-gradient-to-br ${config.bg} border-2 backdrop-blur-xl bg-white/[0.03] rounded-[2.5rem]`} style={{ borderColor: `${config.color}33` }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Character Status & Burnout Score */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative w-48 h-48 mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-white/10"
                                />
                                <motion.circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="transparent"
                                    stroke={config.color}
                                    strokeWidth="12"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={progress}
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: progress }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    className="text-5xl font-black text-white italic"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                >
                                    {overall_score}%
                                </motion.span>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                                    {config.label}
                                </span>
                            </div>
                        </div>

                        {/* Main Character Status Card */}
                        <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Status: Healthy Person</div>
                            <h2 className="text-xl font-black text-white italic uppercase tracking-wider mb-3">
                                Agent Emi
                            </h2>
                            <div className="flex justify-center gap-3">
                                <div className="px-3 py-1 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                    <div className="text-[10px] text-indigo-300 uppercase font-black">Level {levelData?.mastery || 1}</div>
                                </div>
                                <div className="px-3 py-1 bg-amber-500/20 rounded-lg border border-amber-500/30">
                                    <div className="text-[10px] text-amber-300 uppercase font-black">Mastery {levelData?.mastery || 1}</div>
                                </div>
                            </div>
                        </div>

                        {/* Streak & Tier Name */}
                        <div className="flex gap-4 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                <Flame size={16} className="text-orange-400" />
                                <span className="text-sm font-bold text-white">{streak_days} day streak</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                <Award size={16} className="text-yellow-400" />
                                <span className="text-sm font-bold text-white capitalize">{levelData?.level || 'Bronze'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Metric Breakdown */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4">Health Metrics</h3>
                        {Object.entries(breakdown).map(([key, value]: [string, any]) => {
                            const metricConfig: Record<string, { icon: string; label: string }> = {
                                sleep: { icon: '😴', label: 'Sleep Quality' },
                                stress: { icon: '🧘', label: 'Stress Level' },
                                mood: { icon: '😊', label: 'Emotional State' },
                                exercise: { icon: '💪', label: 'Physical Activity' },
                                screen: { icon: '📱', label: 'Screen Time' }
                            };

                            const metric = metricConfig[key];
                            const score = Math.round(value);
                            const isGood = score >= 75;

                            return (
                                <div key={key} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{metric.icon}</span>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                {metric.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white">{score}%</span>
                                            {isGood ? (
                                                <TrendingUp size={14} className="text-emerald-400" />
                                            ) : (
                                                <TrendingDown size={14} className="text-rose-400" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{
                                                backgroundColor: score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <GlassCard className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Target size={20} className="text-indigo-400" />
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Personalized Recommendations</h3>
                </div>

                <div className="space-y-3">
                    {recommendations.map((rec: string, idx: number) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.04] transition-all"
                        >
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-black text-indigo-400">{idx + 1}</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{rec}</p>
                        </motion.div>
                    ))}
                </div>

                {doctor_referral && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl border-2 border-red-500/30"
                    >
                        <div className="flex items-start gap-4">
                            <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">Medical Attention Recommended</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Your health metrics indicate you may benefit from professional medical advice.
                                    Please consider scheduling an appointment with your healthcare provider.
                                </p>
                                <button className="mt-3 px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
                                    Find a Doctor
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </GlassCard>
        </div>
    );
}
