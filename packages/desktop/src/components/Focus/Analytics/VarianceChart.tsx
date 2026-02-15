import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TimeSeriesPoint, OptimalRange } from '../../../config/metricConfig';

interface VarianceChartProps {
    data: TimeSeriesPoint[];
    optimal: OptimalRange;
    unit: string;
    color: string;
}

export function VarianceChart({ data, optimal, unit, color }: VarianceChartProps) {
    const { width, height, padding } = { width: 800, height: 300, padding: 40 };

    const { xScale, yScale, maxY } = useMemo(() => {
        if (data.length === 0) return { xScale: () => 0, yScale: () => 0, maxY: 0 };

        const allValues = data.flatMap(d => [d.value, d.personalBest, d.personalLow, optimal.max]);
        const maxY = Math.max(...allValues, optimal.max) * 1.1;
        const minY = 0;

        const xScale = (index: number) => padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
        const yScale = (value: number) => height - padding - ((value - minY) / (maxY - minY)) * (height - 2 * padding);

        return { xScale, yScale, maxY };
    }, [data, optimal.max, width, height, padding]);

    if (data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                No data available for this period
            </div>
        );
    }

    // Generate path strings for each line
    const optimalPath = `M ${padding} ${yScale(optimal.target)} L ${width - padding} ${yScale(optimal.target)}`;
    const optimalZonePath = `
        M ${padding} ${yScale(optimal.max)}
        L ${width - padding} ${yScale(optimal.max)}
        L ${width - padding} ${yScale(optimal.min)}
        L ${padding} ${yScale(optimal.min)}
        Z
    `;

    const personalBestPath = data.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.personalBest)}`
    ).join(' ');

    const personalLowPath = data.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.personalLow)}`
    ).join(' ');

    const currentPath = data.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`
    ).join(' ');

    return (
        <div className="w-full h-full relative">
            {/* Legend */}
            <div className="absolute top-0 right-0 flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-emerald-500 opacity-50" style={{ borderTop: '2px dashed' }} />
                    <span className="text-emerald-400">Optimal</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-500" />
                    <span className="text-blue-400">Best</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-rose-500" />
                    <span className="text-rose-400">Low</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
                    <span className="text-white">Current</span>
                </div>
            </div>

            {/* Chart SVG */}
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="mt-8">
                {/* Optimal Zone (filled area) */}
                <motion.path
                    d={optimalZonePath}
                    fill="rgba(16, 185, 129, 0.1)"
                    stroke="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Optimal Target Line (dashed) */}
                <motion.path
                    d={optimalPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                />

                {/* Personal Best Line */}
                <motion.path
                    d={personalBestPath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                />

                {/* Personal Low Line */}
                <motion.path
                    d={personalLowPath}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                />

                {/* Current Trend Line */}
                <motion.path
                    d={currentPath}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                />

                {/* Data Points */}
                {data.map((d, i) => (
                    <g key={i}>
                        <motion.circle
                            cx={xScale(i)}
                            cy={yScale(d.value)}
                            r="4"
                            fill={color}
                            stroke="white"
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.05 }}
                            className="cursor-pointer hover:r-6 transition-all"
                        >
                            <title>
                                {`${d.date}\nCurrent: ${d.value}${unit}\nBest: ${d.personalBest}${unit}\nLow: ${d.personalLow}${unit}`}
                            </title>
                        </motion.circle>
                    </g>
                ))}

                {/* Y-Axis Labels */}
                <text x={padding - 10} y={yScale(maxY)} textAnchor="end" className="text-[10px] fill-gray-500 font-bold">
                    {Math.round(maxY)}{unit}
                </text>
                <text x={padding - 10} y={yScale(0)} textAnchor="end" className="text-[10px] fill-gray-500 font-bold">
                    0{unit}
                </text>

                {/* X-Axis Labels (first, middle, last) */}
                {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
                    <text
                        key={i}
                        x={xScale(i)}
                        y={height - padding + 20}
                        textAnchor="middle"
                        className="text-[10px] fill-gray-500 font-bold"
                    >
                        {new Date(data[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </text>
                ))}
            </svg>
        </div>
    );
}
