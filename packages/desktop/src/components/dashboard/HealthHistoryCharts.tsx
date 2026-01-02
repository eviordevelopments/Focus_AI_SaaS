import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import GlassCard from '../ui/GlassCard';
import { format, parseISO } from 'date-fns';

interface HealthHistoryChartsProps {
    history: any[];
}

export default function HealthHistoryCharts({ history }: HealthHistoryChartsProps) {
    const data = history.map(entry => ({
        ...entry,
        dateStr: format(parseISO(entry.date), 'EEE') // Mon, Tue...
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sleep & Mood */}
            <GlassCard>
                <h3 className="font-bold text-lg text-white mb-4">Sleep & Mood (7 days)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="dateStr" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Area type="monotone" dataKey="sleep_hours" stroke="#818cf8" fillOpacity={1} fill="url(#colorSleep)" name="Sleep (h)" />
                            <Area type="monotone" dataKey="mood" stroke="#ec4899" fillOpacity={1} fill="url(#colorMood)" name="Mood (1-10)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Stress & Exercise */}
            <GlassCard>
                <h3 className="font-bold text-lg text-white mb-4">Stress & Exercise (7 days)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExercise" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="dateStr" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Area type="monotone" dataKey="stress" stroke="#f59e0b" fillOpacity={1} fill="url(#colorStress)" name="Stress (1-10)" />
                            <Area type="monotone" dataKey="exercise_minutes" stroke="#10b981" fillOpacity={1} fill="url(#colorExercise)" name="Exercise (m)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}
