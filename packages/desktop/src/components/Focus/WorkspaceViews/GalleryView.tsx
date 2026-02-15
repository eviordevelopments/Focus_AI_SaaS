import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, Hash, Target, BookOpen,
    StickyNote, Activity, ShieldCheck, Zap, Plus
} from 'lucide-react';
import GlassCard from '../../ui/GlassCard';
import { ResourceUploadModal } from '../Resources/ResourceUploadModal';

interface GalleryViewProps {
    area: any;
    systems: any[];
    habits: any[];
    projects: any[];
    resources: any[];
    notes: any[];
    onItemClick?: (type: 'system' | 'project' | 'habit' | 'task', item: any) => void;
}

export function GalleryView({ area, systems, habits, projects, resources, notes, onItemClick }: GalleryViewProps) {
    const [showUploadModal, setShowUploadModal] = useState(false);

    return (
        <div className="grid grid-cols-12 gap-8 pb-12">
            {/* 1. Core Intelligence Widgets (Top Row) */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
                <GlassCard className="p-8 group relative overflow-hidden h-64 flex flex-col justify-between">
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 pointer-events-none`} style={{ backgroundColor: area.color_hex }} />
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Compliance Index</h3>
                        <p className="text-5xl font-black italic tracking-tighter text-white mt-2">88%</p>
                    </div>
                    <div className="flex gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        <Zap size={12} fill="currentColor" /> Outperforming targets
                    </div>
                </GlassCard>

                <GlassCard className="p-8 h-64">
                    <div className="flex justify-between items-start mb-8">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Active Systems</label>
                        <Layers size={18} className="text-indigo-400" />
                    </div>
                    <div className="space-y-4">
                        {systems.slice(0, 3).map(sys => (
                            <div key={sys.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors" onClick={() => onItemClick?.('system', sys)}>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                <span className="text-sm font-bold text-white truncate">{sys.name}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* 2. Middle Column: Active Projects & Flow */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-8">
                <section className="col-span-2 space-y-4">
                    <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Target size={14} /> Critical Projects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map(project => (
                            <GlassCard key={project.id} className="p-6 hover:bg-white/[0.05] transition-all cursor-pointer" onClick={() => onItemClick?.('project', project)}>
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-black text-white">{project.name}</h4>
                                    <span className="text-[8px] font-black text-white/40 border border-white/10 px-2 py-1 rounded uppercase tracking-widest leading-none">
                                        {project.status}
                                    </span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${project.progress * 100}%` }} />
                                </div>
                            </GlassCard>
                        ))}
                        {projects.length === 0 && (
                            <div className="col-span-2 py-12 flex flex-col items-center justify-center opacity-20 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                                <Target size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest mt-4">No Active Missions</span>
                            </div>
                        )}
                    </div>
                </section>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Habit Stack</label>
                        <Hash size={14} className="text-cyan-400" />
                    </div>
                    <div className="space-y-2">
                        {habits.slice(0, 5).map(habit => (
                            <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onItemClick?.('habit', habit)}>
                                <span className="text-[11px] font-bold text-gray-300">{habit.name}</span>
                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+{habit.base_xp}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Deep Knowledge</label>
                        <StickyNote size={14} className="text-rose-400" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {notes.slice(0, 3).map(note => (
                            <div key={note.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/5 transition-colors cursor-pointer">
                                <span className="text-[11px] font-bold text-gray-400 block truncate">{note.title}</span>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1 block">
                                    {note.tags || 'General'}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* 3. Bottom Row: Resource Library & Files */}
            <div className="col-span-12">
                <GlassCard className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                            <BookOpen size={14} className="text-amber-500" /> Resource Vault
                        </h2>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="text-[10px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest"
                        >
                            Upload File +
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {resources.map(res => (
                            <div key={res.id} className="group p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer text-center">
                                <div className="w-12 h-12 bg-white/5 rounded-xl mx-auto mb-4 flex items-center justify-center text-gray-500 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-all">
                                    <BookOpen size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 block truncate uppercase tracking-tighter">{res.name}</span>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="p-4 bg-white/5 border-2 border-dashed border-white/5 rounded-2xl hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-amber-500/10 transition-colors">
                                <Plus size={16} className="text-gray-600 group-hover:text-amber-500" />
                            </div>
                        </button>
                    </div>
                </GlassCard>
            </div>

            <AnimatePresence>
                {showUploadModal && (
                    <ResourceUploadModal
                        onClose={() => setShowUploadModal(false)}
                        lifeAreaId={area.id}
                        projects={projects}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
