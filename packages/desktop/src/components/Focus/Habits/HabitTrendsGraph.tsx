import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

interface HabitTrendsGraphProps {
    data: any[];
}

export function HabitTrendsGraph({ data }: HabitTrendsGraphProps) {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                    <Activity size={16} className="text-indigo-400" />
                    Overall Adherence Trends
                </h3>
            </div>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return isNaN(d.getTime()) ? '' : format(d, 'MMM d');
                            }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                            domain={[0, 1]}
                            tickFormatter={(val) => `${Math.round(val * 100)}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(10, 10, 12, 0.8)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                fontSize: '11px',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val: any) => [`${Math.round(val * 100)}%`, 'Adherence']}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                            labelFormatter={(label) => {
                                const d = new Date(label);
                                return isNaN(d.getTime()) ? '' : format(d, 'EEEE, MMMM d, yyyy');
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="completion_rate"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRate)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
