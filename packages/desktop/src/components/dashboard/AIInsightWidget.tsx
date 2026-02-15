import { Lightbulb, ArrowRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface AIInsightWidgetProps {
    burnoutScore: number;
    healthEntry: any;
}

export default function AIInsightWidget({ burnoutScore, healthEntry }: AIInsightWidgetProps) {
    // Determine dynamic insight based on data
    let title = "Ready for Impact";
    let message = "Your metrics look balanced. Great day for deep work.";

    if (burnoutScore > 50) {
        title = "Take a Breather";
        message = "Your stress levels are rising. Consider a lighter workload today.";
    } else if ((healthEntry?.sleep_hours || 8) < 6) {
        title = "Sleep Matters";
        message = "You slept less than 6 hours. Consider shorter focus sessions today.";
    }

    return (
        <GlassCard className="border-indigo-500/20" glowColor="bg-indigo-500/10" padding="p-6" fullHeight={false}>
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center text-indigo-400 shrink-0 shadow-2xl border border-indigo-500/20">
                    <Lightbulb size={28} className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-indigo-400 tracking-[0.3em] uppercase opacity-80">Intelligence Protocol</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75" />
                            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-150" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-white mb-1 italic uppercase tracking-tighter">{title}</h3>
                    <p className="text-gray-400 text-[13px] font-medium leading-relaxed line-clamp-2 mb-4">{message}</p>

                    <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors group/btn">
                        Consult Deepmind Data
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}
