import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, useDeleteTaskMutation, useDeleteHabitMutation, useDeleteSystemMutation } from '../features/api/apiSlice';
import { FileText, Trash2 } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
    const [deleteTask] = useDeleteTaskMutation();
    const [deleteHabit] = useDeleteHabitMutation();
    const [deleteSystem] = useDeleteSystemMutation();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    // Derived Styles
    const priorityColor = task.priority >= 4 ? 'bg-red-500/10 text-red-400' :
        task.priority === 3 ? 'bg-amber-500/10 text-amber-400' :
            'bg-gray-500/10 text-gray-400';

    const priorityLabel = task.priority >= 4 ? 'High Priority' :
        task.priority === 3 ? 'Medium Priority' : 'No Priority';

    // Status Badge
    const statusConfig = {
        todo: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'To Do' },
        in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress' },
        done: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Done' }
    };
    const s = statusConfig[task.status] || statusConfig.todo;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (task.is_habit) {
            deleteHabit(task.original_id || '');
        } else if (task.is_system) {
            deleteSystem(task.original_id || '');
        } else {
            deleteTask(task.id);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                group relative flex flex-col gap-2 p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing
                ${isOverlay
                    ? 'bg-[#1e1e2e] border-indigo-500/50 shadow-2xl rotate-2 scale-105 z-50'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 shadow-sm'
                }
            `}
        >
            {/* Header / Badges */}
            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider justify-between items-start">
                <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-md ${priorityColor}`}>
                        {priorityLabel}
                    </span>
                    {task.is_habit && <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">Habit</span>}
                    {task.is_system && <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">Event</span>}
                </div>
                {!isOverlay && (
                    <button 
                        onClick={handleDelete}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100 z-10"
                        title="Delete"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Title */}
            <div className="flex items-start gap-2">
                <span className="mt-0.5 text-gray-500"><FileText size={14} /></span>
                <h3 className="text-sm font-medium text-gray-200 leading-snug pr-4">
                    {task.title}
                </h3>
            </div>

            {/* Footer / Meta */}
            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    {task.due_date && <span>{new Date(task.due_date).toLocaleDateString()}</span>}
                </div>

                {/* Status indicator (Dot) */}
                <div className={`text-[10px] px-2 py-0.5 rounded-full ${s.bg} ${s.text} flex items-center gap-1`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {s.label}
                </div>
            </div>
        </div>
    );
}
