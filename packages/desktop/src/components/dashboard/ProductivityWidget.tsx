import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import GlassCard from '../ui/GlassCard';
import { Clock, CheckCircle } from 'lucide-react';

interface ProductivityWidgetProps {
    focusMinutes: number;
    tasksCompleted: number;
    streak: number;
    dailyGoal: number; // minutes
    fullHeight?: boolean;
}

export default function ProductivityWidget({ focusMinutes, tasksCompleted, streak, dailyGoal, fullHeight }: ProductivityWidgetProps) {
    const percentage = Math.min(100, Math.round((focusMinutes / dailyGoal) * 100));

    // Format minutes to H m
    const hours = Math.floor(focusMinutes / 60);
    const mins = focusMinutes % 60;

    return (
        <GlassCard fullHeight={fullHeight}>
            <div className="flex justify-between items-start mb-8">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Productivity</h3>
                <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-lg shadow-amber-500/5">
                    <span className="text-sm">🔥</span>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{streak} days</span>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="w-28 h-28">
                    <CircularProgressbar
                        value={percentage}
                        text={`${percentage}%`}
                        strokeWidth={10}
                        styles={buildStyles({
                            textSize: '24px',
                            pathColor: '#6366f1', // Indigo 500
                            textColor: '#fff',
                            trailColor: 'rgba(255,255,255,0.05)',
                            strokeLinecap: 'round',
                        })}
                    />
                </div>

                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                            <Clock size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Focus Time</div>
                            <div className="text-lg font-black text-white tracking-tight">{hours}h {mins}m</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                            <CheckCircle size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tasks Done</div>
                            <div className="text-lg font-black text-white tracking-tight">{tasksCompleted}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                    <span>Daily Goal</span>
                    <span className="text-white">{focusMinutes}/{dailyGoal} min</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </GlassCard>
    );
}
