import React, { useState, useEffect } from 'react';
import { useGetAreasQuery, useCreateSystemMutation, useUpdateSystemMutation, useGetGamifiedIdentitiesQuery, useCreateHabitMutation } from '../../features/api/apiSlice';
import { Zap, Target, Save, Clock, Calendar as CalendarIcon, Info, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemCanvasProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialLifeAreaId?: string;
    existingSystem?: any;
}

export function SystemCanvas({ onSuccess, onCancel, initialLifeAreaId, existingSystem }: SystemCanvasProps) {
    const { data: areas } = useGetAreasQuery();
    const { data: identities } = useGetGamifiedIdentitiesQuery();
    const [createSystem, { isLoading: isCreating }] = useCreateSystemMutation();
    const [updateSystem, { isLoading: isUpdating }] = useUpdateSystemMutation();
    const [createHabit] = useCreateHabitMutation();

    const isLoading = isCreating || isUpdating;
    const isEditMode = !!existingSystem;

    const [form, setForm] = useState({
        name: '',
        life_area_id: initialLifeAreaId || '',
        identity_id: '',
        description: '',
        cue: '',
        routine_hard: '',
        routine_easy: '',
        reward: '',
        difficulty: 'medium',
        duration_minutes: 30,
        supports_identity: '',
        scheduled_days: ['Mon', 'Wed', 'Fri'],
        start_time: '',
        end_time: '',
        link: '',
        location: '',
        focus_session: false
    });

    // Habits that belong to this system
    const [habits, setHabits] = useState<Array<{
        name: string;
        description: string;
        base_xp: number;
        start_time: string;
        end_time: string;
    }>>([]);

    const addHabit = () => {
        setHabits([...habits, {
            name: '',
            description: '',
            base_xp: 25,
            start_time: form.start_time || '',
            end_time: form.end_time || ''
        }]);
    };

    const removeHabit = (index: number) => {
        setHabits(habits.filter((_, i) => i !== index));
    };

    const updateHabit = (index: number, field: string, value: any) => {
        const updated = [...habits];
        updated[index] = { ...updated[index], [field]: value };
        setHabits(updated);
    };

    // Populate form if editing existing system
    useEffect(() => {
        if (existingSystem) {
            setForm({
                name: existingSystem.name || '',
                life_area_id: existingSystem.life_area_id || '',
                identity_id: existingSystem.identity_id || '',
                description: existingSystem.description || '',
                cue: existingSystem.cue || '',
                routine_hard: existingSystem.routine_hard || '',
                routine_easy: existingSystem.routine_easy || '',
                reward: existingSystem.reward || '',
                difficulty: existingSystem.difficulty || 'medium',
                duration_minutes: existingSystem.duration_minutes || 30,
                supports_identity: existingSystem.supports_identity || '',
                scheduled_days: existingSystem.scheduled_days
                    ? (typeof existingSystem.scheduled_days === 'string'
                        ? JSON.parse(existingSystem.scheduled_days)
                        : existingSystem.scheduled_days)
                    : ['Mon', 'Wed', 'Fri'],
                start_time: existingSystem.start_time || '',
                end_time: existingSystem.end_time || '',
                link: existingSystem.link || '',
                location: existingSystem.location || '',
                focus_session: existingSystem.focus_session || false
            });
        }
    }, [existingSystem]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const toggleDay = (day: string) => {
        setForm(prev => ({
            ...prev,
            scheduled_days: prev.scheduled_days.includes(day)
                ? prev.scheduled_days.filter(d => d !== day)
                : [...prev.scheduled_days, day]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Prepare payload
            const payload = {
                ...form,
                scheduled_days: form.scheduled_days,
                // Ensure if identity_id is set, supports_identity takes the name if empty
                supports_identity: form.supports_identity || identities?.find(i => i.id === form.identity_id)?.name || '',
                // Sanitize optional fields to null if empty
                start_time: form.start_time || null,
                end_time: form.end_time || null,
                link: form.link || null,
                location: form.location || null
            };

            let systemId: string;

            if (isEditMode && existingSystem) {
                // Update existing system
                await updateSystem({
                    id: existingSystem.id,
                    updates: payload
                }).unwrap();
                systemId = existingSystem.id;
            } else {
                // Create new system
                const createdSystem = await createSystem(payload).unwrap();
                systemId = createdSystem.id;

                // Create all habits for this system
                const daysMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
                const numericDays = form.scheduled_days.map((d: string) => daysMap[d] ?? -1).filter((d: number) => d !== -1);

                for (const habit of habits) {
                    if (habit.name) { // Only create if habit has a name
                        await createHabit({
                            system_id: systemId,
                            name: habit.name,
                            description: habit.description,
                            days_of_week: numericDays,
                            frequency: 'daily',
                            habit_type: 'habit',
                            is_active: true,
                            base_xp: habit.base_xp,
                            start_time: habit.start_time || null,
                            end_time: habit.end_time || null
                        }).unwrap();
                    }
                }
            }

            if (onSuccess) {
                onSuccess();
            } else {
                alert(isEditMode ? 'System Updated Successfully!' : 'System Created Successfully!');
                if (!isEditMode) {
                    // Reset form only for create mode
                    setForm({
                        name: '',
                        life_area_id: '',
                        identity_id: '',
                        description: '',
                        cue: '',
                        routine_hard: '',
                        routine_easy: '',
                        reward: '',
                        difficulty: 'medium',
                        duration_minutes: 30,
                        supports_identity: '',
                        scheduled_days: ['Mon', 'Wed', 'Fri'],
                        start_time: '',
                        end_time: '',
                        link: '',
                        location: '',
                        focus_session: false
                    });
                    setHabits([]);
                }
            }
        } catch (err) {
            console.error('Failed to save system:', err);
            alert('Failed to save system. Please check your inputs.');
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/20 p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 relative my-8">
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute top-8 right-8 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            )}

            <header className="mb-8">
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    <Zap className="text-yellow-400 fill-yellow-400" />
                    {isEditMode ? 'Edit System' : 'System Canvas'}
                </h1>
                <p className="text-gray-400 mt-2">
                    {isEditMode ? 'Update your system configuration.' : 'Design your repeatable daily processes. Systems > Goals.'}
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Core Identity & Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="glass-panel p-6 rounded-3xl border border-white/10">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">Supporting Identity</label>
                        <div className="space-y-4">
                            <select
                                className="w-full bg-white/5 text-white p-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                value={form.identity_id}
                                onChange={e => setForm({ ...form, identity_id: e.target.value })}
                            >
                                <option value="" disabled>Select Core Identity</option>
                                {identities?.map(id => (
                                    <option key={id.id} value={id.id}>{id.name}</option>
                                ))}
                            </select>

                            {!form.identity_id && (
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/50 transition-all">
                                    <span className="text-indigo-400 font-bold">I am a</span>
                                    <input
                                        type="text"
                                        className="bg-transparent text-white font-bold placeholder-white/20 focus:outline-none flex-1 border-b border-white/10 focus:border-indigo-400 transition-colors"
                                        placeholder="e.g. Writer, Athlete, Learner"
                                        value={form.supports_identity}
                                        onChange={e => setForm({ ...form, supports_identity: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-3 italic flex items-center gap-1">
                            <Info size={12} />
                            Every completion is a vote for your identity.
                        </p>
                    </section>

                    <section className="glass-panel p-6 rounded-3xl border border-white/10">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">System Details</label>
                        <div className="space-y-4">
                            <input
                                type="text"
                                className="w-full bg-white/5 text-white p-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                placeholder="System Name (e.g. Morning Deep Work)"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                            <select
                                className="w-full bg-white/5 text-white p-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                value={form.life_area_id}
                                onChange={e => setForm({ ...form, life_area_id: e.target.value })}
                            >
                                <option value="" disabled>Select Life Area</option>
                                {areas?.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                        </div>
                    </section>
                </div>

                {/* The Habit Loop */}
                <section className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Target size={120} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-6">Habit Loop Design</h3>

                        <div className="space-y-6">
                            {/* Cue */}
                            <div className="group">
                                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">1. The Cue (The Trigger)</label>
                                <textarea
                                    className="w-full bg-white/5 text-gray-300 p-4 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-20"
                                    placeholder="When/Where will this happen? (e.g. 6:30am + coffee + desk)"
                                    value={form.cue}
                                    onChange={e => setForm({ ...form, cue: e.target.value })}
                                />
                            </div>

                            {/* Routine */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2 block">2a. Routine (Hard Day)</label>
                                    <textarea
                                        className="w-full bg-rose-500/5 text-gray-300 p-4 rounded-2xl border border-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none h-24 text-sm"
                                        placeholder="Full version for high energy days..."
                                        value={form.routine_hard}
                                        onChange={e => setForm({ ...form, routine_hard: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 block">2b. Routine (Easy Day)</label>
                                    <textarea
                                        className="w-full bg-emerald-500/5 text-gray-300 p-4 rounded-2xl border border-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-24 text-sm"
                                        placeholder="Minimal version to maintain consistency when sick/tired..."
                                        value={form.routine_easy}
                                        onChange={e => setForm({ ...form, routine_easy: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Reward */}
                            <div>
                                <label className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 block">3. The Reward (Immediate Celebration)</label>
                                <input
                                    type="text"
                                    className="w-full bg-amber-500/5 text-gray-300 p-4 rounded-2xl border border-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    placeholder="How will you celebrate immediately? (e.g. Log in app + coffee)"
                                    value={form.reward}
                                    onChange={e => setForm({ ...form, reward: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Schedule & Intensity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="glass-panel p-6 rounded-3xl border border-white/10">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 block flex items-center gap-2">
                            <CalendarIcon size={14} /> Schedule
                        </label>
                        <div className="flex justify-between">
                            {days.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${form.scheduled_days.includes(day)
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                        }`}
                                >
                                    {day[0]}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock size={16} />
                                <span className="text-xs font-bold uppercase">Duration</span>
                            </div>
                            <span className="text-white font-bold">{form.duration_minutes}m</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="240"
                            step="5"
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            value={form.duration_minutes}
                            onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                        />
                    </section>
                </div>

                {/* Time Schedule & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="glass-panel p-6 rounded-3xl border border-white/10">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block flex items-center gap-2">
                            <Clock size={14} /> Time Schedule
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2 block">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-white/5 text-white p-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark]"
                                    value={form.start_time}
                                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2 block">End Time</label>
                                <input
                                    type="time"
                                    className="w-full bg-white/5 text-white p-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark]"
                                    value={form.end_time}
                                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="glass-panel p-6 rounded-3xl border border-white/10">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">Location</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 text-white p-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. Home Office, Gym, Library"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                        />
                    </section>
                </div>

                {/* Link & Focus Session */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="glass-panel p-6 rounded-3xl border border-white/10">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">Related Link</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 text-white p-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="https://..."
                            value={form.link}
                            onChange={e => setForm({ ...form, link: e.target.value })}
                        />
                        <p className="text-[9px] text-gray-600 mt-2 italic">Optional: Add a link to resources, docs, or tools</p>
                    </section>

                    <section className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Focus Session</label>
                            <p className="text-[9px] text-gray-600">Enable deep work timer</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, focus_session: !form.focus_session })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${form.focus_session ? 'bg-indigo-500' : 'bg-white/10'
                                }`}
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${form.focus_session ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                        </button>
                    </section>
                </div>

                {/* Habits Section */}
                <section className="glass-panel p-8 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">System Habits</h3>
                            <p className="text-xs text-gray-500">Define the specific habits that make up this system</p>
                        </div>
                        <button
                            type="button"
                            onClick={addHabit}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                        >
                            <Plus size={16} />
                            Add Habit
                        </button>
                    </div>

                    {habits.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                            <p className="text-gray-500 text-sm mb-4">No habits added yet</p>
                            <p className="text-xs text-gray-600">Click "Add Habit" to define the habits within this system</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {habits.map((habit, index) => (
                                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Habit #{index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeHabit(index)}
                                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2 block">Habit Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                                placeholder="e.g. Morning Meditation"
                                                value={habit.name}
                                                onChange={e => updateHabit(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2 block">XP Reward</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                                value={habit.base_xp}
                                                onChange={e => updateHabit(index, 'base_xp', parseInt(e.target.value))}
                                                min="5"
                                                max="100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2 block">Description</label>
                                        <textarea
                                            className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-none h-20"
                                            placeholder="Describe this habit..."
                                            value={habit.description}
                                            onChange={e => updateHabit(index, 'description', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2 block">Start Time</label>
                                            <input
                                                type="time"
                                                className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark] text-sm"
                                                value={habit.start_time}
                                                onChange={e => updateHabit(index, 'start_time', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mb-2 block">End Time</label>
                                            <input
                                                type="time"
                                                className="w-full bg-white/5 text-white p-3 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark] text-sm"
                                                value={habit.end_time}
                                                onChange={e => updateHabit(index, 'end_time', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save size={20} />
                        {isEditMode ? 'Update System' : 'Save System Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
}
