import { motion } from 'framer-motion';
import { Target, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import GlassCard from '../../ui/GlassCard';

interface IdentityViewProps {
    shifts: any[];
    areaColor: string | undefined;
}

export function IdentityView({ shifts, areaColor }: IdentityViewProps) {
    return (
        <div className="space-y-12 pb-12">
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-indigo-400" />
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Identity Evolution Protocol</h2>
                </div>
                <p className="text-2xl font-black text-white uppercase italic tracking-tighter max-w-2xl">
                    "Every action you take is a vote for the type of person you wish to become."
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {shifts.map((shift, idx) => (
                    <GlassCard key={shift.id} className="p-10 relative overflow-hidden group">
                        <div
                            className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20"
                            style={{ backgroundColor: areaColor || '#6366f1' }}
                        />

                        <div className="space-y-8 relative z-10">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                    {shift.quarter} {shift.year}
                                </span>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <Target size={20} className="text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Primary Transformation</label>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
                                    {shift.primary_identity}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest block">Baseline</label>
                                    <div className="text-sm font-bold text-gray-500 italic">"{shift.status_quo || 'Starting transition...'}"</div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-indigo-500/50 uppercase tracking-widest block font-serif italic">The Shift</label>
                                    <div className="text-sm font-bold text-indigo-400 italic">"{shift.target_identity || 'Ascending...'}"</div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Shift</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap size={12} className="text-amber-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">Lvl {idx + 1} Awareness</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {shifts.length === 0 && (
                    <div className="col-span-2 py-32 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <Sparkles size={48} className="mb-6" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Evolution Data Logs Found</span>
                    </div>
                )}
            </div>
        </div>
    );
}
