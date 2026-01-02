import { Lightbulb, ArrowRight } from 'lucide-react';

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
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/40 to-blue-900/20 backdrop-blur-md p-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/10">
                    <Lightbulb size={20} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-400 tracking-wider">AI INSIGHT</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{message}</p>

                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 px-4 text-sm text-gray-300 flex items-center justify-center gap-2 transition-all group">
                        Chat with Deepmind
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
