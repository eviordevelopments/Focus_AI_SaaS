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
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-1 text-xs font-medium">
                <div className="flex items-center gap-2 text-gray-300">
                    {icon} {label}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{value} <span className="text-gray-500 font-normal">{unit}</span></span>
                </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full w-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${bgClass}`}
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                />
            </div>
        </div>
    );

    return (
        <GlassCard className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-white">Contributing Factors</h3>
            </div>

            <div className="space-y-1">
                {renderBar('Sleep', <Moon size={14} className="text-indigo-400" />, sleep, 12, 'bg-indigo-500', 'h')}
                {renderBar('Stress', <Zap size={14} className="text-amber-400" />, stress, 10, 'bg-amber-500', '/10')}
                {renderBar('Mood', <Smile size={14} className="text-pink-400" />, mood, 10, 'bg-pink-500', '/10')}
                {renderBar('Exercise', <Activity size={14} className="text-emerald-400" />, exercise, 60, 'bg-emerald-500', 'min')}
                {renderBar('Screen Time', <Activity size={14} className="text-blue-400" />, screenTime, 12, 'bg-blue-500', 'h')}
            </div>
        </GlassCard>
    );
}
