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
        <div className="flex flex-col items-center justify-center p-8 w-full">
            {/* Interactive Hub for Programming Sessions */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
                    <button
                        key={m}
                        disabled={isActive}
                        onClick={() => dispatch(setTimerConfig({ mode: m, minutes: MODES[m].minutes }))}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all border ${mode === m ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-[var(--bg-card)] border-white/5 text-[var(--text-dim)] hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        {MODES[m].name} ({MODES[m].minutes}M)
                    </button>
                ))}
                
                {/* Custom Time Input (Graphical) */}
                {mode === 'custom' && !isActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 bg-[var(--bg-card)] border border-indigo-500/30 rounded-2xl px-4 py-2"
                    >
                        <input
                            type="number"
                            min="1"
                            max="480"
                            value={plannedMinutes}
                            onChange={(e) => dispatch(setTimerConfig({ mode: 'custom', minutes: parseInt(e.target.value) || 1 }))}
                            className="bg-transparent text-white font-black text-lg w-16 text-center focus:outline-none"
                        />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">MIN</span>
                    </motion.div>
                )}
            </div>

            {/* Graphical Circle Timer */}
            <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center mb-12 group">
                <svg className="absolute w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
                    {/* Segment markers (graphical clock feel) */}
                    {Array.from({ length: 60 }).map((_, i) => (
                        <line 
                            key={i}
                            x1="50" y1="4" x2="50" y2={i % 5 === 0 ? "8" : "6"}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="0.5"
                            transform={`rotate(${i * 6} 50 50)`}
                        />
                    ))}
                    {/* Animated Progress Ring */}
                    <motion.circle
                        cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progress}
                        className={`${isActive ? 'text-indigo-400' : 'text-gray-600'} transition-all duration-1000 ease-linear`}
                        filter={isActive ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))" : "none"}
                    />
                </svg>

                {/* Center Digital Display */}
                <div className="flex flex-col items-center z-10">
                    <motion.div
                        key={timeLeft}
                        initial={{ opacity: 0.8, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[6rem] font-black tracking-tighter tabular-nums drop-shadow-2xl leading-none text-white selection:bg-transparent"
                    >
                        {formatTime(timeLeft)}
                    </motion.div>
                    <div className="text-xs font-black uppercase tracking-[0.4em] mt-6 flex items-center gap-3">
                        {isPaused ? (
                            <span className="text-amber-400 flex items-center gap-2"><Pause size={14} /> PAUSED</span>
                        ) : isActive ? (
                            <span className="text-indigo-400 flex items-center gap-2"><Play size={14} /> FLOWING</span>
                        ) : (
                            <span className="text-gray-500 flex items-center gap-2"><Square size={14} /> READY</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Core Controls */}
            <div className="flex items-center gap-8">
                {!isActive ? (
                    <button
                        onClick={handleStart}
                        className="px-12 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Play size={20} fill="currentColor" /> Initialize Session
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => isPaused ? dispatch(resumeTimer()) : dispatch(pauseTimer())}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isPaused ? 'bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105' : 'bg-[var(--bg-card)] border border-white/10 text-white hover:bg-white/5 active:scale-95'}`}
                        >
                            {isPaused ? <Play size={24} fill="currentColor" className="ml-1" /> : <Pause size={24} fill="currentColor" />}
                        </button>
                        <button
                            onClick={handleStop}
                            className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-white/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 hover:text-red-300 transition-all hover:scale-105 active:scale-95"
                        >
                            <Square size={20} fill="currentColor" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
