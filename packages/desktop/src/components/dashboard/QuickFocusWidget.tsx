import GlassCard from '../ui/GlassCard';
import { Clock, Zap, Coffee, Play } from 'lucide-react';

interface QuickFocusWidgetProps {
    lastSession: any;
    onStartSession: (type: string, min: number) => void;
}

export default function QuickFocusWidget({ lastSession, onStartSession }: QuickFocusWidgetProps) {
    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Quick Focus</h3>
                <span className="text-xs text-gray-500">Last: {lastSession ? lastSession.planned_minutes : 25}min {lastSession?.type || 'pomodoro'}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <button onClick={() => onStartSession('pomodoro', 25)} className="bg-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-transparent rounded-xl p-3 flex flex-col items-center gap-2 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock size={16} />
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-white text-xs">Pomodoro</div>
                        <div className="text-[10px] text-gray-500">25 min</div>
                    </div>
                </button>

                <button onClick={() => onStartSession('deepwork', 50)} className="bg-white/5 hover:bg-purple-600/20 hover:border-purple-500/50 border border-transparent rounded-xl p-3 flex flex-col items-center gap-2 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap size={16} />
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-white text-xs">Deep Work</div>
                        <div className="text-[10px] text-gray-500">50 min</div>
                    </div>
                </button>

                <button onClick={() => onStartSession('custom', 90)} className="bg-white/5 hover:bg-amber-600/20 hover:border-amber-500/50 border border-transparent rounded-xl p-3 flex flex-col items-center gap-2 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Coffee size={16} />
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-white text-xs">Custom</div>
                        <div className="text-[10px] text-gray-500">Set time</div>
                    </div>
                </button>
            </div>

            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Play size={18} fill="currentColor" /> Start Focus Session
            </button>
        </GlassCard>
    );
}
