import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Play, Square, Pause } from 'lucide-react';
import {
    startTimer, pauseTimer, resumeTimer, stopTimer,
    setTimerConfig, completeTimer
} from '../features/timer/timerSlice';
import { useStartSessionMutation, useFinishSessionMutation, usePlantTreeMutation } from '../features/api/apiSlice';
import { motion } from 'framer-motion';

const MODES = {
    pomodoro: { name: 'Pomodoro', minutes: 25 },
    deepwork: { name: 'Deep Work', minutes: 50 },
    custom: { name: 'Custom', minutes: 15 }
};

export function Timer() {
    const { isActive, isPaused, timeLeft, plannedMinutes, mode, currentSessionId } = useSelector((state: RootState) => state.timer);
    const dispatch = useDispatch();

    const [startSessionApi] = useStartSessionMutation();
    const [finishSessionApi] = useFinishSessionMutation();
    const [plantTree] = usePlantTreeMutation();

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = async () => {
        const config = MODES[mode];
        try {
            const minutesToStart = mode === 'custom' ? plannedMinutes : config.minutes;
            const result = await startSessionApi({
                type: mode,
                planned_minutes: minutesToStart
            }).unwrap();
            dispatch(startTimer({ id: result.id, minutes: minutesToStart, mode }));
        } catch (err) {
            console.error("Failed to start session", err);
        }
    };

    const handleStop = async () => {
        if (!currentSessionId) {
            dispatch(stopTimer());
            return;
        }

        const isStopwatch = plannedMinutes === 0;
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

            // Reward: Plant a tree if session was substantial
            if (actualMinutes >= 1) {
                const treeTypes = ['evergreen', 'cherry', 'autumn', 'crystal'];
                const randomTree = treeTypes[Math.floor(Math.random() * treeTypes.length)];

                await plantTree({
                    session_id: currentSessionId,
                    tree_type: randomTree,
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10
                }).unwrap();
            }

            dispatch(completeTimer());
        } catch (err) {
            console.error("Failed to finish session", err);
            dispatch(stopTimer());
        }
    };

    const isStopwatch = plannedMinutes === 0;
    const progress = isStopwatch ? (timeLeft % 60) / 0.6 : 100 - (timeLeft / (plannedMinutes * 60)) * 100;

    return (
        <div className="flex flex-col items-center justify-center p-8">
            {/* Mode Switcher */}
            <div className="flex flex-col items-center gap-6 mb-12">
                <div className="flex bg-[var(--bg-card)] rounded-full p-1 border border-[var(--glass-border)] backdrop-blur-xl shrink-0">
                    {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
                        <button
                            key={m}
                            disabled={isActive}
                            onClick={() => dispatch(setTimerConfig({ mode: m, minutes: MODES[m].minutes }))}
                            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-[var(--text-heading)] text-[var(--bg-app)] shadow-2xl' : 'text-[var(--text-dim)] hover:text-[var(--text-main)] disabled:opacity-50'}`}
                        >
                            {MODES[m].name}
                        </button>
                    ))}
                </div>

                {mode === 'custom' && !isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Set Minutes:</span>
                        <input
                            type="number"
                            min="1"
                            max="480"
                            value={plannedMinutes}
                            onChange={(e) => dispatch(setTimerConfig({ mode: 'custom', minutes: parseInt(e.target.value) || 1 }))}
                            className="bg-transparent text-white font-black text-lg w-16 text-center focus:outline-none"
                        />
                    </motion.div>
                )}
            </div>

            {/* Timer Visual */}
            <div className="relative w-96 h-96 flex items-center justify-center mb-12">
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" className="text-white/[0.03]" strokeWidth="1.5" />
                    <motion.circle
                        cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progress}
                        className="text-indigo-500 transition-all duration-1000 ease-linear"
                        filter="drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))"
                    />
                </svg>

                <div className="flex flex-col items-center">
                    <motion.div
                        key={timeLeft}
                        initial={{ opacity: 0.8, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[9rem] font-black tracking-tighter tabular-nums drop-shadow-2xl leading-none text-[var(--text-heading)] selection:bg-transparent"
                    >
                        {formatTime(timeLeft)}
                    </motion.div>
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-dim)] mt-4">
                        {isPaused ? 'Paused' : isActive ? 'Concentrating' : 'Ready'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                {!isActive ? (
                    <button
                        onClick={handleStart}
                        className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                    >
                        <Play size={32} fill="currentColor" className="ml-1 transition-transform group-hover:scale-110" />
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => isPaused ? dispatch(resumeTimer()) : dispatch(pauseTimer())}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isPaused ? 'bg-indigo-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-main)] hover:bg-[var(--bg-card)]/80'}`}
                        >
                            {isPaused ? <Play size={28} fill="currentColor" className="ml-1" /> : <Pause size={28} fill="currentColor" />}
                        </button>
                        <button
                            onClick={handleStop}
                            className="w-20 h-20 rounded-full bg-[var(--bg-card)] border border-[var(--glass-border)] text-red-400 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 transition-all hover:scale-110 active:scale-95"
                        >
                            <Square size={24} fill="currentColor" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
