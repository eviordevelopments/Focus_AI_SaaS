import React, { useState } from 'react';
import { Target, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface OutcomeCardProps {
    outcome: any;
    onUpdate: (id: string, updates: any) => void;
    onDelete: (id: string) => void;
}

export function OutcomeCard({ outcome, onUpdate, onDelete }: OutcomeCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: outcome.title,
        current: outcome.current_value,
        target: outcome.target_value
    });

    const progress = Math.min(100, Math.max(0, (editForm.current / editForm.target) * 100));

    const handleSave = () => {
        onUpdate(outcome.id, {
            title: editForm.title,
            current_value: parseInt(editForm.current),
            target_value: parseInt(editForm.target)
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Outcome Title"
                />
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={editForm.current}
                        onChange={e => setEditForm(prev => ({ ...prev, current: e.target.value }))}
                        className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs"
                        placeholder="Current"
                    />
                    <input
                        type="number"
                        value={editForm.target}
                        onChange={e => setEditForm(prev => ({ ...prev, target: e.target.value }))}
                        className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs"
                        placeholder="Target"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="p-1 hover:text-white text-gray-400">
                        <X size={16} />
                    </button>
                    <button onClick={handleSave} className="p-1 hover:text-indigo-400 text-indigo-500">
                        <Check size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            layout
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all"
        >
            <div className="flex items-start gap-3">
                <button className="mt-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                </button>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-200 text-sm">{outcome.title}</h4>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => onDelete(outcome.id)} className="text-gray-500 hover:text-rose-500">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{editForm.current} / {editForm.target}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
