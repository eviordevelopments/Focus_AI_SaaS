import React, { useState, useEffect } from 'react';
import { Target, Ship, Save } from 'lucide-react';
import { useCreateQuarterlyIdentityMutation } from '../../../features/api/apiSlice';
import { OutcomeList } from './OutcomeList';

interface QuarterlyIdentityCanvasProps {
    quarter: string;
    year: number;
    initialData?: any;
    onRefresh: () => void;
}

export function QuarterlyIdentityCanvas({ quarter, year, initialData, onRefresh }: QuarterlyIdentityCanvasProps) {
    const [saveIdentity, { isLoading }] = useCreateQuarterlyIdentityMutation();
    console.log('Rendering canvas with initialData:', initialData);

    const [form, setForm] = useState({
        primary_identity: '',
        vision_statement: ''
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                primary_identity: initialData.primary_identity || '',
                vision_statement: initialData.vision_statement || ''
            });
        }
    }, [initialData]);

    const handleBlur = async () => {
        if (form.primary_identity !== initialData?.primary_identity || form.vision_statement !== initialData?.vision_statement) {
            await saveIdentity({
                quarter,
                year,
                primary_identity: form.primary_identity,
                vision_statement: form.vision_statement
            });
            onRefresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* The Primary Identity */}
                <section className="glass-panel p-8 rounded-[40px] border border-white/10 group hover:bg-white/5 transition-colors">
                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <Target size={14} /> This Quarter's Identity
                    </label>
                    <h3 className="text-xl font-bold text-white mb-6">Who must you become?</h3>
                    <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5 mb-4 group-focus-within:ring-1 group-focus-within:ring-indigo-500/50 transition-all">
                        <span className="text-indigo-400 font-bold whitespace-nowrap">I am a</span>
                        <input
                            type="text"
                            className="bg-transparent text-white font-bold placeholder-white/20 focus:outline-none flex-1"
                            placeholder="Elite Developer"
                            value={form.primary_identity}
                            onChange={e => setForm({ ...form, primary_identity: e.target.value })}
                            onBlur={handleBlur}
                        />
                    </div>
                    <p className="text-sm text-gray-400">
                        Pick an identity that bridges your current self and your 10-year vision.
                    </p>
                </section>

                {/* The Vision Statement */}
                <section className="glass-panel p-8 rounded-[40px] border border-white/10 group hover:bg-white/5 transition-colors">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <Ship size={14} /> Vision Statement
                    </label>
                    <h3 className="text-xl font-bold text-white mb-6">The Quarter's Objective</h3>
                    <textarea
                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 h-28 resize-none placeholder-white/20"
                        placeholder="Summarize the core focus of the next 90 days..."
                        value={form.vision_statement}
                        onChange={e => setForm({ ...form, vision_statement: e.target.value })}
                        onBlur={handleBlur}
                    />
                </section>
            </div>

            {/* Outcomes Section */}
            {initialData && (
                <section className="glass-panel p-8 rounded-[40px] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-600 opacity-50" />
                    <OutcomeList
                        identityShiftId={initialData.id}
                        outcomes={initialData.outcomes || []}
                    />
                </section>
            )}
        </div>
    );
}
