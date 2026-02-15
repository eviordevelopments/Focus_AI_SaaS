import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

interface HabitBreakdownGraphProps {
    data: any[];
}

export function HabitBreakdownGraph({ data }: HabitBreakdownGraphProps) {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2">
                <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                    <BarChart2 size={16} className="text-emerald-400" />
                    Protocol Breakdown
                </h3>
            </div>

            <div className="flex-1 min-h-[250px] overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                        barSize={12}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                            domain={[0, 100]}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={120}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(10, 10, 12, 0.8)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                fontSize: '11px',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val: any) => [`${val}%`, 'Adherence']}
                        />
                        <Bar
                            dataKey="adherence"
                            radius={[0, 4, 4, 0]}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.adherence > 80 ? '#10b981' : entry.adherence > 50 ? '#f59e0b' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
