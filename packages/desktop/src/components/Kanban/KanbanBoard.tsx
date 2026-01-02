import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Task, useUpdateTaskMutation } from '../../features/api/apiSlice';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from '../TaskCard';
import { Filter, Layers } from 'lucide-react';

interface KanbanBoardProps {
    tasks: Task[];
}

type GroupBy = 'status' | 'priority';

interface ColumnDef {
    id: string;
    title: string;
    color: string;
    value?: number;
}

import { TaskFormModal } from '../TaskFormModal';

export function KanbanBoard({ tasks }: KanbanBoardProps) {
    const [groupBy, setGroupBy] = useState<GroupBy>('status');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ status?: any; priority?: number }>({});

    const [updateTask] = useUpdateTaskMutation();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement required to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Data Grouping ---
    const columns: ColumnDef[] = useMemo(() => {
        if (groupBy === 'status') {
            return [
                { id: 'todo', title: 'To Do', color: 'bg-gray-500/20 text-gray-300' },
                { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500/20 text-blue-300' },
                { id: 'done', title: 'Done', color: 'bg-green-500/20 text-green-300' }
            ];
        } else {
            return [
                { id: 'high', title: 'High Priority', color: 'bg-red-500/20 text-red-300', value: 5 },
                { id: 'medium', title: 'Medium Priority', color: 'bg-amber-500/20 text-amber-300', value: 3 },
                { id: 'low', title: 'No Priority', color: 'bg-gray-500/20 text-gray-300', value: 1 }
            ];
        }
    }, [groupBy]);

    const groupedTasks = useMemo(() => {
        const groups: Record<string, Task[]> = {};
        columns.forEach(col => groups[col.id] = []);

        tasks.forEach(task => {
            if (groupBy === 'status') {
                if (groups[task.status]) groups[task.status].push(task);
            } else {
                if (task.priority >= 4) groups['high'].push(task);
                else if (task.priority === 3) groups['medium'].push(task);
                else groups['low'].push(task);
            }
        });
        return groups;
    }, [tasks, groupBy, columns]);

    // --- Handlers ---

    function findContainer(id: string) {
        if (columns.find(c => c.id === id)) return id;

        // Find which group contains this task ID
        for (const [groupId, items] of Object.entries(groupedTasks)) {
            if (items.some(t => t.id === id)) return groupId;
        }
        return null;
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }
        // onDragOver is mostly for visual reordering during drag.
        // For now, handleDragEnd is where the real move happens.
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            console.log("No drop target found (over is null)");
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) {
            console.log("Could not determine containers:", { activeContainer, overContainer });
            return;
        }

        if (activeContainer !== overContainer) {
            const task = tasks.find(t => t.id === activeId);
            if (!task) return;

            // Determine new group
            const newGroupId = overContainer;

            // Optimistic / Real Update
            if (groupBy === 'status') {
                updateTask({ id: task.id, updates: { status: newGroupId as any } });
            } else if (groupBy === 'priority') {
                const pVal = columns.find(c => c.id === newGroupId)?.value;
                updateTask({ id: task.id, updates: { priority: pVal || 1 } });
            }
        }
    };

    const handleQuickAdd = (columnId: string) => {
        if (groupBy === 'status') {
            setModalConfig({ status: columnId as any });
        } else {
            const col = columns.find(c => c.id === columnId);
            setModalConfig({ priority: col?.value || 1 });
        }
        setIsModalOpen(true);
    };

    const handleNewTask = () => {
        setModalConfig({});
        setIsModalOpen(true);
    };

    const activeTask = tasks.find(t => t.id === activeId);

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 bg-black/30 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setGroupBy('status')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${groupBy === 'status' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Layers size={14} /> Status
                    </button>
                    <button
                        onClick={() => setGroupBy('priority')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${groupBy === 'priority' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Filter size={14} /> Priority
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleNewTask}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        New
                    </button>
                </div>
            </div>

            {/* Board Area */}
            {/* ... DnDContext logic ... */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto min-h-0">
                    <div className="flex h-full gap-4 pb-4">
                        {columns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                color={col.color}
                                tasks={groupedTasks[col.id]}
                                count={groupedTasks[col.id].length}
                                onAdd={() => handleQuickAdd(col.id)}
                            />
                        ))}
                    </div>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {/* Task Creation Modal */}
            <TaskFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialStatus={modalConfig.status}
                initialPriority={modalConfig.priority}
            />
        </div>
    );
}
