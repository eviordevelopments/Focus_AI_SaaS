import { motion, Reorder } from 'framer-motion';
import { Plus, MoreHorizontal, Calendar, Hash, Target } from 'lucide-react';

interface KanbanViewProps {
    projects: any[];
    tasks: any[];
    onAddTask?: (status: string) => void;
    onAddProject?: (status: string) => void;
    onItemClick?: (type: 'project' | 'task' | 'habit', item: any) => void;
}

const COLUMNS = [
    { id: 'planning', label: 'Planning', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'active', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'completed', label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

export function KanbanView({ projects, tasks, onAddTask, onAddProject, onItemClick }: KanbanViewProps) {
    return (
        <div className="flex gap-6 min-h-full pb-8 overflow-x-auto custom-scrollbar">
            {COLUMNS.map(col => {
                const colProjects = projects.filter(p => p.status === col.id);
                const colTasks = tasks.filter(t => t.status === (col.id === 'active' ? 'in_progress' : col.id === 'completed' ? 'done' : 'todo'));

                return (
                    <div key={col.id} className="w-80 flex-shrink-0 flex flex-col gap-4">
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${col.bg.replace('/10', '')}`} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    {col.label}
                                    <span className="ml-2 text-gray-700">{colProjects.length + colTasks.length}</span>
                                </h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onAddTask?.(col.id === 'active' ? 'in_progress' : col.id === 'completed' ? 'done' : 'todo')}
                                    className="p-1.5 hover:bg-white/5 rounded-md text-gray-600 hover:text-white transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                                <button className="p-1.5 hover:bg-white/5 rounded-md text-gray-600 hover:text-white transition-colors">
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Column Content */}
                        <div className="flex-1 space-y-3">
                            {/* Projects */}
                            {colProjects.map(project => (
                                <KanbanCard
                                    key={project.id}
                                    type="project"
                                    title={project.name}
                                    progress={project.progress}
                                    icon={<Target size={14} />}
                                    onClick={() => onItemClick?.('project', project)}
                                />
                            ))}

                            {/* Tasks */}
                            {colTasks.map(task => (
                                <KanbanCard
                                    key={task.id}
                                    type="task"
                                    title={task.title}
                                    priority={task.priority}
                                    icon={<Hash size={14} />}
                                    onClick={() => onItemClick?.('task', task)}
                                />
                            ))}

                            <button
                                onClick={() => onAddProject?.(col.id)}
                                className="w-full py-3 rounded-2xl border border-dashed border-white/5 hover:border-white/20 hover:bg-white/[0.02] text-[10px] font-bold text-gray-600 hover:text-gray-400 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Plus size={12} className="group-hover:scale-110 transition-transform" />
                                NEW PAGE
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function KanbanCard({ title, type, progress, priority, icon, onClick }: any) {
    return (
        <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            onClick={onClick}
            className={`
                group glass-panel p-4 rounded-[20px] border border-white/5 bg-white/[0.03] 
                hover:border-white/10 hover:bg-white/[0.05] shadow-lg transition-all cursor-pointer
                relative overflow-hidden
            `}
        >
            {/* Type Indicator */}
            <div className="flex items-center justify-between mb-3">
                <div className={`p-1.5 rounded-lg flex items-center justify-center ${type === 'project' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    {icon}
                </div>
                {type === 'task' && priority && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">
                        P{priority}
                    </span>
                )}
            </div>

            <h4 className="text-[13px] font-bold text-white tracking-tight leading-snug group-hover:text-white/90">
                {title}
            </h4>

            {type === 'project' && progress !== undefined && (
                <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress * 100}%` }}
                            className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                </div>
            )}

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}
