import { useState, useEffect } from 'react';
import { useLogHealthMutation, useGetTodayHealthQuery } from '../../features/api/apiSlice';
import { Save } from 'lucide-react';

export function HealthForm() {
    const { data: todayEntry } = useGetTodayHealthQuery();
    const [logHealth] = useLogHealthMutation();

    const [form, setForm] = useState({
        sleep_hours: 7,
        mood: 7,
        stress: 3,
        screen_time_hours: 4,
        exercise_minutes: 30
    });

    useEffect(() => {
        if (todayEntry) {
            setForm({
                sleep_hours: todayEntry.sleep_hours,
                mood: todayEntry.mood,
                stress: todayEntry.stress,
                screen_time_hours: todayEntry.screen_time_hours,
                exercise_minutes: todayEntry.exercise_minutes
            });
        }
    }, [todayEntry]);

    const handleChange = (key: string, value: number) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        const today = new Date().toISOString().split('T')[0];
        await logHealth({ date: today, ...form });
    };

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-bold mb-6 text-lg">Daily Check-in</h3>

            <div className="space-y-6">
                <SliderControl
                    label="Sleep (Hours)"
                    value={form.sleep_hours}
                    min={0} max={12} step={0.5}
                    onChange={(v) => handleChange('sleep_hours', v)}
                    color="text-indigo-400"
                />

                <SliderControl
                    label="Mood (1-10)"
                    value={form.mood}
                    min={1} max={10} step={1}
                    onChange={(v) => handleChange('mood', v)}
                    color="text-yellow-400"
                />

                <SliderControl
                    label="Stress (1-10)"
                    value={form.stress}
                    min={1} max={10} step={1}
                    onChange={(v) => handleChange('stress', v)}
                    color="text-red-400"
                />

                <SliderControl
                    label="Exercise (Minutes)"
                    value={form.exercise_minutes}
                    min={0} max={120} step={5}
                    onChange={(v) => handleChange('exercise_minutes', v)}
                    color="text-green-400"
                />

                <SliderControl
                    label="Screen Time (Hours)"
                    value={form.screen_time_hours}
                    min={0} max={16} step={0.5}
                    onChange={(v) => handleChange('screen_time_hours', v)}
                    color="text-blue-400"
                />

                <button
                    onClick={handleSubmit}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4"
                >
                    <Save size={18} /> Save Log
                </button>
            </div>
        </div>
    );
}

function SliderControl({ label, value, min, max, step, onChange, color }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, color: string }) {
    return (
        <div>
            <div className="flex justify-between mb-2">
                <label className="text-gray-300 text-sm">{label}</label>
                <span className={`font-bold ${color}`}>{value}</span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    )
}
