import { motion } from 'framer-motion';
import { useGetRoadmapStatusQuery } from '../../../features/api/apiSlice';
import { Trophy, Lock, CheckCircle2, Star, Sparkles, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnnualArchitectureMapProps {
    onSelectMonth: (month: number) => void;
}

const MONTHS = [
    { id: 1, name: 'January', period: 1 },
    { id: 2, name: 'February', period: 1 },
    { id: 3, name: 'March', period: 1 },
    { id: 4, name: 'April', period: 2 },
    { id: 5, name: 'May', period: 2 },
    { id: 6, name: 'June', period: 2 },
    { id: 7, name: 'July', period: 3 },
    { id: 8, name: 'August', period: 3 },
    { id: 9, name: 'September', period: 3 },
    { id: 10, name: 'October', period: 4 },
    { id: 11, name: 'November', period: 4 },
    { id: 12, name: 'December', period: 4 },
];

const PERIOD_THEMES = {
    1: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.03)', border: 'rgba(99, 102, 241, 0.1)', title: 'The Genesis Phase' },
    2: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.03)', border: 'rgba(139, 92, 246, 0.1)', title: 'Expansion & Power' },
    3: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.03)', border: 'rgba(236, 72, 153, 0.1)', title: 'Biological Optimization' },
    4: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.03)', border: 'rgba(245, 158, 11, 0.1)', title: 'Identity Consolidation' },
};

