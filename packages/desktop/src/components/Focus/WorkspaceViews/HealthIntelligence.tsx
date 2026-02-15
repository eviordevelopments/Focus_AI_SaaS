import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Moon, Smile, Zap, Activity, Monitor,
    Plus, TrendingUp, Filter
} from 'lucide-react';
import GlassCard from '../../ui/GlassCard';
import { HealthLoggingModal } from '../Health/HealthLoggingModal';
import { HealthTrendLine } from '../Health/HealthTrendLine';
import { BurnoutDashboard } from '../Health/BurnoutDashboard';
import { HealthAchievements } from '../Health/HealthAchievements';
import { VarianceChart } from '../Analytics/VarianceChart';
import { METRIC_CONFIGS } from '../../../config/metricConfig';
import { useGetHealthAnalyticsQuery } from '../../../features/api/apiSlice';

interface HealthIntelligenceProps {
    data: any[]; // health entries
}

export function HealthIntelligence({ data }: HealthIntelligenceProps) {
    const [showLoggingModal, setShowLoggingModal] = useState(false);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

    const { data: analyticsData, isLoading } = useGetHealthAnalyticsQuery({ period });

    const latest = data[0] || {
        sleep_hours: 0,
        mood: 0,
        stress: 0,
        exercise_minutes: 0,
        screen_time_hours: 0
    };

    const metrics = [
        { label: 'Sleep', value: `${latest.sleep_hours}h`, icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { label: 'Mood', value: `${latest.mood}/10`, icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Stress', value: `${latest.stress}/10`, icon: Zap, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { label: 'Exercise', value: `${latest.exercise_minutes}m`, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        { label: 'Screen', value: `${latest.screen_time_hours}h`, icon: Monitor, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    ];

    const healthMetrics = METRIC_CONFIGS.health;

    return (
        <div className="space-y-10 pb-12">
            {/* Daily Check-In Quick Card */}
            <GlassCard className="p-8 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border-2 border-indigo-500/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-500/20 rounded-2xl">
                            <Activity size={32} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Daily Check-In</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Track your health metrics today</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLoggingModal(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
                    >
                        <Plus size={18} />
                        Log Today's Metrics
                    </button>
                </div>
            </GlassCard>

            {/* Burnout Prevention Dashboard */}
            <BurnoutDashboard />

            {/* Live Status Bar (Half-Circle Metrics) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {metrics.map((m, idx) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.03] flex flex-col items-center gap-4 text-center group hover:bg-white/[0.05] transition-all"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center ${m.color} group-hover:scale-110 transition-transform`}>
                            <m.icon size={24} />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{m.label}</span>
                            <span className="text-2xl font-black text-white italic">{m.value}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Achievements & Streaks */}
            <HealthAchievements />

            {/* Longitudinal Health Trends */}
            <GlassCard className="p-8">
                <div className="space-y-2 mb-8">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-400" /> Longitudinal Trends
                    </label>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">30-Day Health Trajectory</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
                        <HealthTrendLine data={data.slice(0, 30).reverse()} metric="sleep_hours" label="Sleep" color="#6366f1" unit="h" />
                    </div>
                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
                        <HealthTrendLine data={data.slice(0, 30).reverse()} metric="mood" label="Mood" color="#10b981" unit="/10" />
                    </div>
                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
                        <HealthTrendLine data={data.slice(0, 30).reverse()} metric="stress" label="Stress" color="#ef4444" unit="/10" />
                    </div>
                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
                        <HealthTrendLine data={data.slice(0, 30).reverse()} metric="exercise_minutes" label="Exercise" color="#f97316" unit="min" />
                    </div>
                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
                        <HealthTrendLine data={data.slice(0, 30).reverse()} metric="screen_time_hours" label="Screen Time" color="#06b6d4" unit="h" />
                    </div>
                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-2xl border border-indigo-500/20 flex flex-col justify-center items-center text-center">
                        <div className="text-4xl font-black text-white italic mb-2">{data.length}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Entries</div>
                        <button onClick={() => setShowLoggingModal(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all">
                            Log Today
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* Variance Charts Section */}
            <GlassCard className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <TrendingUp size={14} className="text-indigo-400" /> Biometric Correlation
                        </label>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Optimization Landscape</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                            {(['week', 'month', 'year'] as const).map((p) => (
                                <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-80 flex items-center justify-center text-gray-500">Loading analytics...</div>
                ) : (
                    <div className="space-y-8">
                        {[
                            { key: 'sleep', icon: Moon, label: 'Sleep Variance', color: 'text-indigo-400' },
                            { key: 'mood', icon: Smile, label: 'Mood Variance', color: 'text-emerald-400' },
                            { key: 'stress', icon: Zap, label: 'Stress Variance', color: 'text-rose-400' },
                            { key: 'exercise', icon: Activity, label: 'Exercise Variance', color: 'text-orange-400' },
                            { key: 'screen', icon: Monitor, label: 'Screen Time Variance', color: 'text-cyan-400' }
                        ].map(({ key, icon: Icon, label, color }) => (
                            <div key={key} className="space-y-4">
                                <h4 className={`text-sm font-black text-white uppercase tracking-wider flex items-center gap-2`}>
                                    <Icon size={16} className={color} />
                                    {label}
                                </h4>
                                <div className="h-80 bg-white/[0.01] rounded-[2rem] border border-white/[0.03] p-8">
                                    <VarianceChart
                                        data={analyticsData?.[key]?.timeSeries || []}
                                        optimal={healthMetrics[key].optimal}
                                        unit={healthMetrics[key].unit}
                                        color={healthMetrics[key].color}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            <AnimatePresence>
                {showLoggingModal && (
                    <HealthLoggingModal onClose={() => setShowLoggingModal(false)} initialData={data[0]} />
                )}
            </AnimatePresence>
        </div>
    );
}
