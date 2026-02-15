import GlassCard from '../ui/GlassCard';
import { Clock, Zap, Coffee, Play } from 'lucide-react';

interface QuickFocusWidgetProps {
    lastSession: any;
    onStartSession: (type: string, min: number) => void;
    fullHeight?: boolean;
}

export default function QuickFocusWidget({ lastSession, onStartSession, fullHeight }: QuickFocusWidgetProps) {
    return (
        <GlassCard glowColor="bg-purple-500/10" fullHeight={fullHeight}>
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Quick Focus</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-50">Last: {lastSession ? lastSession.planned_minutes : 25}min {lastSession?.type || 'pomodoro'}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { id: 'pomodoro', min: 25, label: 'Pomodoro', icon: Clock, color: 'indigo' },
                    { id: 'deepwork', min: 50, label: 'Deep Work', icon: Zap, color: 'purple' },
                    { id: 'custom', min: 90, label: 'Custom', icon: Coffee, color: 'amber' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onStartSession(item.id, item.min)}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-[2rem] p-4 flex flex-col items-center gap-3 transition-all duration-300 group/btn"
                    >
                        <div className={`w-10 h-10 rounded-2xl bg-${item.color}-500/10 text-${item.color}-400 flex items-center justify-center group-hover/btn:scale-110 transition-transform duration-500 border border-${item.color}-500/10`}>
                            <item.icon size={20} />
                        </div>
                        <div className="text-center">
                            <div className="font-black text-white text-[10px] uppercase tracking-tighter">{item.label}</div>
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">{item.min === 90 ? 'Set time' : `${item.min} min`}</div>
                        </div>
                    </button>
                ))}
            </div>

            <button className="w-full h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-[100%_0] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] border border-white/10">
                <Play size={18} fill="currentColor" strokeWidth={0} /> Start Focus Session
            </button>
        </GlassCard>
    );
}
