import React, { useState } from 'react';
import { useAddTaskMutation, useGetAreasQuery } from '../features/api/apiSlice';
import { Plus } from 'lucide-react';

export function TaskForm({ onClose }: { onClose?: () => void }) {
    const [title, setTitle] = useState('');
    const [areaId, setAreaId] = useState('');
    const [priority] = useState(1);

    const [addTask] = useAddTaskMutation();
    const { data: areas } = useGetAreasQuery();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !areaId) return;

        await addTask({
            title,
            area_id: areaId,
            priority,
            description: ''
        });

        setTitle('');
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-4 rounded-xl flex flex-col gap-4">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex gap-2">
                <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-2 text-gray-300"
                >
                    <option value="" disabled>Select Area</option>
                    {areas?.map(area => (
                        <option key={area.id} value={area.id} className="text-black">{area.name}</option>
                    ))}
                </select>

                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 ml-auto">
                    <Plus size={16} /> Add
                </button>
            </div>
        </form>
    );
}
