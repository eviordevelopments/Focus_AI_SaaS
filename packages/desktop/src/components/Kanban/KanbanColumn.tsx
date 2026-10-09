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
        <div className="flex flex-col h-full flex-1 min-w-[280px] bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${color}`}>
                        {title}
                    </span>
                    <span className="text-gray-500 text-xs font-medium">{count}</span>
                </div>
            </div>

            {/* List */}
            <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
