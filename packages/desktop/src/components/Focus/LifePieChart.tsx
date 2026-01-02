import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Area } from '../../features/api/apiSlice';

interface LifePieChartProps {
    areas: Area[];
}

export function LifePieChart({ areas }: LifePieChartProps) {
    const data = areas.map(area => ({
        name: area.name,
        value: (area.importance_rating || 5) * ((area.completion_rate || 0) + 0.1), // Ensure at least a sliver
        color: area.color_hex || '#6366f1',
        stats: {
            completion: Math.round((area.completion_rate || 0) * 100),
            systems: area.active_systems || 0,
            projects: area.open_projects || 0
        }
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
                    <p className="text-sm font-black text-white uppercase tracking-tighter mb-2" style={{ color: data.color }}>
                        {data.name}
                    </p>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-8">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Performance</span>
                            <span className="text-[10px] text-white font-black">{data.stats.completion}%</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Systems</span>
                            <span className="text-[10px] text-white font-black">{data.stats.systems}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Projects</span>
                            <span className="text-[10px] text-white font-black">{data.stats.projects}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                style={{
                                    filter: `drop-shadow(0 0 10px ${entry.color}44)`
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Life Balance</span>
                <span className="text-4xl font-black text-white tracking-tighter">
                    {Math.round(areas.reduce((acc, curr) => acc + (curr.completion_rate || 0), 0) / (areas.length || 1) * 100)}%
                </span>
            </div>
        </div>
    );
}
