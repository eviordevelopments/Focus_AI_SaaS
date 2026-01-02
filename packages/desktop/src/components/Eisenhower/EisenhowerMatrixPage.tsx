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
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import {
    useGetEisenhowerSnapshotQuery,
    useUpsertEisenhowerItemMutation,
    useUpdateEisenhowerItemMutation,
    useBatchUpdateEisenhowerItemsMutation,
    useDeleteEisenhowerItemMutation
} from '../../features/api/apiSlice';
import { EisenhowerQuadrant } from './EisenhowerQuadrant';
import { EisenhowerItemCard } from './EisenhowerItemCard';
import { TaskSelectionModal } from './TaskSelectionModal';

const QUADRANTS = [
    { id: 'Q1_DO', title: 'Do now', sub: 'Urgent & Important', color: 'from-rose-500/20 to-transparent', hint: 'Crisis & deadlines. Tackle these immediately.' },
    { id: 'Q2_SCHEDULE', title: 'Schedule', sub: 'Important, Not Urgent', color: 'from-blue-500/20 to-transparent', hint: 'Focus & goals. Schedule time for these.' },
    { id: 'Q3_DELEGATE', title: 'Delegate', sub: 'Urgent, Not Important', color: 'from-amber-500/20 to-transparent', hint: 'Busywork. Who can help with these?' },
    { id: 'Q4_DELETE', title: 'Delete', sub: 'Not Urgent or Important', color: 'from-gray-500/20 to-transparent', hint: 'Distractions. Why are these here?' }
];

export function EisenhowerMatrixPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const { data: snapshot, isLoading } = useGetEisenhowerSnapshotQuery(selectedDate);
    const [upsertItem] = useUpsertEisenhowerItemMutation();
    const [updateItem] = useUpdateEisenhowerItemMutation();
    const [batchUpdate] = useBatchUpdateEisenhowerItemsMutation();
    const [deleteItem] = useDeleteEisenhowerItemMutation();

    // Date navigation helpers
    const changeDate = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const [activeId, setActiveId] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [targetQuadrant, setTargetQuadrant] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const itemsByQuadrant = useMemo(() => {
        const groups: Record<string, any[]> = { Q1_DO: [], Q2_SCHEDULE: [], Q3_DELEGATE: [], Q4_DELETE: [] };
        if (snapshot?.items) {
            snapshot.items.forEach((item: any) => {
                if (groups[item.quadrant]) groups[item.quadrant].push(item);
            });
        }
        // Sort by position
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => a.position - b.position);
        });
        return groups;
    }, [snapshot]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeItem = snapshot.items.find((i: any) => i.id === activeId);
        if (!activeItem) return;

        // Find container of 'over'
        let overQuadrant = QUADRANTS.find(q => q.id === overId)?.id;
        if (!overQuadrant) {
            const overItem = snapshot.items.find((i: any) => i.id === overId);
            if (overItem) overQuadrant = overItem.quadrant;
        }

        if (!overQuadrant) return;

        if (activeItem.quadrant !== overQuadrant || activeId !== overId) {
            // Reordering logic
            const oldIndex = itemsByQuadrant[activeItem.quadrant].findIndex(i => i.id === activeId);
            const newIndex = overQuadrant === activeItem.quadrant
                ? itemsByQuadrant[overQuadrant].findIndex(i => i.id === overId)
                : itemsByQuadrant[overQuadrant].length;

            if (activeItem.quadrant === overQuadrant) {
                // Same quadrant reorder
                const newItems = arrayMove(itemsByQuadrant[overQuadrant], oldIndex, newIndex);
                const batch = newItems.map((item, idx) => ({ id: item.id, quadrant: overQuadrant, position: idx }));
                batchUpdate({ items: batch, date: selectedDate });
            } else {
                // Change quadrant
                updateItem({ id: activeId, updates: { quadrant: overQuadrant, position: newIndex }, date: selectedDate });
            }
        }
    };

    const handleAddQuickItem = async (quadrant: string, title?: string) => {
        const activeTitle = title || prompt("Task title:");
        if (!activeTitle) return;
        try {
            await upsertItem({ title: activeTitle, quadrant, date: selectedDate }).unwrap();
        } catch (err) {
            console.error('Failed to add Eisenhower item:', err);
        }
    };

    const handleOpenTaskSelection = (quadrant: string) => {
        setTargetQuadrant(quadrant);
        setIsTaskModalOpen(true);
    };

    const handleSelectTask = async (task: any) => {
        if (targetQuadrant) {
            try {
                await upsertItem({
                    title: task.title,
                    description: task.description,
                    quadrant: targetQuadrant,
                    task_id: task.id,
                    date: selectedDate
                }).unwrap();
            } catch (err) {
                console.error('Failed to attach task:', err);
            }
        }
        setIsTaskModalOpen(false);
    };

    if (isLoading) return <div className="p-8 text-white/50 animate-pulse">Loading Matrix...</div>;

    const activeItem = snapshot?.items?.find((i: any) => i.id === activeId);

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-blue-400" size={24} />
                        Daily Eisenhower Matrix
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Master your priority by classifying urgency vs. importance.</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl px-4">
                    <button
                        onClick={() => changeDate(-1)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 font-bold text-sm text-blue-400 uppercase tracking-widest">
                        <Calendar size={16} />
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button
                        onClick={() => changeDate(1)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Matrix Grid */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                    {QUADRANTS.map(q => (
                        <EisenhowerQuadrant
                            key={q.id}
                            id={q.id}
                            title={q.title}
                            description={q.sub}
                            items={itemsByQuadrant[q.id]}
                            color={q.color}
                            onAdd={(title) => handleAddQuickItem(q.id, title)}
                            onAddFromTasks={() => handleOpenTaskSelection(q.id)}
                            onDeleteItem={(id) => deleteItem({ id, date: selectedDate })}
                            onUpdateItem={(id, updates) => updateItem({ id, updates, date: selectedDate })}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                    {activeItem ? <EisenhowerItemCard item={activeItem} isOverlay /> : null}
                </DragOverlay>

                <TaskSelectionModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSelect={handleSelectTask}
                />
            </DndContext>

            {/* Quick Ritual Banner (Only if first time / empty) */}
            {snapshot?.items?.length === 0 && (
                <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-transparent border border-white/10 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">Let's plan your day.</h4>
                            <p className="text-gray-400 text-sm">Drop your tasks into the 4 quadrants to choose what truly matters.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
