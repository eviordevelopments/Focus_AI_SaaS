import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setPendingSessionConfig } from '../features/ui/uiSlice';
import { Timer } from './Timer';
import { useGetRecentSessionsQuery } from '../features/api/apiSlice';
import { Clock, Zap } from 'lucide-react';

export function DeepWorkView() {
    const { pendingSessionConfig } = useSelector((state: RootState) => state.ui);
    const dispatch = useDispatch();

    // Pass these to Timer
    const [initialMode, setInitialMode] = useState<'pomodoro' | 'deepwork' | 'custom'>('pomodoro');
    const [initialDuration, setInitialDuration] = useState(25);

    // Effect to handle incoming session config
    useEffect(() => {
        if (pendingSessionConfig) {
            setInitialMode(pendingSessionConfig.type as any);
            setInitialDuration(pendingSessionConfig.duration); // minutes
            // Clear pending config so it doesn't reset on future re-renders
            dispatch(setPendingSessionConfig(undefined));
        }
    }, [pendingSessionConfig, dispatch]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Main Timer Area */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
                {/* Timer needs to accept props to control it externally or set initial state */}
                <Timer initialMode={initialMode} initialDuration={initialDuration} />
            </div>

            {/* Sidebar Stats */}
            <div className="flex flex-col gap-6">
                <SessionStats />
                <RecentSessionsList />
            </div>
        </div>
    );
}

function SessionStats() {
    return (
        <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" /> Today's Focus
            </h3>
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-4xl font-bold text-white">45m</div>
                    <div className="text-xs text-gray-400 mt-1">Goal: 4h</div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center">
                    <span className="text-xs font-bold">18%</span>
                </div>
            </div>
        </div>
    )
}

function RecentSessionsList() {
    const { data: sessions } = useGetRecentSessionsQuery();

    return (
        <div className="glass-panel p-6 rounded-2xl flex-1 min-h-0 flex flex-col">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" /> Recent Sessions
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                {sessions?.map(session => (
                    <div key={session.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <div className="font-medium text-sm capitalize">{session.type}</div>
                            <div className="text-xs text-gray-500">{new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="text-cyan-400 font-bold text-sm">
                            {session.actual_minutes}m
                        </div>
                    </div>
                ))}
                {!sessions?.length && <div className="text-gray-500 text-sm text-center py-4">No sessions yet</div>}
            </div>
        </div>
    )
}
