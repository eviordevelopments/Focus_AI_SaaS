import { motion } from 'framer-motion';
import { Rocket, Target, Zap, ChevronRight, BarChart3, Clock } from 'lucide-react';
import GlassCard from '../../ui/GlassCard';

interface MissionsViewProps {
    outcomes: any[];
    projects: any[];
    areaColor: string | undefined;
}

export function MissionsView({ outcomes, projects, areaColor }: MissionsViewProps) {
    return (
        <div className="space-y-12 pb-12">
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Rocket size={20} className="text-emerald-400" />
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Strategic Mission Command</h2>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-white uppercase tracking-tighter max-w-2xl">
                        Quarterly Objectives & Key Results
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center">
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Success Rate</span>
                            <span className="text-lg font-black text-emerald-400">74%</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {outcomes.map((outcome, idx) => {
                    const linkedProjects = projects.filter(p => p.outcome_id === outcome.id);
                    return (
                        <GlassCard key={outcome.id} className="p-10 relative overflow-hidden group border border-white/10 hover:border-emerald-500/30 transition-all duration-500">
                            <div className="flex flex-col lg:flex-row gap-12">
                                {/* Left Side: Outcome Info */}
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                            <Target size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Macro Objective</span>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">{outcome.description}</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-2">Quarter</label>
                                            <span className="text-sm font-black text-white uppercase italic">{outcome.quarter} {outcome.year}</span>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-2">Priority</label>
                                            <span className="text-sm font-black text-amber-500 uppercase italic">Level {idx + 1}</span>
                                        </div>
                                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 hidden lg:block">
                                            <label className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Impact</label>
                                            <span className="text-sm font-black text-white uppercase italic">High Velocity</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Linked Projects */}
                                <div className="w-full lg:w-96 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center justify-between">
                                        Tactical Support Projects
                                        <span className="text-gray-800">{linkedProjects.length}</span>
                                    </h4>
                                    <div className="space-y-3">
                                        {linkedProjects.map(p => (
                                            <div key={p.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group/project hover:bg-white/5 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-xs font-black text-white uppercase tracking-tight">{p.name}</span>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-700 group-hover/project:text-white transition-colors" />
                                            </div>
                                        ))}
                                        {linkedProjects.length === 0 && (
                                            <div className="p-8 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                                                <Rocket size={24} className="mb-2" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">No Projects Allocated</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}

                {outcomes.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <Target size={48} className="mb-6" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Strategic Horizon Empty</span>
                    </div>
                )}
            </div>
        </div>
    );
}
