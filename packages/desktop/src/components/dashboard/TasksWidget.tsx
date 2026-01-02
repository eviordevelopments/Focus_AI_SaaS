import GlassCard from '../ui/GlassCard';
import { CheckCircle2, Circle } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    status: string;
}

interface TasksWidgetProps {
    tasks: Task[];
    onToggle: (task: Task) => void;
}

export default function TasksWidget({ tasks, onToggle }: TasksWidgetProps) {
    const doneCount = tasks.filter(t => t.status === 'done').length;

    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Today's Tasks</h3>
                <span className="text-xs text-gray-400">{doneCount}/{tasks.length} done</span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <p className="text-sm text-gray-400">All tasks completed!</p>
                    </div>
                )}

                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => onToggle(task)}
                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                    >
                        {task.status === 'done' ? (
                            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                        ) : (
                            <Circle className="text-gray-500 group-hover:text-emerald-400 shrink-0 transition-colors" size={20} />
                        )}
                        <span className={`text-sm truncate ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                            {task.title}
                        </span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
