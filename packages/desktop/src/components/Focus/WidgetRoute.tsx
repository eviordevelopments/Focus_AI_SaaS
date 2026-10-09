import { useEffect, useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../index.css';

export function WidgetRoute() {
    const [timerState, setTimerState] = useState<{
        isActive: boolean;
        isPaused: boolean;
        timeLeft: number;
        plannedMinutes: number;
        progress: number;
    }>({
        isActive: false,
        isPaused: false,
        timeLeft: 0,
        plannedMinutes: 25,
        progress: 0,
    });

    useEffect(() => {
        // Apply transparent background to body for frameless window
        document.body.style.backgroundColor = 'transparent';
        const root = document.getElementById('root');
        if (root) root.style.backgroundColor = 'transparent';

        // Listen for sync events from the main window
        if (window.electronAPI && window.electronAPI.onTimerSync) {
            const cleanup = window.electronAPI.onTimerSync((event: any, data: any) => {
                setTimerState(data);
            });
            return () => {
                cleanup();
                document.body.style.backgroundColor = '';
                if (root) root.style.backgroundColor = '';
            };
        }
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (window.electronAPI) {
            window.electronAPI.sendWidgetCommand('toggle');
        }
    };

    const handleStop = () => {
        if (window.electronAPI) {
            window.electronAPI.sendWidgetCommand('stop');
        }
    };

    return (
        <div style={{ WebkitAppRegion: 'drag' } as any} className="w-full h-screen flex items-center justify-center p-4">
            <div 
                className="w-full h-full bg-black/60 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-2xl flex items-center p-3 gap-4"
                style={{ WebkitAppRegion: 'drag' } as any}
            >
                {/* Visual Circle */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <motion.circle
                            cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8"
                            strokeLinecap="round"
                            pathLength="100"
                            strokeDasharray="100"
                            strokeDashoffset={100 - timerState.progress}
                            className={`${timerState.isActive && !timerState.isPaused ? 'text-indigo-400' : 'text-gray-500'} transition-all duration-1000 ease-linear`}
                        />
                    </svg>
                    {timerState.isPaused ? (
                        <Pause size={16} className="text-amber-400 z-10 drop-shadow-md" />
                    ) : (
                        <Play size={16} className="text-indigo-400 z-10 drop-shadow-md" />
                    )}
                </div>

                {/* Digital Display */}
                <div className="flex flex-col flex-1 min-w-0" style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <span className="text-2xl font-black tabular-nums text-white leading-none tracking-tighter truncate">
                        {formatTime(timerState.timeLeft)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/80 mt-1 truncate">
                        {timerState.isPaused ? 'PAUSED' : 'FLOWING'}
                    </span>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2 pl-2 border-l border-white/10 shrink-0" style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <button
                        onClick={handlePlayPause}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all active:scale-95"
                    >
                        {timerState.isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                    </button>
                    <button
                        onClick={handleStop}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 text-red-400 transition-all active:scale-95"
                    >
                        <Square size={12} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}
