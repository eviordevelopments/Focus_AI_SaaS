import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    Sparkles, Target, Palette, Hash,
    CheckCircle2
} from 'lucide-react';
import { useCreateAreaMutation, useUpdateAreaMutation, useDeleteAreaMutation, Area } from '../../features/api/apiSlice';
import { Trash2 } from 'lucide-react';

interface AreaCreationFlowProps {
    onClose: () => void;
    editingArea?: Area;
}

export function AreaCreationFlow({ onClose, editingArea }: AreaCreationFlowProps) {
    const [createArea] = useCreateAreaMutation();
    const [updateArea] = useUpdateAreaMutation();
    const [deleteArea] = useDeleteAreaMutation();

    const [form, setForm] = useState({
        name: editingArea?.name || '',
        color_hex: editingArea?.color_hex || '#6366f1',
        icon_key: editingArea?.icon_key || 'target',
        identity_statement: editingArea?.identity_statement || '',
        importance_rating: editingArea?.importance_rating || 5
    });

    const COLORS = [
        '#6366f1', '#ef4444', '#10b981', '#f59e0b',
        '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'
    ];

    const handleSubmit = async () => {
        try {
            if (editingArea) {
                await updateArea({ id: editingArea.id, updates: form }).unwrap();
            } else {
                await createArea(form).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Failed to save area:', err);
        }
    };

    const handleDelete = async () => {
        if (!editingArea) return;
        if (window.confirm('Are you sure you want to permanently decommission this life sector? All linked systems will remain but become unanchored.')) {
            await deleteArea(editingArea.id).unwrap();
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 backdrop-blur-sm bg-black/20"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-xl glass-panel p-10 rounded-[3.5rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden"
            >
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-2">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{editingArea ? 'Optimize Sector' : 'Forge New Life Area'}</h2>
                        <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase">{editingArea ? 'System Parameter Refinement' : 'Core Dimension Initialization'}</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                <Target size={12} className="text-indigo-500" />
                                Area Name
                            </label>
                            <input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-800"
                                placeholder="e.g. PHYSICAL VITALITY"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                <Hash size={12} className="text-indigo-500" />
                                Identity Statement
                            </label>
                            <textarea
                                value={form.identity_statement}
                                onChange={e => setForm({ ...form, identity_statement: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-700 min-h-[80px] resize-none italic"
                                placeholder="I am the type of person who..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                    <Palette size={12} className="text-indigo-500" />
                                    Energy Color
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setForm({ ...form, color_hex: c })}
                                            className={`w-6 h-6 rounded-full transition-all ${form.color_hex === c ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-[#0c0c0e]' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                    <Sparkles size={12} className="text-indigo-500" />
                                    Priority Rank
                                </label>
                                <select
                                    value={form.importance_rating}
                                    onChange={e => setForm({ ...form, importance_rating: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n} className="bg-[#1a1a1c]">{n} - {n > 7 ? 'Critical' : n > 4 ? 'Meaningful' : 'Base'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {editingArea && (
                            <button
                                onClick={handleDelete}
                                className="px-6 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-3xl transition-all"
                                title="Decommission Area"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-8 bg-white/5 text-gray-400 font-black uppercase tracking-widest py-5 rounded-3xl hover:bg-white/10 transition-all text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!form.name}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl shadow-indigo-900/40 disabled:opacity-30 disabled:grayscale transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
                        >
                            {editingArea ? 'Update Parameters' : 'Forge Area'}
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
