import React, { useState, useEffect } from 'react';
import { useAddTaskMutation, useGetAreasQuery } from '../features/api/apiSlice';
import { X, Star, Calendar, Clock, Layout, Zap, CheckCircle2 } from 'lucide-react';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialStatus?: 'todo' | 'in_progress' | 'done';
    initialPriority?: number;
}

export function TaskFormModal({ isOpen, onClose, initialStatus = 'todo', initialPriority = 1 }: TaskFormModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [areaId, setAreaId] = useState('');
    const [status, setStatus] = useState(initialStatus);
    const [priority, setPriority] = useState(initialPriority);
    const [dueDate, setDueDate] = useState('');
    const [wantsFocusSession, setWantsFocusSession] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(25);

    const [addTask, { isLoading }] = useAddTaskMutation();
    const { data: areas } = useGetAreasQuery();

    useEffect(() => {
        if (areas && areas.length > 0 && !areaId) {
            setAreaId(areas[0].id);
        }
    }, [areas, areaId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !areaId) return;

        try {
            await addTask({
                title,
                description,
                status,
                priority,
                area_id: areaId,
                due_date: dueDate || new Date().toISOString(),
                session_config: wantsFocusSession ? JSON.stringify({ duration: sessionDuration }) : undefined
            }).unwrap();

            setTitle('');
            setDescription('');
            onClose();
        } catch (err) {
            console.error('Failed to add task', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-panel animate-in zoom-in-95 duration-200">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px]" />

                {/* Header */}
                <div className="relative flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                            <Zap size={22} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Create New Task</h2>
                            <p className="text-xs text-gray-400">Define your next focus objective</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="relative p-8 space-y-6">
                    {/* Title & Description */}
                    <div className="space-y-4">
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-transparent text-2xl font-semibold text-white placeholder-white/20 border-none focus:outline-none focus:ring-0 outline-none shadow-none"
                            required
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details or sub-tasks..."
                            className="w-full bg-transparent text-gray-400 placeholder-white/10 border-none focus:outline-none focus:ring-0 resize-none h-20 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Area Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <Layout size={12} /> Life Area
                            </label>
                            <select
                                value={areaId}
                                onChange={(e) => setAreaId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                required
                            >
                                <option value="" disabled className="bg-gray-900">Choose an Area</option>
                                {areas?.map(area => (
                                    <option key={area.id} value={area.id} className="bg-gray-900">
                                        {area.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <CheckCircle2 size={12} /> Status
                            </label>
                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                                {(['todo', 'in_progress', 'done'] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${status === s
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {s === 'todo' ? 'To Do' : s === 'in_progress' ? 'Active' : 'Done'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Priority Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <Star size={12} /> Priority Level
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${priority === p
                                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-lg shadow-amber-500/10 scale-110'
                                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                <Calendar size={12} /> Deadline
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Focus Session Toggle */}
                    <div className={`p-4 rounded-2xl border transition-all ${wantsFocusSession
                        ? 'bg-blue-600/10 border-blue-500/30'
                        : 'bg-white/5 border-white/5'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${wantsFocusSession ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Focus Session</p>
                                    <p className="text-[10px] text-gray-500">Auto-schedule a deep work block</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setWantsFocusSession(!wantsFocusSession)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${wantsFocusSession ? 'bg-blue-600' : 'bg-gray-700'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${wantsFocusSession ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>

                        {wantsFocusSession && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 animate-in slide-in-from-top-2">
                                <span className="text-xs text-gray-400">Duration:</span>
                                <div className="flex gap-2">
                                    {[25, 50, 90].map(mins => (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => setSessionDuration(mins)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${sessionDuration === mins
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                                }`}
                                        >
                                            {mins}m
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Footer */}
                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title || !areaId}
                            className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                        >
                            {isLoading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
