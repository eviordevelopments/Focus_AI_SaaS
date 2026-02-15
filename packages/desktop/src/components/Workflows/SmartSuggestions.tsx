import { Play, Sparkles } from 'lucide-react';
import { useGetSmartSuggestionsQuery, Workflow } from '../../features/api/apiSlice';
import { motion } from 'framer-motion';

interface SmartSuggestionsProps {
    onRunWorkflow: (workflow: Workflow) => void;
}

export default function SmartSuggestions({ onRunWorkflow }: SmartSuggestionsProps) {
    const { data: suggestions = [], isLoading } = useGetSmartSuggestionsQuery();

    if (isLoading) return null;
    if (suggestions.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                <Sparkles className="text-amber-400" size={14} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Intelligent Recommendations</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {suggestions.map((workflow, index) => (
                    <motion.div
                        key={workflow.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative glass-panel bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-4 rounded-3xl flex items-center gap-4 hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden"
                        onClick={() => onRunWorkflow(workflow)}
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={40} />
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                            {workflow.emoji || '⚡'}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-white italic truncate uppercase tracking-tight">{workflow.name}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest">
                                    {Math.round((workflow.suggestionScore ?? 0) / 2)}% Match
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                                Suggested based on your {new Date().getHours() < 12 ? 'morning' : 'current'} usage patterns.
                            </p>
                        </div>

                        <button
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all active:scale-90"
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
