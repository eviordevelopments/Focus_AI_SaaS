import { X, Search, CheckCircle2 } from 'lucide-react';
import { useGetTasksQuery } from '../../features/api/apiSlice';
import { useState } from 'react';

interface TaskSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (task: any) => void;
}

export function TaskSelectionModal({ isOpen, onClose, onSelect }: TaskSelectionModalProps) {
    const { data: tasks = [], isLoading } = useGetTasksQuery();
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) &&
        t.status !== 'done'
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-gray-900/90 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">Attach Task</h3>
                        <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-widest font-bold">From Main Task List</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-black/20">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-10 text-center text-gray-500 text-xs animate-pulse">Loading tasks...</div>
                    ) : filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <button
                                key={task.id}
                                onClick={() => onSelect(task)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group active:scale-95"
                            >
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{task.title}</div>
                                    <div className="text-[10px] text-gray-500 truncate">{task.description || 'No description'}</div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-10 text-center text-gray-500 text-xs italic">No matching tasks found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
