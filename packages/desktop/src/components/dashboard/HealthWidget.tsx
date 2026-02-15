import GlassCard from '../ui/GlassCard';
import { Moon, Smile, Zap, Activity } from 'lucide-react';

interface HealthWidgetProps {
    healthEntry: any;
}

export default function HealthWidget({ healthEntry }: HealthWidgetProps) {
    const sleep = healthEntry?.sleep_hours || 0;
    const mood = healthEntry?.mood || 0;
    const stress = healthEntry?.stress || 0;
    const exercise = healthEntry?.exercise_minutes || 0;
    const screenTime = healthEntry?.screen_time_hours || 0;

    const renderBar = (label: string, icon: React.ReactNode, value: number, max: number, bgClass: string, unit: string) => (
        <div className="mb-6 last:mb-0 group/bar">
            <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover/bar:border-white/20 transition-all duration-500 shadow-lg">
                        {icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover/bar:text-gray-300 transition-colors">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white italic tracking-tighter tabular-nums">{value}</span>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{unit}</span>
                </div>
            </div>
            <div className="h-2 bg-black/40 rounded-full w-full overflow-hidden border border-white/5 backdrop-blur-md p-0.5">
                <div
                    className={`h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_12px_rgba(0,0,0,0.5)] ${bgClass} relative overflow-hidden`}
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                </div>
            </div>
        </div>
    );

    return (
        <GlassCard className="h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Biometric Factors</h3>
                <Activity size={18} className="text-gray-600" />
            </div>

            <div className="space-y-2">
                {renderBar('Sleep', <Moon size={16} className="text-indigo-400" />, sleep, 12, 'bg-indigo-500', 'h')}
                {renderBar('Stress', <Zap size={16} className="text-amber-400" />, stress, 10, 'bg-amber-500', '/10')}
                {renderBar('Energy', <Smile size={16} className="text-pink-400" />, mood, 10, 'bg-pink-500', '/10')}
                {renderBar('Movement', <Activity size={16} className="text-emerald-400" />, exercise, 60, 'bg-emerald-500', 'min')}
                {renderBar('Digital Load', <Activity size={16} className="text-blue-400" />, screenTime, 12, 'bg-blue-500', 'h')}
            </div>
        </GlassCard>
    );
}
