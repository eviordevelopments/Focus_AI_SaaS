import React, { useState } from 'react';
import { useGetQuarterlyIdentitiesQuery, useCreateQuarterlyIdentityMutation } from '../../features/api/apiSlice';
import { Compass, Target, Ship, Anchor, Save, Info, Sparkles, Map } from 'lucide-react';

export function QuarterlyPlanning() {
    const { data: identities } = useGetQuarterlyIdentitiesQuery();
    const [createIdentity, { isLoading }] = useCreateQuarterlyIdentityMutation();

    const [form, setForm] = useState({
        primary_identity: '',
        vision_statement: '',
        ten_year_vision: '',
        goals: ['', '', ''],
        quarter: 'Q1',
        year: 2026
    });

    const handleGoalChange = (index: number, value: string) => {
        const newGoals = [...form.goals];
        newGoals[index] = value;
        setForm({ ...form, goals: newGoals });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createIdentity({
                ...form,
                goals: JSON.stringify(form.goals)
            }).unwrap();
            alert('Quarterly Identity Shift Recorded!');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 animate-in fade-in duration-1000">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    <Compass className="text-cyan-400" />
                    Quarterly Identity Shift
                </h1>
                <p className="text-gray-400 mt-2">Working backwards from your 10-year ideal self.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 10 Year Vision - The Anchor */}
                <section className="glass-panel p-10 rounded-[40px] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Anchor size={120} />
                    </div>
                    <div className="relative z-10">
                        <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                            <Sparkles size={14} /> The 10-Year Vision
                        </label>
                        <h3 className="text-2xl font-bold text-white mb-6">Where are you in 10 years?</h3>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[150px] resize-none"
                            placeholder="Describe your life, health, and status in 10 years. Be vivid."
                            value={form.ten_year_vision}
                            onChange={e => setForm({ ...form, ten_year_vision: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-4 italic flex items-center gap-1">
                            <Info size={12} /> This is your 'North Star' for all quarterly decisions.
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* The Primary Identity */}
                    <section className="glass-panel p-8 rounded-[40px] border border-white/10">
                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                            <Target size={14} /> This Quarter's Identity
                        </label>
                        <h3 className="text-xl font-bold text-white mb-6">Who must you become?</h3>
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                            <span className="text-indigo-400 font-bold whitespace-nowrap">I am a</span>
                            <input
                                type="text"
                                className="bg-transparent text-white font-bold placeholder-white/20 focus:outline-none flex-1 border-b border-white/10 focus:border-indigo-400 transition-colors"
                                placeholder="Elite Developer, Calm Parent, Health-First CEO"
                                value={form.primary_identity}
                                onChange={e => setForm({ ...form, primary_identity: e.target.value })}
                            />
                        </div>
                        <p className="text-sm text-gray-400">
                            Pick an identity that bridges your current self and your 10-year vision.
                        </p>
                    </section>

                    {/* The Vision Statement */}
                    <section className="glass-panel p-8 rounded-[40px] border border-white/10">
                        <label className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                            <Ship size={14} /> Vision Statement
                        </label>
                        <h3 className="text-xl font-bold text-white mb-6">The Quarter's Objective</h3>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 h-28 resize-none"
                            placeholder="Summarize the core focus of the next 90 days..."
                            value={form.vision_statement}
                            onChange={e => setForm({ ...form, vision_statement: e.target.value })}
                        />
                    </section>
                </div>

                {/* Tactical Goals - Backcasting */}
                <section className="glass-panel p-10 rounded-[40px] border border-white/10 relative">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <Map size={14} /> Tactical Backcasting
                    </label>
                    <h3 className="text-2xl font-bold text-white mb-8">Top 3 Outcomes for {form.quarter} {form.year}</h3>
                    <div className="space-y-4">
                        {form.goals.map((goal, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                    {idx + 1}
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    placeholder={`Goal ${idx + 1}...`}
                                    value={goal}
                                    onChange={e => handleGoalChange(idx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/10">
                    <div className="flex gap-4">
                        <select
                            className="bg-transparent text-white font-bold p-2 focus:outline-none"
                            value={form.quarter}
                            onChange={e => setForm({ ...form, quarter: e.target.value })}
                        >
                            <option value="Q1">Quarter 1</option>
                            <option value="Q2">Quarter 2</option>
                            <option value="Q3">Quarter 3</option>
                            <option value="Q4">Quarter 4</option>
                        </select>
                        <select
                            className="bg-transparent text-white font-bold p-2 focus:outline-none"
                            value={form.year}
                            onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                        >
                            <option value={2026}>2026</option>
                            <option value={2027}>2027</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold shadow-xl shadow-cyan-600/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save size={20} />
                        Committing to Shift
                    </button>
                </div>
            </form>

            {identities && identities.length > 0 && (
                <div className="mt-20">
                    <h3 className="text-xl font-bold text-white mb-6">Previous Identity Shifts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {identities.map((id: any) => (
                            <div key={id.id} className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-indigo-400 font-bold">{id.primary_identity}</span>
                                    <span className="text-xs text-gray-500">{id.quarter} {id.year}</span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">{id.vision_statement}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
