import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Ship, Zap, CheckCircle2 } from 'lucide-react';
import { useCreateQuarterlyIdentityMutation, useGetAreasQuery } from '../../../features/api/apiSlice';
import { OutcomeList } from './OutcomeList';

interface IdentityShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    quarter: string;
    year: number;
    initialData?: any;
    onRefresh: () => void;
}

export function IdentityShiftModal({ isOpen, onClose, quarter, year, initialData, onRefresh }: IdentityShiftModalProps) {
    const [saveIdentity, { isLoading }] = useCreateQuarterlyIdentityMutation();
    const { data: areas = [] } = useGetAreasQuery();

    const [form, setForm] = useState({
        primary_identity: '',
        vision_statement: '',
        life_area_id: ''
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                primary_identity: initialData.primary_identity || '',
                vision_statement: initialData.vision_statement || '',
                life_area_id: initialData.life_area_id || ''
            });
        } else {
            setForm({
                primary_identity: '',
                vision_statement: '',
                life_area_id: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        await saveIdentity({
            quarter,
            year,
            primary_identity: form.primary_identity,
            vision_statement: form.vision_statement,
            life_area_id: form.life_area_id
        });
        onRefresh();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-4xl glass-panel rounded-[40px] border border-white/10 bg-[#0c0c0e]/90 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        {/* Gradient Accents */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]" />

                        <div className="relative z-10 p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Commit to Shift</h2>
                                    <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase mt-2">
                                        Refining {quarter} {year} • The Forge of Self
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-10">
                                    {/* Primary Identity */}
                                    <section className="space-y-4">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                            <Target size={14} /> The Quarter's Identity
                                        </label>
                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-600 font-bold text-lg whitespace-nowrap">I am a</span>
                                                <input
                                                    type="text"
                                                    className="bg-transparent text-white font-black text-2xl placeholder-white/5 focus:outline-none flex-1"
                                                    placeholder="Elite Performer"
                                                    value={form.primary_identity}
                                                    onChange={e => setForm({ ...form, primary_identity: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Life Area Selection */}
                                    <section className="space-y-4">
                                        <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                            <Zap size={14} /> Life Area Dimension
                                        </label>
                                        <select
                                            value={form.life_area_id}
                                            onChange={e => setForm({ ...form, life_area_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-[#0c0c0e]">Select Area Focus</option>
                                            {areas.map(area => (
                                                <option key={area.id} value={area.id} className="bg-[#0c0c0e]">
                                                    {area.name}
                                                </option>
                                            ))}
                                        </select>
                                    </section>

                                    {/* Vision/Objective */}
                                    <section className="space-y-4">
                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                            <Ship size={14} /> The High-Level Objective
                                        </label>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 h-40 resize-none placeholder-white/5 leading-relaxed"
                                            placeholder="What is the singular focus of these 90 days?"
                                            value={form.vision_statement}
                                            onChange={e => setForm({ ...form, vision_statement: e.target.value })}
                                        />
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    {/* Outcomes */}
                                    <div className="glass-panel p-8 rounded-[32px] border border-white/10 h-full">
                                        {initialData ? (
                                            <OutcomeList
                                                identityShiftId={initialData.id}
                                                outcomes={initialData.outcomes || []}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                                                <Zap className="text-gray-800" size={48} />
                                                <p className="text-xs text-gray-500 font-black uppercase tracking-widest max-w-[200px]">
                                                    Initialize identity to define outcomes
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12 pt-8 border-t border-white/5">
                                <button
                                    onClick={onClose}
                                    className="px-10 py-5 bg-white/5 text-gray-400 font-black uppercase tracking-widest rounded-full hover:bg-white/10 transition-all text-xs"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!form.primary_identity || isLoading}
                                    className="flex-1 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center gap-3 disabled:opacity-30"
                                >
                                    {isLoading ? 'Processing Forge...' : (initialData ? 'Update Identity' : 'Commence Shift')}
                                    <CheckCircle2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
