import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, CheckCircle2, Moon, Smile, Zap,
    Activity, Monitor, Calendar
} from 'lucide-react';
import { useLogHealthMutation } from '../../../features/api/apiSlice';

interface HealthLoggingModalProps {
    onClose: () => void;
    initialData?: any;
}

export function HealthLoggingModal({ onClose, initialData }: HealthLoggingModalProps) {
    const [logHealth, { isLoading }] = useLogHealthMutation();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        sleep_hours: initialData?.sleep_hours || 7,
        mood: initialData?.mood || 7,
        stress: initialData?.stress || 3,
        exercise_minutes: initialData?.exercise_minutes || 30,
        screen_time_hours: initialData?.screen_time_hours || 4
    });

    const handleSubmit = async () => {
        try {
            setError(null);
            await logHealth(form).unwrap();
            setSuccess(true);

            // Show success animation then close
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Failed to log health:', err);
            setError(err?.data?.error || 'Failed to save health entry. Please try again.');
        }
    };

    const sections = [
        { key: 'sleep_hours', label: 'Sleep Quality', icon: Moon, color: 'text-indigo-400', unit: 'hours', min: 0, max: 12, step: 0.5 },
        { key: 'mood', label: 'Emotional State', icon: Smile, color: 'text-emerald-400', unit: '/10', min: 1, max: 10, step: 1 },
        { key: 'stress', label: 'Stress Level', icon: Zap, color: 'text-rose-400', unit: '/10', min: 1, max: 10, step: 1 },
        { key: 'exercise_minutes', label: 'Physical Activity', icon: Activity, color: 'text-orange-400', unit: 'mins', min: 0, max: 180, step: 5 },
        { key: 'screen_time_hours', label: 'Digital Exposure', icon: Monitor, color: 'text-cyan-400', unit: 'hours', min: 0, max: 16, step: 0.5 },
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
                className="relative w-full max-w-xl glass-panel p-10 rounded-[3.5rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-2">
                                <Activity size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Biometric Sync</h2>
                            <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center gap-2">
                                <Calendar size={12} className="text-emerald-500" />
                                Protocol Date: {form.date}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Entry Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all [color-scheme:dark]"
                            />
                        </div>

                        <div className="space-y-10">
                            {sections.map((s) => (
                                <div key={s.key} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
                                                <s.icon size={16} />
                                            </div>
                                            <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{s.label}</label>
                                        </div>
                                        <span className="text-xl font-black text-white italic">
                                            {form[s.key as key_of_form]} {s.unit}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={s.min}
                                        max={s.max}
                                        step={s.step}
                                        value={form[s.key as key_of_form]}
                                        onChange={e => setForm({ ...form, [s.key]: parseFloat(e.target.value) })}
                                        className={`w-full h-1.5 bg-white/5 rounded-full appearance-none outline-none accent-indigo-500`}
                                        style={{ accentColor: s.color.includes('indigo') ? '#6366f1' : s.color.includes('emerald') ? '#10b981' : s.color.includes('rose') ? '#f43f5e' : s.color.includes('orange') ? '#f59e0b' : '#06b6d4' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Health entry saved successfully!
                        </div>
                    )}

                    <div className="flex gap-4 pt-8">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-8 bg-white/5 text-gray-400 font-black uppercase tracking-widest py-5 rounded-3xl hover:bg-white/10 transition-all text-xs disabled:opacity-50"
                        >
                            Abort
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || success}
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-emerald-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl shadow-indigo-900/40 transition-all text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    Synchronize Data
                                    <CheckCircle2 size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

type key_of_form = 'sleep_hours' | 'mood' | 'stress' | 'exercise_minutes' | 'screen_time_hours';
