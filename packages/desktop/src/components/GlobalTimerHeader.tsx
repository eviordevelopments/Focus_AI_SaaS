import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Play, Pause, Square, Zap, Clock } from 'lucide-react';
import { pauseTimer, resumeTimer, stopTimer } from '../features/timer/timerSlice';
import { motion } from 'framer-motion';

export default function GlobalTimerHeader() {
    const { isActive, isPaused, timeLeft, plannedMinutes, mode } = useSelector((state: RootState) => state.timer);
    const dispatch = useDispatch();

    if (!isActive) return null;

    const isStopwatch = plannedMinutes === 0;
    const progress = isStopwatch ? (timeLeft % 60) / 0.6 : 100 - (timeLeft / (plannedMinutes * 60)) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-[var(--glass-bg)] backdrop-blur-3xl border border-[var(--glass-border)] px-6 py-3 rounded-full shadow-[var(--card-shadow)]"
        >
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="2" />
                        <circle
                            cx="20" cy="20" r="18" fill="none" stroke="currentColor"
                            className="text-indigo-400 transition-all duration-1000"
                            strokeWidth="2"
                            pathLength="100"
                            strokeDasharray="100"
                            strokeDashoffset={100 - progress}
                        />
                    </svg>
                    {mode === 'pomodoro' ? <Zap size={14} className="text-indigo-400" /> : <Clock size={14} className="text-cyan-400" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] leading-tight">Focus Protocol</span>
                    <span className="text-sm font-black tabular-nums text-[var(--text-heading)] leading-tight">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
            </div>

            <div className="h-4 w-px bg-[var(--glass-border)] mx-2" />

            <div className="flex items-center gap-2">
                <button
                    onClick={() => isPaused ? dispatch(resumeTimer()) : dispatch(pauseTimer())}
                    className="p-2 hover:bg-[var(--glass-border)] rounded-full transition-colors text-[var(--text-main)]"
                >
                    {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                </button>
                <button
                    onClick={() => dispatch(stopTimer())}
                    className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-red-400"
                >
                    <Square size={14} fill="currentColor" />
                </button>
            </div>
        </motion.div>
    );
}
