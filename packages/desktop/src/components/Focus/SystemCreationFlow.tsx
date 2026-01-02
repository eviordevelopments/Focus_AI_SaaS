import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Target, Clock, Calendar as CalendarIcon,
    X, CheckCircle2
} from 'lucide-react';
import { useCreateSystemMutation, Area } from '../../features/api/apiSlice';

interface SystemCreationFlowProps {
    onClose: () => void;
    lifeAreaId: string;
    areas: Area[];
}

export function SystemCreationFlow({ onClose, lifeAreaId, areas }: SystemCreationFlowProps) {
    const [createSystem] = useCreateSystemMutation();
    const area = areas.find(a => a.id === lifeAreaId);

    const [form, setForm] = useState({
        name: '',
        life_area_id: lifeAreaId,
        description: '',
        cue: '',
        routine_hard: '',
        routine_easy: '',
        reward: '',
        difficulty: 'medium',
        duration_minutes: 30,
        supports_identity: '',
        scheduled_days: ['Mon', 'Wed', 'Fri']
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const toggleDay = (day: string) => {
        setForm(prev => ({
            ...prev,
            scheduled_days: prev.scheduled_days.includes(day)
                ? prev.scheduled_days.filter(d => d !== day)
                : [...prev.scheduled_days, day]
        }));
    };

    const handleSubmit = async () => {
        try {
            await createSystem({
                ...form,
                scheduled_days: form.scheduled_days
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
                className="relative w-full max-w-2xl glass-panel p-10 rounded-[3.5rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl text-yellow-400 mb-2">
                                <Zap size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Initialize System</h2>
                            <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center gap-2">
                                <Target size={12} className="text-indigo-500" />
                                Forging in {area?.name || 'Unknown Area'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <section className="space-y-4">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">System Architecture</label>
                            <input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all placeholder:text-gray-800"
                                placeholder="e.g. MORNING VELOCITY"
                            />
                            <div className="flex gap-4">
                                <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest whitespace-nowrap">I am a</span>
                                    <input
                                        type="text"
                                        className="bg-transparent text-white font-bold placeholder-white/10 focus:outline-none flex-1 border-b border-white/10 focus:border-indigo-400 transition-colors text-sm"
                                        placeholder="Writer, Athlete, Sage..."
                                        value={form.supports_identity}
                                        onChange={e => setForm({ ...form, supports_identity: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">The Habit Loop</label>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">1. The Cue</label>
                                    <textarea
                                        value={form.cue}
                                        onChange={e => setForm({ ...form, cue: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all h-20 resize-none"
                                        placeholder="When/Where? (e.g. 6:30 AM + Black Coffee)"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-rose-400 uppercase font-black tracking-widest">2a. Routine (Hard)</label>
                                        <textarea
                                            value={form.routine_hard}
                                            onChange={e => setForm({ ...form, routine_hard: e.target.value })}
                                            className="w-full bg-rose-500/5 border border-rose-500/10 rounded-2xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-rose-500/50 outline-none transition-all h-24 resize-none"
                                            placeholder="The full version..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">2b. Routine (Easy)</label>
                                        <textarea
                                            value={form.routine_easy}
                                            onChange={e => setForm({ ...form, routine_easy: e.target.value })}
                                            className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all h-24 resize-none"
                                            placeholder="The absolute minimum..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-amber-500 uppercase font-black tracking-widest">3. The Reward</label>
                                    <input
                                        value={form.reward}
                                        onChange={e => setForm({ ...form, reward: e.target.value })}
                                        className="w-full bg-amber-500/5 border border-amber-500/10 rounded-2xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                                        placeholder="Immediate celebration..."
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-2 gap-6 items-end">
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                    <CalendarIcon size={12} className="text-indigo-500" />
                                    Frequency
                                </label>
                                <div className="flex justify-between gap-1">
                                    {days.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${form.scheduled_days.includes(day)
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                                }`}
                                        >
                                            {day[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                    <Clock size={12} className="text-indigo-500" />
                                    Investment: {form.duration_minutes}m
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="180"
                                    step="5"
                                    value={form.duration_minutes}
                                    onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                                    className="w-full bg-white/10 rounded-full h-1 appearance-none accent-indigo-500"
                                />
                            </div>
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
                            disabled={!form.name}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl shadow-amber-900/40 disabled:opacity-30 transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
                        >
                            Initialize System
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
