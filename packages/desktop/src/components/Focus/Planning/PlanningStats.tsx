import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useGetPlanningStatsQuery } from '../../../features/api/apiSlice';
import { AreaChart as ChartIcon, Zap } from 'lucide-react';

export function PlanningStats() {
    const { data: stats, isLoading } = useGetPlanningStatsQuery();

    if (isLoading || !stats || stats.length === 0) return null;

    return (
        <div className="glass-panel p-8 rounded-[40px] border border-white/10 relative overflow-hidden group hover:bg-white/5 transition-all">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <ChartIcon size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Zap size={14} className="fill-current" />
                        Identity Evolution Curve
                    </label>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats}>
                            <defs>
                                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                hide
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'black' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="progress"
                                name="Combined Progress"
                                stroke="#6366f1"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorProgress)"
                                animationDuration={2000}
                            />
                            <Area type="monotone" dataKey="outcomeProgress" name="Goal Completion" stroke="none" fill="none" />
                            <Area type="monotone" dataKey="systemAdherence" name="System Adherence" stroke="none" fill="none" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-8">
                    {stats.slice(-4).map((s: any, i: number) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">{s.period}</span>
                                <span className="text-xs font-bold text-white leading-none">{s.progress}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${s.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
