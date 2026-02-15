import { useMemo } from 'react';
import { useGetQuarterlyIdentitiesQuery } from '../../features/api/apiSlice';
import { Compass, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

export function PlanningWidget() {
    const { data: identities } = useGetQuarterlyIdentitiesQuery();

    const today = new Date();
    const currentQuarter = useMemo(() => {
        const month = today.getMonth();
        if (month < 3) return 'Q1';
        if (month < 6) return 'Q2';
        if (month < 9) return 'Q3';
        return 'Q4';
    }, [today]);
    const currentYear = today.getFullYear();

    const currentShift = useMemo(() => {
        return identities?.find((i: any) => i.year === currentYear && i.quarter === currentQuarter);
    }, [identities, currentYear, currentQuarter]);

    if (!currentShift) {
        return (
            <GlassCard onClick={() => { }} glowColor="bg-indigo-500/20" className="items-center justify-center text-center">
                <Compass className="text-gray-700 mb-6 group-hover:text-indigo-500 transition-all duration-500 group-hover:scale-110" size={48} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">No Active Profile</h3>
                <p className="text-xs text-gray-500 font-bold max-w-[180px] leading-relaxed">Forge your identity in the Planning Canvas.</p>
            </GlassCard>
        );
    }

    const outcomes = currentShift.outcomes ? [...currentShift.outcomes].sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 2) : [];
    const totalProgress = currentShift.progress || 0;

    return (
        <GlassCard glowColor="bg-indigo-500/20">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-2">{currentQuarter} Identity</label>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic line-clamp-1 group-hover:text-indigo-100 transition-colors">{currentShift.primary_identity}</h3>
                </div>
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
                    <Zap size={20} className="text-indigo-400 fill-current" />
                </div>
            </div>

            <div className="space-y-6 mt-auto">
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Shift Progression</span>
                        <span className="text-sm font-black text-white italic">{totalProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalProgress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                    {outcomes.map((outcome: any) => (
                        <div key={outcome.id} className="flex items-center gap-3 group/item">
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${outcome.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-indigo-400 opacity-40 group-hover/item:opacity-100'}`} />
                            <span className={`text-[11px] font-black uppercase tracking-tight truncate flex-1 transition-colors ${outcome.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-400 group-hover/item:text-white'}`}>{outcome.title}</span>
                        </div>
                    ))}
                    {outcomes.length === 0 && (
                        <p className="text-[10px] text-gray-600 italic font-bold">No strategic objectives defined.</p>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
