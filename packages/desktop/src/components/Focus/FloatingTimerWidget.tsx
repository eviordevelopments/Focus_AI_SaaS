import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Play, Pause, Square } from 'lucide-react';
import { pauseTimer, resumeTimer, stopTimer, completeTimer } from '../../features/timer/timerSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinishSessionMutation } from '../../features/api/apiSlice';

export function FloatingTimerWidget() {
    const { isActive, isPaused, timeLeft, plannedMinutes, currentSessionId } = useSelector((state: RootState) => state.timer);
    const dispatch = useDispatch();
    const [finishSessionApi] = useFinishSessionMutation();

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isStopwatch = plannedMinutes === 0;
    const progress = isStopwatch ? (timeLeft % 60) / 0.6 : 100 - (timeLeft / (plannedMinutes * 60)) * 100;

    // Electron integration
    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.openWidget();
        }
        return () => {
            if (window.electronAPI) {
                window.electronAPI.closeWidget();
            }
        };
    }, []);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.syncTimer({
                isActive,
                isPaused,
                timeLeft,
                plannedMinutes,
                progress
            });
        }
    }, [isActive, isPaused, timeLeft, plannedMinutes, progress]);

    useEffect(() => {
        if (window.electronAPI && window.electronAPI.onWidgetCommand) {
            const cleanup = window.electronAPI.onWidgetCommand((event: any, command: string) => {
                if (command === 'toggle') {
                    isPaused ? dispatch(resumeTimer()) : dispatch(pauseTimer());
                } else if (command === 'stop') {
                    // Stop handled in widget or via dispatch
                    dispatch(stopTimer());
                }
            });
            return cleanup;
        }
    }, [isPaused, currentSessionId, timeLeft, plannedMinutes]);

    if (!isActive && !isPaused && timeLeft === plannedMinutes * 60) return null;

    const handleStop = async () => {
        if (!currentSessionId) {
            dispatch(stopTimer());
            return;
        }
        const elapsedSeconds = isStopwatch ? timeLeft : (plannedMinutes * 60) - timeLeft;
        const actualMinutes = Math.floor(elapsedSeconds / 60);

        try {
            await finishSessionApi({
                id: currentSessionId,
                actual_minutes: actualMinutes,
                focus_quality: 10,
                distractions: 0,
                notes: ''
            }).unwrap();
            dispatch(completeTimer());
        } catch (err) {
            console.error("Failed to finish session", err);
            dispatch(stopTimer());
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-[100] flex items-center gap-4 bg-[var(--bg-card)]/90 backdrop-blur-xl border border-white/10 p-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <motion.circle
                            cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8"
                            strokeLinecap="round"
                            pathLength="100"
                            strokeDasharray="100"
                            strokeDashoffset={100 - progress}
                            className={`${isActive && !isPaused ? 'text-indigo-400' : 'text-gray-500'} transition-all duration-1000 ease-linear`}
                        />
                    </svg>
                    {isPaused ? (
                        <Pause size={14} className="text-amber-400 z-10" />
                    ) : (
                        <Play size={14} className="text-indigo-400 z-10" />
                    )}
                </div>

                <div className="flex flex-col min-w-[60px]">
                    <span className="text-lg font-black tabular-nums text-white leading-none tracking-tighter">
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                        {isPaused ? 'Paused' : 'Flowing'}
                    </span>
                </div>

                <div className="flex items-center gap-2 pr-2 border-l border-white/10 pl-4">
                    <button
                        onClick={() => isPaused ? dispatch(resumeTimer()) : dispatch(pauseTimer())}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all"
                    >
                        {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                    </button>
                    <button
                        onClick={handleStop}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 text-red-400 transition-all"
                    >
                        <Square size={14} fill="currentColor" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
