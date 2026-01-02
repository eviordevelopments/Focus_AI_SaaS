import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Task } from '../../features/api/apiSlice';
import { TaskCard } from '../TaskCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    color: string;
    count: number;
    onAdd: () => void;
}

export function KanbanColumn({ id, title, tasks, color, count, onAdd }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <div className="flex flex-col h-full flex-1 min-w-[280px] bg-black/20 rounded-xl border border-white/5">
            {/* Header */}
            <div className="p-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>
                        {title}
                    </span>
                    <span className="text-gray-500 text-xs font-medium">{count}</span>
                </div>
                <div className="flex gap-1">
                    <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10">...</button>
                    <button onClick={onAdd} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10"><Plus size={14} /></button>
                </div>
            </div>

            {/* List */}
            <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
            </div>

            {/* Footer / Quick Add */}
            <button
                onClick={onAdd}
                className="mx-2 mb-2 p-2 flex items-center gap-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm font-medium"
            >
                <Plus size={16} /> New page
            </button>
        </div>
    );
}
