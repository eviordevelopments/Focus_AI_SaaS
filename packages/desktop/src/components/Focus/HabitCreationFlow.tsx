import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Target,
    Zap, Clock, Layers, Sparkles, Hash,
    CheckCircle2, Quote, Calendar as CalendarIcon
} from 'lucide-react';
import { useCreateHabitMutation, useUpdateHabitMutation, useGetSystemsQuery, useGetProjectsQuery } from '../../features/api/apiSlice';

interface HabitCreationFlowProps {
    onClose: () => void;
    systemId?: string;
    editingId?: string;
    initialData?: any;
}

export function HabitCreationFlow({ onClose, systemId, editingId, initialData }: HabitCreationFlowProps) {
    const [step, setStep] = useState(1);
    const [createHabit] = useCreateHabitMutation();
    const [updateHabit] = useUpdateHabitMutation(); // Need to add to apiSlice
    const { data: systems = [] } = useGetSystemsQuery();

    const [form, setForm] = useState({
        name: initialData?.name || '',
        identity_statement: initialData?.identity_statement || '',
        area_id: initialData?.area_id || '',
        system_id: initialData?.system_id || systemId || '',
        project_id: initialData?.project_id || '',
        days_of_week: initialData?.days_of_week ? (typeof initialData.days_of_week === 'string' ? JSON.parse(initialData.days_of_week) : initialData.days_of_week) : [0, 1, 2, 3, 4, 5, 6],
        base_xp: initialData?.base_xp || 15,
        estimated_duration_minutes: initialData?.estimated_duration_minutes || 10,
        color_hex: initialData?.color_hex || '#6366f1',
        icon_key: initialData?.icon_key || 'zap',
        trigger: initialData?.trigger || '',
        action: initialData?.action || '',
        reward: initialData?.reward || '',
        start_time: initialData?.start_time || '',
        end_time: initialData?.end_time || ''
    });

    // Find the system to get its life_area_id
    const currentSystemId = systemId || form.system_id;
    const selectedSystem = systems.find((s: any) => s.id === currentSystemId);
    const lifeAreaId = selectedSystem?.life_area_id;

    const { data: projects = [] } = useGetProjectsQuery({ lifeAreaId }, { skip: !lifeAreaId });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await updateHabit({
                    id: editingId,
                    updates: {
                        ...form,
                        habit_type: 'habit',
                        is_active: true
                    }
                }).unwrap();
            } else {
                await createHabit({
                    ...form,
                    habit_type: 'habit',
                    is_active: true
                }).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Failed to create/update habit:', err);
        }
    };

    const toggleDay = (day: number) => {
        setForm(f => ({
            ...f,
            days_of_week: f.days_of_week.includes(day)
                ? f.days_of_week.filter(d => d !== day)
                : [...f.days_of_week, day]
        }));
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                className="relative w-full max-w-2xl glass-panel p-10 rounded-[3.5rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-10 pt-8">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5'
                                }`}
                        />
                    ))}
                </div>

                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-2">
                                        <Sparkles size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{editingId ? 'Refine Protocol' : 'Forge New Identity'}</h2>
                                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Step 1: The Philosophical Foundation</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <Quote size={12} className="text-indigo-500" />
                                            Identity Statement
                                        </label>
                                        <textarea
                                            value={form.identity_statement}
                                            onChange={e => setForm({ ...form, identity_statement: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-700 min-h-[100px] resize-none italic"
                                            placeholder="I am the type of person who never misses a sunrise rehearsal..."
                                        />
                                    </div>

                                    {!systemId && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                                <Layers size={12} className="text-indigo-500" />
                                                Assigned System
                                            </label>
                                            <select
                                                value={form.system_id}
                                                onChange={e => setForm({ ...form, system_id: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                                            >
                                                <option value="" disabled>Select a Core System</option>
                                                {systems.map((s: any) => (
                                                    <option key={s.id} value={s.id} className="bg-[#1a1a1c]">{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <Hash size={12} className="text-indigo-500" />
                                            Protocol Name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-800"
                                            placeholder="e.g. CORE: DEEP READING"
                                        />
                                    </div>

                                    {lifeAreaId && projects.length > 0 && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                                <Target size={12} className="text-emerald-500" />
                                                Linked Project (Optional)
                                            </label>
                                            <select
                                                value={form.project_id}
                                                onChange={e => setForm({ ...form, project_id: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none"
                                            >
                                                <option value="">Standalone Protocol</option>
                                                {projects.map((p: any) => (
                                                    <option key={p.id} value={p.id} className="bg-[#1a1a1c]">{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={!form.name || !form.identity_statement || (!systemId && !form.system_id)}
                                    className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-white/5 disabled:opacity-30 disabled:grayscale transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    Proceed to Architecture
                                    <ChevronRight size={16} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-2">
                                        <Target size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Behavior Design</h2>
                                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Step 2: Atomic Mechanics</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="glass-panel p-6 border border-white/5 bg-white/5 rounded-3xl space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">1</div>
                                            <div className="flex-1">
                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2 block">THE CUE (TRIGGER)</label>
                                                <input
                                                    value={form.trigger}
                                                    onChange={e => setForm({ ...form, trigger: e.target.value })}
                                                    className="w-full bg-transparent border-b border-white/10 py-1 text-white font-medium focus:border-emerald-500 outline-none transition-all"
                                                    placeholder="After I [current habit]..."
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">2</div>
                                            <div className="flex-1">
                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2 block">THE RESPONSE (ACTION)</label>
                                                <input
                                                    value={form.action}
                                                    onChange={e => setForm({ ...form, action: e.target.value })}
                                                    className="w-full bg-transparent border-b border-white/10 py-1 text-white font-medium focus:border-emerald-500 outline-none transition-all"
                                                    placeholder="I will [new habit]..."
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">3</div>
                                            <div className="flex-1">
                                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2 block">THE REWARD (SATISFACTION)</label>
                                                <input
                                                    value={form.reward}
                                                    onChange={e => setForm({ ...form, reward: e.target.value })}
                                                    className="w-full bg-transparent border-b border-white/10 py-1 text-white font-medium focus:border-emerald-500 outline-none transition-all"
                                                    placeholder="Celebrate with [simple reward]..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleBack}
                                        className="px-8 bg-white/5 text-gray-400 font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-white/10 transition-all text-xs"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 bg-emerald-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-emerald-900/40 transition-all text-xs flex items-center justify-center gap-2"
                                    >
                                        Finalize Parameters
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-2">
                                        <Layers size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Protocol Sync</h2>
                                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Step 3: Logistics & Gamification</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3 col-span-2">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Days</label>
                                        <div className="flex justify-between gap-1">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => toggleDay(i)}
                                                    className={`flex-1 aspect-square rounded-xl font-black text-xs transition-all ${form.days_of_week.includes(i)
                                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                        : 'bg-white/5 text-gray-600 border border-white/5 hover:border-white/10'
                                                        }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <CalendarIcon size={12} className="text-indigo-500" />
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={form.start_time}
                                            onChange={e => setForm({ ...form, start_time: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all [color-scheme:dark]"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <CalendarIcon size={12} className="text-indigo-500" />
                                            End Time (Optional)
                                        </label>
                                        <input
                                            type="time"
                                            value={form.end_time}
                                            onChange={e => setForm({ ...form, end_time: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all [color-scheme:dark]"
                                        />
                                    </div>


                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <Zap size={12} className="text-amber-500" />
                                            XP Payload
                                        </label>
                                        <select
                                            value={form.base_xp}
                                            onChange={e => setForm({ ...form, base_xp: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all appearance-none"
                                        >
                                            <option value={10}>10 XP (Easy)</option>
                                            <option value={25}>25 XP (Medium)</option>
                                            <option value={50}>50 XP (Hard)</option>
                                            <option value={100}>100 XP (Epic)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <Clock size={12} className="text-cyan-500" />
                                            Duration ({form.estimated_duration_minutes}m)
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="120"
                                            step="5"
                                            value={form.estimated_duration_minutes}
                                            onChange={e => setForm({ ...form, estimated_duration_minutes: parseInt(e.target.value) })}
                                            className="w-full bg-white/10 rounded-full h-1 appearance-none accent-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleBack}
                                        className="px-8 bg-white/5 text-gray-400 font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-white/10 transition-all text-xs"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-900/40 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                                    >
                                        {editingId ? 'Update Protocol' : 'Initialize Protocol'}
                                        <CheckCircle2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
