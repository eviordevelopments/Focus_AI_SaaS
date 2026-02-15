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
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Sleep & Mood</h3>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Efficiency Status</div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200} style={{ outline: 'none' }}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
                            <defs>
                                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="dateStr"
                                stroke="#4b5563"
                                className="text-[10px] font-black uppercase tracking-widest"
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#4b5563"
                                className="text-[10px] font-black uppercase tracking-widest"
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(26, 27, 30, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    backdropFilter: 'blur(10px)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Area type="monotone" dataKey="sleep_hours" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" name="Sleep" />
                            <Area type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" name="Mood" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Stress & Exercise */}
            <GlassCard>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Stress & Flow</h3>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Sync</div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200} style={{ outline: 'none' }}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
                            <defs>
                                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExercise" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="dateStr"
                                stroke="#4b5563"
                                className="text-[10px] font-black uppercase tracking-widest"
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#4b5563"
                                className="text-[10px] font-black uppercase tracking-widest"
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(26, 27, 30, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    backdropFilter: 'blur(10px)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Area type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" name="Stress" />
                            <Area type="monotone" dataKey="exercise_minutes" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorExercise)" name="Exercise" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}
