import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, CheckCircle2, Link as LinkIcon,
    FileText, Globe, Tag, Layers
} from 'lucide-react';
import { useCreateResourceMutation } from '../../../features/api/apiSlice';

interface ResourceUploadModalProps {
    onClose: () => void;
    lifeAreaId: string;
    projects: any[];
}

export function ResourceUploadModal({ onClose, lifeAreaId, projects }: ResourceUploadModalProps) {
    const [createResource] = useCreateResourceMutation();

    const [form, setForm] = useState({
        name: '',
        file_url: '',
        file_type: 'link',
        life_area_id: lifeAreaId,
        project_id: '',
        metadata: {
            source: '',
            notes: ''
        }
    });

    const handleSubmit = async () => {
        try {
            await createResource({
                ...form,
                metadata: form.metadata
            }).unwrap();
            onClose();
        } catch (err) {
            console.error('Failed to create resource:', err);
        }
    };

    const types = [
        { id: 'link', label: 'External Link', icon: LinkIcon, color: 'text-blue-400' },
        { id: 'pdf', label: 'PDF Document', icon: FileText, color: 'text-rose-400' },
        { id: 'doc', label: 'Knowledge Base', icon: Globe, color: 'text-emerald-400' },
    ];

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 backdrop-blur-md bg-black/40"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-xl glass-panel p-10 rounded-[3.5rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden"
            >
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-2">
                                <LinkIcon size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Resource Sync</h2>
                            <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center gap-2">
                                <Tag size={12} className="text-emerald-500" />
                                Expanding the Vault
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Resource Identity</label>
                            <input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-800"
                                placeholder="e.g. Q1 GROWTH STRATEGY"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Resource Type</label>
                                <div className="flex gap-2">
                                    {types.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setForm({ ...form, file_type: t.id })}
                                            className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${form.file_type === t.id
                                                ? 'bg-white/10 border-white/20 scale-105'
                                                : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'
                                                }`}
                                        >
                                            <t.icon size={16} className={t.color} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter text-white">{t.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                    <Layers size={12} className="text-indigo-400" />
                                    Link Project
                                </label>
                                <select
                                    value={form.project_id}
                                    onChange={e => setForm({ ...form, project_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none text-xs"
                                >
                                    <option value="">General Area Resource</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id} className="bg-[#1a1a1c]">{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">URL / Reference</label>
                            <input
                                value={form.file_url}
                                onChange={e => setForm({ ...form, file_url: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium text-xs focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-700"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest uppercase">Metadata Observations</label>
                            <textarea
                                value={form.metadata.notes}
                                onChange={e => setForm({ ...form, metadata: { ...form.metadata, notes: e.target.value } })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all h-24 resize-none italic"
                                placeholder="Why is this resource critical for the mission?"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="px-8 bg-white/5 text-gray-400 font-black uppercase tracking-widest py-5 rounded-3xl hover:bg-white/10 transition-all text-xs"
                        >
                            Abort
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!form.name || !form.file_url}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl shadow-emerald-900/40 disabled:opacity-30 transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
                        >
                            Register Resource
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
