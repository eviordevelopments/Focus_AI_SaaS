import { X, ExternalLink } from 'lucide-react';

interface WorkflowInspectorProps {
    onClose: () => void;
}

export default function WorkflowInspector({ onClose }: WorkflowInspectorProps) {
    return (
        <aside className="w-80 glass-panel bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Configuration</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                {/* Step Identity */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                            <ExternalLink size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white italic uppercase tracking-tight">Open Workspace</h4>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1 text-indigo-400">App / URL Step</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Protocol Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Open Dev Dashboard"
                                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/10 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Target Resource (URL)</label>
                            <div className="relative">
                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-white/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Execution Instruction</label>
                            <textarea
                                placeholder="Review last night's logs..."
                                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/10 transition-all h-24 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                Update Step
            </button>
        </aside>
    );
}
