import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import GlassCard from '../ui/GlassCard';
import { Clock, CheckCircle } from 'lucide-react';

interface ProductivityWidgetProps {
    focusMinutes: number;
    tasksCompleted: number;
    streak: number;
    dailyGoal: number; // minutes
}

export default function ProductivityWidget({ focusMinutes, tasksCompleted, streak, dailyGoal }: ProductivityWidgetProps) {
    const percentage = Math.min(100, Math.round((focusMinutes / dailyGoal) * 100));

    // Format minutes to H m
    const hours = Math.floor(focusMinutes / 60);
    const mins = focusMinutes % 60;

    return (
        <GlassCard>
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-white">Productivity</h3>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <span className="text-lg">🔥</span> {streak} days
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="w-24 h-24 font-bold">
                    <CircularProgressbar
                        value={percentage}
                        text={`${percentage}%`}
                        styles={buildStyles({
                            textSize: '24px',
                            pathColor: '#8b5cf6', // Violet
                            textColor: '#fff',
                            trailColor: 'rgba(255,255,255,0.1)',
                        })}
                    />
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Clock size={16} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Focus Time</div>
                            <div className="font-bold text-white">{hours}h {mins}m</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle size={16} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400">Tasks Done</div>
                            <div className="font-bold text-white">{tasksCompleted}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Daily Goal</span>
                    <span>{focusMinutes}/{dailyGoal} min</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </GlassCard>
    );
}
