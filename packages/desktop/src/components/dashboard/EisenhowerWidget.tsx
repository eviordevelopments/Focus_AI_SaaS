import { useGetEisenhowerSummaryQuery } from '../../features/api/apiSlice';
import { Target, ArrowUpRight, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../features/ui/uiSlice';
import GlassCard from '../ui/GlassCard';

export function EisenhowerWidget() {
    const today = new Date().toISOString().split('T')[0];
    const { data: summary, isLoading } = useGetEisenhowerSummaryQuery(today);
    const dispatch = useDispatch();

    if (isLoading) return <div className="h-64 bg-[#1a1b1e]/60 backdrop-blur-3xl border border-white/10 rounded-[40px] animate-pulse" />;

    return (
        <GlassCard glowColor="bg-blue-500/10" className="border-blue-500/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform duration-500">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Matrix Today</h3>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-black">Eisenhower Focus</p>
                    </div>
                </div>
                <button
                    onClick={() => dispatch(setActiveTab('eisenhower'))}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all active:scale-90 border border-white/5"
                >
                    <ArrowUpRight size={20} />
                </button>
            </div>

            {/* Grid Preview */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                    { label: 'Do', value: summary?.Q1_DO || 0, color: 'bg-rose-500/10', textColor: 'text-rose-400', borderColor: 'border-rose-500/20' },
                    { label: 'Schedule', value: summary?.Q2_SCHEDULE || 0, color: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/20' },
                    { label: 'Delegate', value: summary?.Q3_DELEGATE || 0, color: 'bg-amber-500/10', textColor: 'text-amber-400', borderColor: 'border-amber-500/20' },
                    { label: 'Delete', value: summary?.Q4_DELETE || 0, color: 'bg-gray-500/10', textColor: 'text-gray-400', borderColor: 'border-gray-500/20' }
                ].map((item, i) => (
                    <div key={i} className={`${item.color} ${item.borderColor} border rounded-2xl p-4 flex flex-col items-center group/item hover:bg-opacity-20 transition-all duration-300`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${item.textColor}`}>{item.label}</span>
                        <span className="text-2xl font-black text-white italic">{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Top Items */}
            {summary?.top_items?.length > 0 && (
                <div className="space-y-3 mt-auto pt-6 border-t border-white/5">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 mb-3">Priority Focus</div>
                    {summary.top_items.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group/list hover:bg-white/10 transition-all">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${item.quadrant === 'Q1_DO' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
                            <span className="text-[13px] text-gray-300 font-bold truncate flex-1 group-hover/list:text-white transition-colors">{item.title}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {(!summary?.top_items || summary.top_items.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 mt-4 italic space-y-3">
                    <Sparkles size={32} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Protocols pending setup</span>
                </div>
            )}
        </GlassCard>
    );
}
