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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Today's Tasks</h3>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{doneCount}/{tasks.length} done</span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-emerald-400 border border-white/5 shadow-xl shadow-emerald-500/5">
                            <CheckCircle2 size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">All protocols executed</p>
                    </div>
                )}

                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => onToggle(task)}
                        className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                    >
                        <div className="shrink-0">
                            {task.status === 'done' ? (
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle2 size={16} />
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 border border-white/5 group-hover:border-indigo-500/20 transition-all">
                                    <Circle size={16} />
                                </div>
                            )}
                        </div>
                        <span className={`text-[13px] font-bold truncate flex-1 transition-colors ${task.status === 'done' ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-white'}`}>
                            {task.title}
                        </span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
