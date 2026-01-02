import { useState, useEffect } from 'react';
import { Play, Square, Pause } from 'lucide-react';
import { useStartSessionMutation, useFinishSessionMutation } from '../features/api/apiSlice';

interface TimerProps {
    initialMode?: 'pomodoro' | 'deepwork' | 'custom';
    initialDuration?: number;
}

export function Timer({ initialMode, initialDuration }: TimerProps) {
    // Mode
    const [mode, setMode] = useState<'pomodoro' | 'deepwork' | 'custom'>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    // Sync props to state when they change (external control)
    useEffect(() => {
        if (initialMode) setMode(initialMode);
        if (initialDuration) setTimeLeft(initialDuration * 60);
        // Auto-reset active state if external config changes
        if (initialMode || initialDuration) setIsActive(false);
    }, [initialMode, initialDuration]);

    // Session State
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showPostSession, setShowPostSession] = useState(false);

    // Mutations
    const [startSession] = useStartSessionMutation();
    const [finishSession] = useFinishSessionMutation();

    const MODES = {
        pomodoro: { name: 'Pomodoro', minutes: 25 },
        deepwork: { name: 'Deep Work', minutes: 50 },
        custom: { name: 'Custom', minutes: 15 } // Simplification
    };

    // Timer Tick
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished naturally
            setIsActive(false);
            handleFinish();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = async () => {
        const plannedMinutes = MODES[mode].minutes;
        try {
            const result = await startSession({
                type: mode,
                planned_minutes: plannedMinutes
            }).unwrap();
            setCurrentSessionId(result.id);
            setIsActive(true);
        } catch (err) {
            console.error("Failed to start session", err);
        }
    };

    const handlePause = () => {
        setIsActive(false);
    };

    const handleStop = () => {
        setIsActive(false);
        handleFinish();
    };

    const handleFinish = () => {
        setShowPostSession(true);
    };

    const submitSessionReview = async (quality: number, distractions: number) => {
        if (!currentSessionId) return;

        // Calculate actual minutes spent (simplified: planned - remaining, roughly)
        // In a real app we'd track start time vs now. 
        const plannedSeconds = MODES[mode].minutes * 60;
        const elapsedSeconds = plannedSeconds - timeLeft;
        const actualMinutes = Math.floor(elapsedSeconds / 60);

        await finishSession({
            id: currentSessionId,
            actual_minutes: actualMinutes,
            focus_quality: quality,
            distractions,
            notes: ''
        });

        setShowPostSession(false);
        setCurrentSessionId(null);
        // Reset timer
        setTimeLeft(MODES[mode].minutes * 60);
    };

    if (showPostSession) {
        return <PostSessionForm onSubmit={submitSessionReview} />;
    }

    const progress = 100 - (timeLeft / (MODES[mode].minutes * 60)) * 100;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            {/* Mode Switcher */}
            <div className="flex bg-white/5 rounded-full p-1 mb-8">
                {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
                    <button
                        key={m}
                        onClick={() => {
                            setMode(m);
                            setTimeLeft(MODES[m].minutes * 60);
                            setIsActive(false);
                        }}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === m ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        {MODES[m].name}
                    </button>
                ))}
            </div>

            {/* Timer Circle */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-8">
                {/* Simple SVG Circle */}
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff10" strokeWidth="2" />
                    <circle
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progress}
                        className="text-cyan-400 transition-all duration-1000 ease-linear"
                    />
                </svg>

                <div className="text-7xl font-bold tracking-tighter tabular-nums bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                {!isActive ? (
                    <button
                        onClick={handleStart}
                        className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                    >
                        <Play fill="currentColor" className="ml-1" />
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur transition-all"
                    >
                        <Pause fill="currentColor" />
                    </button>
                )}

                {/* Stop/Reset */}
                <button
                    onClick={handleStop}
                    className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                >
                    <Square size={24} fill="currentColor" />
                </button>
            </div>
        </div>
    );
}

function PostSessionForm({ onSubmit }: { onSubmit: (q: number, d: number) => void }) {
    const [quality, setQuality] = useState(8);
    const [distractions, setDistractions] = useState(0);

    return (
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Session Complete!</h2>

            <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Focus Quality (1-10)</label>
                <input
                    type="range" min="1" max="10"
                    value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                />
                <div className="text-center font-bold text-xl mt-2 text-cyan-400">{quality}</div>
            </div>

            <div className="mb-8">
                <label className="block text-gray-400 text-sm mb-2">Distractions</label>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setDistractions(Math.max(0, distractions - 1))} className="w-10 h-10 rounded-full bg-white/10">-</button>
                    <div className="text-2xl font-bold w-12 text-center">{distractions}</div>
                    <button onClick={() => setDistractions(distractions + 1)} className="w-10 h-10 rounded-full bg-white/10">+</button>
                </div>
            </div>

            <button
                onClick={() => onSubmit(quality, distractions)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all"
            >
                Save Session
            </button>
        </div>
    );
}
