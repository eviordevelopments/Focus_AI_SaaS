import { useState } from 'react';
import { useGetLogsQuery, useGetBurnoutStatusQuery, useCreateWeeklyReviewMutation } from '../../features/api/apiSlice';
import { CheckCircle2, ChevronRight, ChevronLeft, Award, Zap, AlertTriangle, TrendingUp, Save } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';

export function WeeklyReview() {
    const [step, setStep] = useState(1);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    const { data: logs } = useGetLogsQuery({ date: format(weekStart, 'yyyy-MM-dd') }); // Simple fetch
    const { data: burnout } = useGetBurnoutStatusQuery();

    const [reviewForm, setReviewForm] = useState({
        wins: '',
        bottlenecks: '',
        adjustments: '',
        valueAlignment: 3
    });

    const [createReview, { isLoading }] = useCreateWeeklyReviewMutation();

    const nextStep = () => setStep(s => Math.min(4, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const handleSubmit = async () => {
        try {
            await createReview({
                ...reviewForm,
                value_alignment_score: reviewForm.valueAlignment
            }).unwrap();
            alert('Weekly Reflection Sealed!');
            // Reset or navigate? For now just alert.
        } catch (err) {
            console.error('Failed to save review:', err);
        }
    };

    const adherence = logs ? Math.round((logs.filter(l => l.completed).length / logs.length) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Weekly Review</h1>
                    <p className="text-gray-400">Reflect, adjust, and optimize for next week.</p>
                </div>
                <div className="flex gap-2 mb-1">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
                    ))}
                </div>
            </header>

            <div className="glass-panel p-10 rounded-[40px] border border-white/10 min-h-[500px] flex flex-col">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Award className="text-amber-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Step 1: Celebrate Wins</h2>
                        <p className="text-gray-400 mb-8">What small or large victories did you achieve this week? Focus on effort and consistency.</p>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[200px] resize-none"
                            placeholder="I stayed consistent with my morning deep work... I prioritized sleep even when busy..."
                            value={reviewForm.wins}
                            onChange={e => setReviewForm({ ...reviewForm, wins: e.target.value })}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <TrendingUp className="text-indigo-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Step 2: Analytics Review</h2>
                        <p className="text-gray-400 mb-8">Data-driven reflection on your adherence and energy.</p>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">System Adherence</span>
                                <span className="text-4xl font-bold text-white">{adherence}%</span>
                                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${adherence}%` }} />
                                </div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Burnout Risk</span>
                                <span className={`text-4xl font-bold ${burnout?.score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {burnout?.score || 0}/100
                                </span>
                                <p className="text-[10px] text-gray-400 mt-2">{burnout?.advice}</p>
                            </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5 flex items-start gap-4">
                            <Zap className="text-yellow-400 shrink-0" size={24} />
                            <div>
                                <h4 className="text-white font-bold mb-1">Weekly Insights</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    You were most productive during morning sessions. Focus quality dipped slightly on Wednesday.
                                    Identity reinforcement is strongest for "Software Architect".
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                        <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle className="text-rose-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Step 3: Identity Bottlenecks</h2>
                        <p className="text-gray-400 mb-8">What prevented you from being your ideal self this week? Be honest but self-compassionate.</p>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 min-h-[200px] resize-none"
                            placeholder="I spent too much time on mindless scrolling after 9pm... Unexpected meetings disrupted my deep work..."
                            value={reviewForm.bottlenecks}
                            onChange={e => setReviewForm({ ...reviewForm, bottlenecks: e.target.value })}
                        />
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <CheckCircle2 className="text-emerald-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Step 4: Next Week's Shift</h2>
                        <p className="text-gray-400 mb-8">Based on your insights, what is the #1 adjustment for next week?</p>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[200px] resize-none mb-6"
                            placeholder="I will set a screen-time hard limit at 9:30pm... I will move my deep work to 7am to avoid meeting conflicts..."
                            value={reviewForm.adjustments}
                            onChange={e => setReviewForm({ ...reviewForm, adjustments: e.target.value })}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? <Save className="animate-pulse" size={20} /> : <Save size={20} />}
                            Seal Weekly Reflection
                        </button>
                    </div>
                )}

                <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className="px-6 py-3 text-gray-400 hover:text-white font-bold flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>
                    {step < 4 && (
                        <button
                            onClick={nextStep}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold flex items-center gap-2 transition-all"
                        >
                            Next Step
                            <ChevronRight size={20} />
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}
