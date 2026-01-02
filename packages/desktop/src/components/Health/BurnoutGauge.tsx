import { useGetBurnoutScoreQuery } from '../../features/api/apiSlice';
import { Activity } from 'lucide-react';

export function BurnoutGauge() {
    const { data: burnout } = useGetBurnoutScoreQuery();

    const score = burnout?.score || 0;
    const level = burnout?.level || 'Unknown';
    const factors = burnout?.factors || [];

    // Color based on score
    let colorClass = 'text-green-400';
    let bgClass = 'bg-green-500/10 border-green-500/20';

    if (score > 40) { colorClass = 'text-yellow-400'; bgClass = 'bg-yellow-500/10 border-yellow-500/20'; }
    if (score > 70) { colorClass = 'text-red-400'; bgClass = 'bg-red-500/10 border-red-500/20'; }

    return (
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-0 w-full h-full opacity-20 blur-3xl rounded-full ${score > 70 ? 'bg-red-500' : 'bg-cyan-500'}`} />

            <h2 className="text-gray-300 font-medium mb-8 z-10 flex items-center gap-2">
                <Activity size={20} /> Burnout Risk Score
            </h2>

            <div className="relative z-10 mb-8">
                <svg className="w-64 h-32 overflow-visible" viewBox="0 0 200 100">
                    {/* Background Arc */}
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ffffff10" strokeWidth="20" strokeLinecap="round" />

                    {/* Value Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="20"
                        strokeLinecap="round"
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                        strokeDasharray="251" // Circumference of semi-circle approx
                        strokeDashoffset={251 - (251 * score / 100)}
                    />
                </svg>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-5xl font-bold text-white">
                    {score}
                </div>
            </div>

            <div className={`z-10 px-4 py-2 rounded-full border ${bgClass} ${colorClass} font-bold animate-pulse`}>
                {level}
            </div>

            {factors.length > 0 && (
                <div className="mt-8 z-10 w-full">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Contributing Factors</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {factors.map((f: string) => (
                            <span key={f} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
