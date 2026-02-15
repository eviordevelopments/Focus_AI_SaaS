import { useState, useEffect } from 'react';
import { useGetSystemsQuery, useCreateBatchLogMutation, useGetLogsQuery } from '../../features/api/apiSlice';
import { X, Check, Brain, Zap, Smile, MessageSquare, Flame } from 'lucide-react';
import { format } from 'date-fns';

interface DailyLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DailyLogModal({ isOpen, onClose }: DailyLogModalProps) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: systems } = useGetSystemsQuery();
    const { data: existingLogs } = useGetLogsQuery({ date: today });
    const [createBatchLog, { isLoading }] = useCreateBatchLogMutation();

    const [selections, setSelections] = useState<Record<string, { completed: boolean, used_easy_variant: boolean, effort_level: number }>>({});
    const [globalStats, setGlobalStats] = useState({ mood: 'good', energy: 3, notes: '' });

    useEffect(() => {
        if (systems) {
            const initial: any = {};
            systems.forEach(s => {
                const existing = existingLogs?.find(l => l.system_id === s.id && !l.habit_id);
                initial[s.id] = {
                    completed: existing?.completed || false,
                    used_easy_variant: existing?.used_easy_variant || false,
                    effort_level: existing?.effort_level || 3
                };
            });
            setSelections(initial);
        }
    }, [systems, existingLogs]);

    const handleToggle = (systemId: string) => {
        setSelections(prev => ({
            ...prev,
            [systemId]: { ...prev[systemId], completed: !prev[systemId].completed }
        }));
    };

    const handleEasyToggle = (systemId: string) => {
        setSelections(prev => ({
            ...prev,
            [systemId]: { ...prev[systemId], used_easy_variant: !prev[systemId].used_easy_variant }
        }));
    };

    const handleSubmit = async () => {
        try {
            const logs = Object.entries(selections).map(([systemId, data]) => ({
                system_id: systemId,
                ...data
            }));

            await createBatchLog({
                date: today,
                mood: globalStats.mood,
                energy_level: globalStats.energy,
                notes: globalStats.notes,
                logs
            }).unwrap();

            onClose();
        } catch (err) {
            console.error('Batch save failed:', err);
            alert('Failed to save activity logs. Please check your connection and try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-gray-950/80 border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <header className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Brain className="text-indigo-400" />
                            Daily Alignment
                        </h2>
                        <p className="text-gray-400 text-sm">{format(new Date(), 'EEEE, MMMM do')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Systems Tracking */}
                    <section>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">Today's Systems</label>
                        <div className="space-y-3">
                            {systems?.map(system => (
                                <div key={system.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${selections[system.id]?.completed
                                    ? 'bg-indigo-500/10 border-indigo-500/50'
                                    : 'bg-white/5 border-white/5'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleToggle(system.id)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selections[system.id]?.completed
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-white/10 text-gray-500 hover:bg-white/20'
                                                }`}
                                        >
                                            {selections[system.id]?.completed && <Check size={18} />}
                                        </button>
                                        <div>
                                            <h4 className="text-white font-medium">{system.name}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                <Flame size={10} className={selections[system.id]?.used_easy_variant ? 'text-amber-400' : ''} />
                                                <span>{selections[system.id]?.used_easy_variant ? 'Easy version used' : 'Full version'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleEasyToggle(system.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${selections[system.id]?.used_easy_variant
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        Easy Variant
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                                <Smile size={12} /> Mood
                            </label>
                            <div className="flex justify-between">
                                {['great', 'good', 'neutral', 'low'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setGlobalStats({ ...globalStats, mood: m })}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${globalStats.mood === m ? 'bg-white/10 scale-110 shadow-lg' : 'opacity-40 grayscale hover:opacity-100'
                                            }`}
                                    >
                                        {m === 'great' && '🔥'}
                                        {m === 'good' && '✨'}
                                        {m === 'neutral' && '⚖️'}
                                        {m === 'low' && '💤'}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                                <Zap size={12} /> Energy
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setGlobalStats({ ...globalStats, energy: n })}
                                        className={`flex-1 h-10 rounded-xl font-bold text-xs transition-all ${globalStats.energy === n ? 'bg-indigo-500 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                            <MessageSquare size={12} /> Notes / Reflection
                        </label>
                        <textarea
                            className="w-full bg-transparent text-gray-300 focus:outline-none resize-none h-24 text-sm"
                            placeholder="What went well? Any bottlenecks?"
                            value={globalStats.notes}
                            onChange={e => setGlobalStats({ ...globalStats, notes: e.target.value })}
                        />
                    </section>
                </div>

                {/* Footer */}
                <footer className="p-8 border-t border-white/5 bg-black/20 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-2xl text-gray-400 font-bold hover:text-white transition-colors">
                        Skip Today
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {isLoading ? 'Saving...' : 'Complete Log'}
                        <Check size={20} />
                    </button>
                </footer>
            </div>
        </div>
    );
}
