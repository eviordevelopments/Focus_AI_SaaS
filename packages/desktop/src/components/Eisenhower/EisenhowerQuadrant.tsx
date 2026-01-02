import { useDroppable } from '@dnd-kit/core';
import { Plus, Check, X, ListPlus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EisenhowerItemCard } from './EisenhowerItemCard';
import { useState } from 'react';
import { Task } from '../../features/api/apiSlice';

interface EisenhowerQuadrantProps {
    id: string;
    title: string;
    description: string;
    items: Task[];
    onAdd?: (title: string) => void;
    onAddFromTasks?: () => void;
    onDeleteItem?: (id: string) => void;
    onUpdateItem?: (id: string, updates: any) => void;
    color: string;
}

export function EisenhowerQuadrant({ id, title, description, items, onAdd, onAddFromTasks, onDeleteItem, onUpdateItem, color }: EisenhowerQuadrantProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');

    const { setNodeRef } = useDroppable({
        id,
        data: {
            type: 'Quadrant',
        },
    });

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden group/quadrant shadow-xl min-h-[400px]">
            {/* Header */}
            <div className={`p-4 border-b border-white/5 bg-gradient-to-r ${color}`}>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
                    <div className="flex gap-1">
                        <button
                            onClick={onAddFromTasks}
                            className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all shadow-sm"
                            title="Add from existing tasks"
                        >
                            <ListPlus size={18} />
                        </button>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all shadow-sm"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-white/50 font-medium italic">{description}</p>
            </div>

            {/* Content Area */}
            <div
                ref={setNodeRef}
                className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar"
            >
                <SortableContext
                    id={id}
                    items={items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.length > 0 ? (
                        items.map(item => (
                            <EisenhowerItemCard
                                key={item.id}
                                item={item}
                                onDelete={onDeleteItem}
                                onUpdate={onUpdateItem}
                            />
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                            <Plus size={24} className="mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Drop here</span>
                        </div>
                    )}
                </SortableContext>
            </div>

            {/* Footer / Quick Add */}
            <div className="p-3 border-t border-white/5 bg-black/10 flex flex-col gap-2">
                {isAdding ? (
                    <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
                        <input
                            autoFocus
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newItemTitle.trim()) {
                                    onAdd?.(newItemTitle);
                                    setNewItemTitle('');
                                    setIsAdding(false);
                                } else if (e.key === 'Escape') {
                                    setIsAdding(false);
                                    setNewItemTitle('');
                                }
                            }}
                            placeholder="Type task title..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                        <div className="flex gap-1 justify-end">
                            <button
                                onClick={() => { setIsAdding(false); setNewItemTitle(''); }}
                                className="p-1 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    if (newItemTitle.trim()) {
                                        onAdd?.(newItemTitle);
                                        setNewItemTitle('');
                                        setIsAdding(false);
                                    }
                                }}
                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex-1 py-1.5 border border-dashed border-white/10 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all uppercase tracking-tighter"
                        >
                            + Quick task
                        </button>
                        <button
                            onClick={onAddFromTasks}
                            className="flex-1 py-1.5 border border-dashed border-white/10 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all uppercase tracking-tighter"
                        >
                            + From Tasks
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
