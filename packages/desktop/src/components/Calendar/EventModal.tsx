import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useCreateHabitMutation, useGetAreasQuery, useDeleteHabitMutation } from '../../features/api/apiSlice';
import { Trash2, X, Calendar as CalIcon, Clock, Repeat, MapPin, Link as LinkIcon, Zap, Check } from 'lucide-react';
import GlassModal from '../ui/GlassModal';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: Date;
    initialStartTime?: Date;
    editingTask?: any; // Can be a task or a system (different id patterns)
}

export default function EventModal({ isOpen, onClose, initialDate, initialStartTime, editingTask }: EventModalProps) {
    const [addTask] = useAddTaskMutation();
    const [updateTask] = useUpdateTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [createHabit] = useCreateHabitMutation();
    const [deleteHabit] = useDeleteHabitMutation();
    const { data: areas = [] } = useGetAreasQuery();

    const [eventType, setEventType] = useState<'task' | 'habit'>('task');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        isRecurring: false,
        recurringDays: [] as string[],
        areaId: '',
        sessionType: '', // 'pomodoro' | 'deepwork' | 'custom'
        sessionDuration: 30,
        links: '',
        color: '#6366f1', // Defaults
        cue: '',
        reward: '',
        routine_hard: '',
        routine_easy: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (editingTask && editingTask.id && !editingTask.id.startsWith('ext-')) {
                // Determine if it's a habit or task (simulated for now by presence of specific fields)
                // For this MVP, calendar mostly edits 'tasks'
                setEventType('task');

                const d = getSafeDate(editingTask.start_time || editingTask.due_date) || new Date();
                const s = getSafeDate(editingTask.start_time) || d;
                const e = getSafeDate(editingTask.end_time) || new Date(s.getTime() + 60 * 60 * 1000);

                let recurringDays: string[] = [];
                try {
                    if (editingTask.recurring_days) {
                        recurringDays = typeof editingTask.recurring_days === 'string'
                            ? JSON.parse(editingTask.recurring_days)
                            : editingTask.recurring_days;
                    }
                } catch (e) {
                    recurringDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                }

                setFormData({
                    title: editingTask.title || '',
                    description: editingTask.description || '',
                    date: format(d, 'yyyy-MM-dd'),
                    startTime: format(s, 'HH:mm'),
                    endTime: format(e, 'HH:mm'),
                    location: editingTask.location || '',
                    isRecurring: !!editingTask.is_recurring,
                    recurringDays: Array.isArray(recurringDays) ? recurringDays : [],
                    areaId: editingTask.area_id || '',
                    sessionType: editingTask.session_config ? JSON.parse(editingTask.session_config).type : '',
                    sessionDuration: editingTask.session_config ? JSON.parse(editingTask.session_config).duration : 30,
                    links: editingTask.links || '',
                    color: editingTask.color || '#6366f1',
                    cue: '',
                    reward: '',
                    routine_hard: '',
                    routine_easy: ''
                });
            } else {
                const d = initialDate || new Date();
                const s = initialStartTime || d;
                // Default 1 hour duration
                const e = new Date(s.getTime() + 60 * 60 * 1000);

                setFormData({
                    title: '',
                    description: '',
                    date: format(d, 'yyyy-MM-dd'),
                    startTime: format(s, 'HH:mm'),
                    endTime: format(e, 'HH:mm'),
                    location: '',
                    isRecurring: false,
                    recurringDays: [],
                    areaId: '',
                    sessionType: '',
                    sessionDuration: 30,
                    links: '',
                    color: '#6366f1',
                    cue: '',
                    reward: '',
                    routine_hard: '',
                    routine_easy: ''
                });
            }
        }
    }, [isOpen, initialDate, initialStartTime, editingTask]);

    const getSafeDate = (val: any) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDay = (day: string) => {
        setFormData(prev => {
            const days = prev.recurringDays.includes(day)
                ? prev.recurringDays.filter(d => d !== day)
                : [...prev.recurringDays, day];
            return { ...prev, recurringDays: days };
        });
    };

    const selectEveryday = () => {
        setFormData(prev => ({
            ...prev,
            isRecurring: true,
            recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Construct ISO strings
        const startISO = `${formData.date}T${formData.startTime}:00`;
        const endISO = `${formData.date}T${formData.endTime}:00`;

        try {
            if (eventType === 'task') {
                const payload = {
                    title: formData.title,
                    description: formData.description,
                    due_date: startISO,
                    start_time: startISO,
                    end_time: endISO,
                    location: formData.location,
                    area_id: formData.areaId || undefined,
                    is_recurring: formData.isRecurring,
                    recurring_days: JSON.stringify(formData.recurringDays),
                    links: formData.links,
                    color: formData.color,
                    session_config: formData.sessionType ? JSON.stringify({ type: formData.sessionType, duration: formData.sessionDuration }) : undefined
                };

                if (editingTask && !editingTask.id.startsWith('ext-')) {
                    await updateTask({ id: editingTask.id, updates: payload }).unwrap();
                } else {
                    await addTask(payload).unwrap();
                }
            } else {
                // Map recurringDays (Mon, Tue...) to index (0-6) for Habit model
                const dayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
                const daysIndices = formData.recurringDays.map(d => dayMap[d]);

                await createHabit({
                    name: formData.title,
                    description: formData.description,
                    start_time: formData.startTime,
                    end_time: formData.endTime,
                    is_active: true,
                    days_of_week: daysIndices.length > 0 ? daysIndices : [0, 1, 2, 3, 4, 5, 6],
                    color_hex: formData.color,
                    habit_type: 'habit',
                    life_area_id: formData.areaId || null,
                    cue: formData.cue,
                    reward: formData.reward,
                    routine_hard: formData.routine_hard,
                    routine_easy: formData.routine_easy
                }).unwrap();
            }

            onClose();
        } catch (err) {
            console.error("Failed to save event:", err);
            alert("Failed to save event. Please check your inputs.");
        }
    };

    const handleDelete = async () => {
        if (!editingTask) return;
        // Check if it's a habit or task
        const isHabit = editingTask.habit_type || eventType === 'habit';
        const title = editingTask.title || editingTask.name || 'this event';
        if (confirm(`Permanently remove ${isHabit ? 'habit' : 'event'} "${title}"?`)) {
            try {
                if (isHabit) {
                    await deleteHabit(editingTask.id).unwrap();
                } else {
                    await deleteTask(editingTask.id).unwrap();
                }
                onClose();
            } catch (err) {
                alert(`Failed to delete ${isHabit ? 'habit' : 'event'}.`);
            }
        }
    };

    if (!isOpen) return null;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Gradient presets for Areas
    const gradients = [
        { name: 'Personal', color: '#6366f1', grad: 'from-indigo-500 to-purple-500' },
        { name: 'Health', color: '#10b981', grad: 'from-emerald-500 to-teal-500' },
        { name: 'Work', color: '#3b82f6', grad: 'from-blue-500 to-cyan-500' },
        { name: 'Spiritual', color: '#8b5cf6', grad: 'from-violet-500 to-fuchsia-500' },
        { name: 'Financial', color: '#f59e0b', grad: 'from-amber-500 to-orange-500' },
    ];

    return (
        <GlassModal isOpen={isOpen} maxWidth="4xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-full">
                        <button
                            onClick={() => setEventType('task')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${eventType === 'task' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}
                        >
                            Task
                        </button>
                        <button
                            onClick={() => setEventType('habit')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${eventType === 'habit' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}
                        >
                            Habit
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 px-8 pr-10">

                    {/* Title input */}
                    <div>
                        <input
                            type="text"
                            placeholder={eventType === 'task' ? "Add generic title, e.g., 'Deep Work Session'" : "Habit name, e.g., 'Daily Meditation'"}
                            className="w-full bg-transparent text-3xl font-bold text-white placeholder-white/30 border-none focus:outline-none focus:ring-0 p-0 outline-none shadow-none"
                            value={formData.title}
                            onChange={e => handleChange('title', e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Time & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                <CalIcon size={14} /> Date
                            </label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-white/20 transition-all"
                                value={formData.date}
                                onChange={e => handleChange('date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                <Clock size={14} /> Time
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-white/20 transition-all"
                                    value={formData.startTime}
                                    onChange={e => handleChange('startTime', e.target.value)}
                                />
                                <span className="text-white/50 self-center">-</span>
                                <input
                                    type="time"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-white/20 transition-all"
                                    value={formData.endTime}
                                    onChange={e => handleChange('endTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                <Repeat size={14} /> Repeat
                            </label>
                            <button
                                onClick={() => handleChange('isRecurring', !formData.isRecurring)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.isRecurring ? 'bg-indigo-500' : 'bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isRecurring ? 'translate-x-4' : ''}`} />
                            </button>
                        </div>
                        {formData.isRecurring && (
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 justify-between">
                                    {days.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${formData.recurringDays.includes(day)
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {day[0]}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={selectEveryday}
                                    className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors self-start px-1"
                                >
                                    + Set Everyday
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Location & Links / Habit Identity */}
                    {eventType === 'task' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                    <MapPin size={14} /> Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Add location"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                                    value={formData.location}
                                    onChange={e => handleChange('location', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                                    <LinkIcon size={14} /> Links
                                </label>
                                <input
                                    type="text"
                                    placeholder="Add links (e.g. Zoom, Docs)"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                                    value={formData.links}
                                    onChange={e => handleChange('links', e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">The Cue (Trigger)</label>
                                    <input
                                        type="text"
                                        placeholder="After I..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                                        value={formData.cue}
                                        onChange={e => handleChange('cue', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">The Reward</label>
                                    <input
                                        type="text"
                                        placeholder="Then I feel..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                                        value={formData.reward}
                                        onChange={e => handleChange('reward', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">Protocol (Hard Version)</label>
                                    <input
                                        type="text"
                                        placeholder="100% effort..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                                        value={formData.routine_hard}
                                        onChange={e => handleChange('routine_hard', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">Protocol (Easy Version)</label>
                                    <input
                                        type="text"
                                        placeholder="Min viable..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                                        value={formData.routine_easy}
                                        onChange={e => handleChange('routine_easy', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Life Area Selection */}
                    <div className="space-y-3 px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">Life Area</label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {areas.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => {
                                        handleChange('color', a.color_hex);
                                        handleChange('areaId', a.id);
                                    }}
                                    className={`
                                        h-12 rounded-xl backdrop-blur-md transition-all border-2 flex items-center justify-center overflow-hidden relative group
                                        ${formData.areaId === a.id ? 'border-white scale-[1.05] shadow-[0_0_20px_rgba(255,255,255,0.2)] text-white' : 'border-transparent opacity-80 hover:opacity-100 text-white/90 hover:text-white'}
                                    `}
                                    style={{ 
                                        backgroundColor: formData.areaId === a.id ? a.color_hex : `${a.color_hex}80`,
                                    }}
                                    title={a.name}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] truncate px-2 relative z-10">{a.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Deep Work Integration */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                                <Zap size={14} /> Focus Session Config
                            </label>
                        </div>
                        <div className="flex gap-2">
                            {['Pomodoro', 'Deep Work', 'Custom'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleChange('sessionType', type.toLowerCase().replace(' ', ''))}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${formData.sessionType === type.toLowerCase().replace(' ', '')
                                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg'
                                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        {formData.sessionType && (
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs text-gray-400">Duration (min)</label>
                                <input
                                    type="range" min="15" max="120" step="5"
                                    className="flex-1 accent-indigo-500"
                                    value={formData.sessionDuration}
                                    onChange={e => handleChange('sessionDuration', parseInt(e.target.value))}
                                />
                                <span className="text-sm font-bold text-white w-12 text-right">{formData.sessionDuration}m</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-6 mt-4 flex justify-between items-center">
                    <div>
                        {editingTask && !editingTask.id.startsWith('ext-') && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 text-red-500 rounded-full transition-all font-bold text-xs"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-[2rem] border border-white/10 bg-[#0f1015] hover:bg-[#16171d] text-white transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title}
                            className="px-8 py-2.5 rounded-[2rem] bg-[#8d929f] hover:bg-[#a1a6b4] text-black transition-colors text-sm font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                    </div>
                </div>

        </GlassModal>
    );
}