export function AnnualArchitectureMap({ onSelectMonth }: AnnualArchitectureMapProps) {
    const { data: status = [] } = useGetRoadmapStatusQuery({});
    const currentMonth = new Date().getMonth() + 1;

    // Define coordinates for each node to ensure the path hits the center
    // Increased x-offsets to prevent labels from being cut off (shifted from 150/750 to 250/650)
    // Shifted Y down by 300 to account for the chart at the top
    const NODE_COORDS = [
        { x: 300, y: 450 }, { x: 500, y: 600 }, { x: 700, y: 750 }, // Jan, Feb, Mar
        { x: 700, y: 1000 }, { x: 500, y: 1150 }, { x: 300, y: 1300 }, // Apr, May, Jun
        { x: 300, y: 1550 }, { x: 500, y: 1700 }, { x: 700, y: 1850 }, // Jul, Aug, Sep
        { x: 700, y: 2100 }, { x: 500, y: 2250 }, { x: 300, y: 2400 }, // Oct, Nov, Dec
    ];

    const chartData = MONTHS.map(m => {
        const monthStatus = status.find(s => s.month === m.id);
        return {
            name: m.name.substring(0, 3),
            completion: monthStatus?.completion_rate || 0
        };
    });

    const avgAnnualStatus = status.length > 0
        ? Math.round(status.reduce((acc, s) => acc + s.completion_rate, 0) / status.length)
        : 0;

    const generatePathData = (coords: { x: number; y: number }[]) => {
        if (coords.length < 2) return "";
        let d = `M ${coords[0].x} ${coords[0].y}`;
        for (let i = 1; i < coords.length; i++) {
            const prev = coords[i - 1];
            const curr = coords[i];
            const midY = (prev.y + curr.y) / 2;
            d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
        }
        return d;
    };

    const isMonthUnlocked = (monthId: number) => {
        if (monthId <= currentMonth) return true;
        const prevStatus = status.find(s => s.month === monthId - 1);
        return prevStatus?.is_completed;
    };

    return (
        <div className="relative w-full min-h-[2800px] py-20 px-10 overflow-hidden">
            {/* GLOBAL ARCHITECTURE GAIN CHART */}
            <div className="max-w-6xl mx-auto mb-32 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex justify-between items-end px-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Architecture Mastery Index</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">Global Evolution <span className="text-indigo-500">Sync</span></h2>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Annual Average</div>
                        <div className="text-4xl font-black text-white italic">{avgAnnualStatus}%</div>
                    </div>
                </div>

                <div className="h-64 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSync" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                                itemStyle={{ color: '#6366f1', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="completion"
                                stroke="#6366f1"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorSync)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Period Backgrounds */}
            {[1, 2, 3, 4].map(p => (
                <div
                    key={p}
                    className="absolute left-0 w-full flex flex-col items-center justify-start pointer-events-none transition-all duration-1000"
                    style={{
                        top: (p - 1) * 550 + 400,
                        height: 550,
                        backgroundColor: PERIOD_THEMES[p as 1 | 2 | 3 | 4].bg,
                        borderTop: `1px solid ${PERIOD_THEMES[p as 1 | 2 | 3 | 4].border}`,
                        borderBottom: `1px solid ${PERIOD_THEMES[p as 1 | 2 | 3 | 4].border}`,
                    }}
                >
                    <div className="mt-10 flex flex-col items-center opacity-20">
                        <span className="text-[100px] font-black text-white/5 select-none uppercase tracking-[0.5em]">PHASE 0{p}</span>
                        <span className="text-xl font-black text-white/20 uppercase tracking-[1em] -mt-10">{PERIOD_THEMES[p as 1 | 2 | 3 | 4].title}</span>
                    </div>
                </div>
            ))}

            {/* SVG Path Background */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="33%" stopColor="#8b5cf6" />
                        <stop offset="66%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>

                <path
                    d={generatePathData(NODE_COORDS)}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="15 20"
                />

                {NODE_COORDS.slice(0, currentMonth).length > 1 && (
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d={generatePathData(NODE_COORDS.slice(0, currentMonth))}
                        fill="none"
                        stroke="url(#pathGrad)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        className="opacity-80"
                    />
                )}
            </svg>

            {/* Path Nodes */}
            {MONTHS.map((month, index) => {
                const monthStatus = status.find(s => s.month === month.id);
                const isCompleted = monthStatus?.is_completed;
                const isCurrent = month.id === currentMonth;
                const isUnlocked = isMonthUnlocked(month.id);
                const point = NODE_COORDS[index];
                const theme = PERIOD_THEMES[month.period as 1 | 2 | 3 | 4];

                return (
                    <div
                        key={month.id}
                        className="absolute"
                        style={{
                            left: point.x,
                            top: point.y,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20
                        }}
                    >
                        <div className="relative group">
                            <motion.button
                                whileHover={isUnlocked ? { scale: 1.1, y: -5 } : {}}
                                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                onClick={() => isUnlocked && onSelectMonth(month.id)}
                                className={`
                                    relative w-28 h-28 rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 shadow-2xl
                                    ${isCompleted ? 'bg-indigo-600 border-2 border-indigo-400' :
                                        isCurrent ? 'bg-white text-black border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)]' :
                                            !isUnlocked ? 'bg-black/40 border border-white/5 opacity-50 grayscale cursor-not-allowed' :
                                                'bg-gray-900 border border-white/10 backdrop-blur-3xl group-hover:border-white/30'}
                                `}
                            >
                                {isCompleted ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <CheckCircle2 size={24} className="text-white" />
                                        <span className="text-sm font-black text-white">{monthStatus?.completion_rate}%</span>
                                    </div>
                                ) : isCurrent ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <Star size={32} className="text-indigo-600 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Active</span>
                                    </div>
                                ) : !isUnlocked ? (
                                    <Lock size={32} className="text-gray-700" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-black text-gray-500 group-hover:text-white">{month.id}</span>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Growth</span>
                                    </div>
                                )}
                            </motion.button>

                            <div
                                className={`absolute top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap transition-all duration-500
                                    ${index === 1 || index === 4 || index === 7 || index === 10 ? 'left-full ml-10' :
                                        point.x < 450 ? 'left-full ml-10' : 'right-full mr-10 text-right'}
                                    ${!isUnlocked ? 'opacity-30' : 'opacity-100'}
                                `}
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1" style={{ color: theme.color }}>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Phase {month.period}</span>
                                        {isCompleted && <Sparkles size={10} />}
                                    </div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{month.name}</h3>
                                    {isCompleted && (
                                        <span className="mt-2 text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded w-fit inline-block">Achievement Unlocked</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {[3, 6, 9].map((m) => {
                const point = NODE_COORDS[m - 1];
                const theme = PERIOD_THEMES[Math.ceil(m / 3) as 1 | 2 | 3 | 4];
                return (
                    <div
                        key={m}
                        className="absolute left-1/2 -translate-x-1/2 w-full max-w-4xl pointer-events-none"
                        style={{ top: point.y + 120 }}
                    >
                        <div className="flex items-center gap-8">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <div className="px-6 py-3 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl flex items-center gap-4 group">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.color}22` }}>
                                    <Trophy size={16} style={{ color: theme.color }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Milestone Checkpoint</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">End of Period {Math.ceil(m / 3)}</span>
                                </div>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
