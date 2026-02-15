import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useCreateHabitMutation, useGetAreasQuery } from '../../features/api/apiSlice';
import { Trash2, X, Calendar as CalIcon, Clock, Repeat, MapPin, Link as LinkIcon, Zap, Check } from 'lucide-react';

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

                let recurringDays = [];
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
        if (confirm(`Permanently remove event "${editingTask.title}"?`)) {
            try {
                await deleteTask(editingTask.id).unwrap();
                onClose();
            } catch (err) {
                alert("Failed to delete event.");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#1a1b26] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setEventType('task')}
                            className={`text-xl font-bold transition-all ${eventType === 'task' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            New Task
                        </button>
                        <button
                            onClick={() => setEventType('habit')}
                            className={`text-xl font-bold transition-all ${eventType === 'habit' ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            New Habit
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">

                    {/* Title input */}
                    <div>
                        <input
                            type="text"
                            placeholder={eventType === 'task' ? "Add generic title, e.g., 'Deep Work Session'" : "Habit name, e.g., 'Daily Meditation'"}
                            className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-600 border-none focus:outline-none focus:ring-0 p-0 outline-none shadow-none"
                            value={formData.title}
                            onChange={e => handleChange('title', e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Time & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                <CalIcon size={16} /> Date
                            </label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={formData.date}
                                onChange={e => handleChange('date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                <Clock size={16} /> Time
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.startTime}
                                    onChange={e => handleChange('startTime', e.target.value)}
                                />
                                <span className="text-white self-center">-</span>
                                <input
                                    type="time"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.endTime}
                                    onChange={e => handleChange('endTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                <Repeat size={16} /> Repeat
                            </label>
                            <button
                                onClick={() => handleChange('isRecurring', !formData.isRecurring)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.isRecurring ? 'bg-indigo-500' : 'bg-gray-700'}`}
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
                                <label className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                    <MapPin size={16} /> Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Add location"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.location}
                                    onChange={e => handleChange('location', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                    <LinkIcon size={16} /> Links
                                </label>
                                <input
                                    type="text"
                                    placeholder="Add links (e.g. Zoom, Docs)"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.links}
                                    onChange={e => handleChange('links', e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">The Cue (Trigger)</label>
                                    <input
                                        type="text"
                                        placeholder="After I..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={formData.cue}
                                        onChange={e => handleChange('cue', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">The Reward</label>
                                    <input
                                        type="text"
                                        placeholder="Then I feel..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={formData.reward}
                                        onChange={e => handleChange('reward', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Protocol (Hard Version)</label>
                                    <input
                                        type="text"
                                        placeholder="100% effort..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={formData.routine_hard}
                                        onChange={e => handleChange('routine_hard', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Protocol (Easy Version)</label>
                                    <input
                                        type="text"
                                        placeholder="Min viable..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={formData.routine_easy}
                                        onChange={e => handleChange('routine_easy', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Life Area Selection */}
                    <div className="space-y-3">
                        <label className="text-sm text-gray-400 font-medium">Life Area</label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {areas.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => {
                                        handleChange('color', a.color_hex);
                                        handleChange('areaId', a.id);
                                    }}
                                    className={`
                                        h-12 rounded-lg opacity-70 hover:opacity-100 transition-all border-2 flex items-center justify-center
                                        ${formData.areaId === a.id ? 'border-white scale-[1.05] opacity-100 shadow-xl' : 'border-transparent'}
                                    `}
                                    style={{ backgroundColor: a.color_hex }}
                                    title={a.name}
                                >
                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter truncate px-1">{a.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Deep Work Integration */}
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-indigo-300 font-bold">
                                <Zap size={16} /> Focus Session Config
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
                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-between items-center bg-white/5">
                    <div>
                        {editingTask && !editingTask.id.startsWith('ext-') && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-bold text-xs"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title}
                            className="px-8 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingTask ? 'Update Protocol' : `Create ${eventType === 'task' ? 'Event' : 'Habit'}`}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
