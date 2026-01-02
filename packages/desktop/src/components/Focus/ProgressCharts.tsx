import { useGetAnalyticsTrendsQuery } from '../../features/api/apiSlice';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { Activity, Brain } from 'lucide-react';

export function ProgressCharts() {
    const { data: trends, isLoading } = useGetAnalyticsTrendsQuery();

    if (isLoading) return <div className="h-64 flex items-center justify-center text-gray-500">Loading Analytics...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Adherence vs Burnout Trend */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-emerald-400" size={20} />
                                System Stability
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Longitudinal Adherence vs Burnout</p>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBurnout" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#4b5563', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#4b5563', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Area
                                    type="monotone"
                                    dataKey="workload"
                                    name="Adherence"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorAdherence)"
                                    strokeWidth={3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    name="Burnout Risk"
                                    stroke="#f43f5e"
                                    fillOpacity={1}
                                    fill="url(#colorBurnout)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cognitive Factors Matrix */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Brain className="text-indigo-400" size={20} />
                                Cognitive Load Analysis
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Recovery vs Autonomy Factors</p>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#4b5563', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#4b5563', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="stepAfter"
                                    dataKey="recovery"
                                    name="Recovery"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="autonomy"
                                    name="Autonomy"
                                    stroke="#fbbf24"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <div className="text-emerald-400 font-black text-2xl mb-1">87%</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Average Adherence</div>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/5 to-transparent">
                    <div className="text-rose-400 font-black text-2xl mb-1">-12%</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Burnout Trend</div>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/5 to-transparent">
                    <div className="text-indigo-400 font-black text-2xl mb-1">+4,200</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">XP Velocity</div>
                </div>
            </div>
        </div>
    );
}
