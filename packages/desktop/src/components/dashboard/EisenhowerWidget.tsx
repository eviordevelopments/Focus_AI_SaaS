import { useGetEisenhowerSummaryQuery } from '../../features/api/apiSlice';
import { Target, ArrowUpRight, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../features/ui/uiSlice';

export function EisenhowerWidget() {
    const today = new Date().toISOString().split('T')[0];
    const { data: summary, isLoading } = useGetEisenhowerSummaryQuery(today);
    const dispatch = useDispatch();

    if (isLoading) return <div className="h-48 glass-panel rounded-3xl animate-pulse" />;

    return (
        <div className="group relative glass-panel rounded-3xl p-6 overflow-hidden transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl shadow-inner border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold leading-none">Matrix Today</h3>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Eisenhower Focus</p>
                    </div>
                </div>
                <button
                    onClick={() => dispatch(setActiveTab('eisenhower'))}
                    className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all active:scale-90"
                >
                    <ArrowUpRight size={18} />
                </button>
            </div>

            {/* Grid Preview */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center">
                    <span className="text-xs font-bold text-rose-400">Do</span>
                    <span className="text-xl font-bold text-white">{summary?.Q1_DO || 0}</span>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col items-center">
                    <span className="text-xs font-bold text-blue-400">Schedule</span>
                    <span className="text-xl font-bold text-white">{summary?.Q2_SCHEDULE || 0}</span>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col items-center">
                    <span className="text-xs font-bold text-amber-400">Delegate</span>
                    <span className="text-xl font-bold text-white">{summary?.Q3_DELEGATE || 0}</span>
                </div>
                <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-2xl flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-400">Delete</span>
                    <span className="text-xl font-bold text-white">{summary?.Q4_DELETE || 0}</span>
                </div>
            </div>

            {/* Top Items */}
            {summary?.top_items?.length > 0 && (
                <div className="space-y-2 mt-auto">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">Deep Focus Needs</div>
                    {summary.top_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 group/item hover:border-white/20 transition-all">
                            <div className={`w-1.5 h-1.5 rounded-full shadow-lg ${item.quadrant === 'Q1_DO' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
                            <span className="text-xs text-gray-300 font-medium truncate flex-1 group-hover/item:text-white transition-colors">{item.title}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {(!summary?.top_items || summary.top_items.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 mt-4 italic">
                    <Sparkles size={24} className="mb-2" />
                    <span className="text-[10px]">No priorities set yet</span>
                </div>
            )}
        </div>
    );
}
