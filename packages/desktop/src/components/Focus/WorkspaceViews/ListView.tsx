import { motion } from 'framer-motion';
import {
    Layers, Hash, Target, Plus,
    ChevronRight, MoreVertical
} from 'lucide-react';

interface ListViewProps {
    systems: any[];
    habits: any[];
    projects: any[];
    onAddSystem?: () => void;
    onAddProject?: () => void;
    onAddHabit?: () => void;
    onItemClick?: (type: 'system' | 'project' | 'habit' | 'task', item: any) => void;
}

export function ListView({ systems, habits, projects, onAddSystem, onAddProject, onAddHabit, onItemClick }: ListViewProps) {
    return (
        <div className="space-y-12 pb-12">
            {/* Core Systems Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-indigo-500" />
                        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Systems Intelligence ({systems.length})</h2>
                    </div>
                    <button
                        onClick={onAddSystem}
                        className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 bg-white/5 px-4 py-2 rounded-full"
                    >
                        <Plus size={12} /> Add System
                    </button>
                </div>
                <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="border-b border-white/5 bg-white/[0.02]">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Identity Support</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {systems.map((sys, idx) => (
                                <motion.tr
                                    key={sys.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-white/[0.03] last:border-0"
                                    onClick={() => onItemClick?.('system', sys)}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                            <span className="font-bold text-white text-sm">{sys.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs text-gray-400 italic">{sys.supports_identity || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                                            Active System
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Active Projects Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Target size={14} className="text-emerald-500" />
                        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Missions in Orbit ({projects.length})</h2>
                    </div>
                    <button
                        onClick={onAddProject}
                        className="text-[10px] font-black text-emerald-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 bg-white/5 px-4 py-2 rounded-full"
                    >
                        <Plus size={12} /> New Mission
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {projects.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative h-20 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all flex items-center px-8 cursor-pointer overflow-hidden"
                            onClick={() => onItemClick?.('project', p)}
                        >
                            <div className="flex-1 flex items-center gap-6">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Target size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{p.name}</h4>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{p.status}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="w-48 space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Efficiency</span>
                                        <span className="text-[10px] font-black text-white italic">{Math.round(p.progress * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${p.progress * 100}%` }}
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        />
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-700 group-hover:text-white transition-colors" size={20} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Habit Tokens Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Hash size={14} className="text-cyan-400" />
                        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Micro-Habit Units ({habits.length})</h2>
                    </div>
                    <button
                        onClick={onAddHabit}
                        className="text-[10px] font-black text-cyan-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 bg-white/5 px-4 py-2 rounded-full"
                    >
                        <Plus size={12} /> Forge Habit
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-1">
                    {habits.map((h, idx) => (
                        <motion.div
                            key={h.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-white/5 border border-white/5 px-6 py-5 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer group"
                            onClick={() => onItemClick?.('habit', h)}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-[10px] font-black">
                                    +{h.base_xp}
                                </div>
                                <MoreVertical size={14} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h5 className="text-[13px] font-black text-white tracking-tight line-clamp-2 leading-snug">{h.name}</h5>
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-4 italic">{h.frequency || 'Daily'}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
