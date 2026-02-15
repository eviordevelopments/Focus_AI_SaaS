import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HealthTrendLineProps {
    data: any[];
    metric: 'sleep_hours' | 'mood' | 'stress' | 'exercise_minutes' | 'screen_time_hours';
    label: string;
    color: string;
    unit: string;
}

export function HealthTrendLine({ data, metric, label, color, unit }: HealthTrendLineProps) {
    const { points, maxValue, minValue } = useMemo(() => {
        if (!data || data.length === 0) return { points: '', maxValue: 0, minValue: 0 };

        const values = data.map(d => d[metric] || 0);
        const maxValue = Math.max(...values, 1);
        const minValue = Math.min(...values, 0);
        const range = maxValue - minValue || 1;

        const width = 100;
        const height = 60;
        const padding = 5;

        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
            const normalizedValue = ((d[metric] || 0) - minValue) / range;
            const y = height - padding - (normalizedValue * (height - 2 * padding));
            return `${x},${y}`;
        }).join(' ');

        return { points, maxValue, minValue };
    }, [data, metric]);

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-600 text-xs">
                No data available
            </div>
        );
    }

    const latestValue = data[data.length - 1]?.[metric] || 0;
    const previousValue = data[data.length - 2]?.[metric] || latestValue;
    const trend = latestValue >= previousValue ? 'up' : 'down';
    const trendColor = metric === 'stress'
        ? (trend === 'down' ? 'text-emerald-400' : 'text-rose-400')
        : (trend === 'up' ? 'text-emerald-400' : 'text-rose-400');

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white italic">{latestValue.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 font-bold">{unit}</span>
                    </div>
                </div>
                <div className={`text-xs font-bold ${trendColor}`}>
                    {trend === 'up' ? '↑' : '↓'} {Math.abs(latestValue - previousValue).toFixed(1)}
                </div>
            </div>

            <svg viewBox="0 0 100 60" className="w-full h-16" preserveAspectRatio="none">
                {/* Background gradient */}
                <defs>
                    <linearGradient id={`gradient-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <motion.polygon
                    points={`5,60 ${points} ${95},60`}
                    fill={`url(#gradient-${metric})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Line */}
                <motion.polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                />

                {/* Data points */}
                {data.map((d, i) => {
                    const x = 5 + (i / (data.length - 1 || 1)) * 90;
                    const normalizedValue = ((d[metric] || 0) - minValue) / (maxValue - minValue || 1);
                    const y = 55 - (normalizedValue * 50);

                    return (
                        <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="2"
                            fill={color}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                            <title>{`${d.date}: ${d[metric]} ${unit}`}</title>
                        </motion.circle>
                    );
                })}
            </svg>

            <div className="flex justify-between text-[8px] text-gray-600 font-bold">
                <span>{data[0]?.date ? new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                <span>{data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
        </div>
    );
}
