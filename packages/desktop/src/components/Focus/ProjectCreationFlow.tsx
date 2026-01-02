import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Target, Calendar, X, Rocket,
    CheckCircle2, Layers, Activity
} from 'lucide-react';
import { useCreateProjectMutation, Area } from '../../features/api/apiSlice';

interface ProjectCreationFlowProps {
    onClose: () => void;
    lifeAreaId: string;
    areas: Area[];
}

export function ProjectCreationFlow({ onClose, lifeAreaId, areas }: ProjectCreationFlowProps) {
    const [createProject] = useCreateProjectMutation();
    const area = areas.find(a => a.id === lifeAreaId);

    const [form, setForm] = useState({
        name: '',
        life_area_id: lifeAreaId,
        status: 'active',
        deadline: '',
        progress: 0
    });

    const handleSubmit = async () => {
        try {
            await createProject({
                ...form,
                deadline: form.deadline ? new Date(form.deadline).toISOString() : null
            }).unwrap();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 backdrop-blur-sm bg-black/20"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl glass-panel p-10 rounded-[3.5rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden"
            >
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-2">
                                <Rocket size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Launch Project</h2>
                            <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center gap-2">
                                <Layers size={12} className="text-emerald-500" />
                                Assigned to {area?.name || 'Unknown Area'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" />
                                Project Objective
                            </label>
                            <input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-800"
                                placeholder="e.g. Q1 REVENUE MILESTONE"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                <Calendar size={12} className="text-emerald-500" />
                                Target Deadline
                            </label>
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={e => setForm({ ...form, deadline: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all [color-scheme:dark]"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Initial Status</label>
                            <div className="flex gap-2">
                                {['planning', 'active'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setForm({ ...form, status: s })}
                                        className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${form.status === s
                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                            : 'bg-white/5 border-white/5 text-gray-600 hover:bg-white/10'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="px-8 bg-white/5 text-gray-400 font-black uppercase tracking-widest py-5 rounded-3xl hover:bg-white/10 transition-all text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!form.name}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl shadow-emerald-900/40 disabled:opacity-30 transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
                        >
                            Launch Project
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
