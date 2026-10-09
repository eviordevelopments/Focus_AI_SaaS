import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { reorderWidgets, toggleWidgetSelector } from '../../features/ui/dashboardSlice';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { Plus } from 'lucide-react';
import { WidgetSelectorPanel } from './widgets/WidgetSelectorPanel';
import { SortableWidget } from './widgets/SortableWidget';
import {
    DashboardAIInsights,
    DashboardAgentsShortcut,
    DashboardAutomationsShortcut,
    DashboardGanttShortcut,
    DashboardRecentNotes
} from './widgets/DashboardWidgets';

export default function Dashboard() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { activeWidgets } = useSelector((state: RootState) => state.dashboard);
    const dispatch = useDispatch();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = activeWidgets.findIndex(w => w.id === active.id);
            const newIndex = activeWidgets.findIndex(w => w.id === over.id);
            
            dispatch(reorderWidgets(arrayMove(activeWidgets, oldIndex, newIndex)));
        }
    };

    const renderWidget = (widget: { id: string; type: string }) => {
        switch (widget.type) {
            case 'ai-insights': return <DashboardAIInsights id={widget.id} />;
            case 'agents-shortcut': return <DashboardAgentsShortcut id={widget.id} />;
            case 'automations-shortcut': return <DashboardAutomationsShortcut id={widget.id} />;
            case 'gantts-shortcut': return <DashboardGanttShortcut id={widget.id} />;
            case 'recent-notes': return <DashboardRecentNotes id={widget.id} />;
            default: return null;
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar relative px-8 py-10 pb-32">
            
            {/* Header Section */}
            <div className="flex items-start justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">
                        What are we focusing on today, <span className="text-indigo-400">{user?.name?.split(' ')[0] || 'Agent'}</span>?
                    </h1>
                    <p className="text-white/50 mt-2 text-lg">Customize your workspace by dragging and dropping your favorite tools.</p>
                </div>
                
                {/* Floating Add Widget Button */}
                <div className="relative">
                    <button 
                        onClick={() => dispatch(toggleWidgetSelector())}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                    
                    <WidgetSelectorPanel />
                </div>
            </div>

            {/* Draggable Widgets Grid */}
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <SortableContext 
                        items={activeWidgets.map(w => w.id)}
                        strategy={rectSortingStrategy}
                    >
                        {activeWidgets.map(widget => (
                            <SortableWidget key={widget.id} id={widget.id}>
                                {renderWidget(widget)}
                            </SortableWidget>
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
            
            {activeWidgets.length === 0 && (
                <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl mt-12 text-white/30 bg-white/5 backdrop-blur-md transition-all">
                    <Plus size={48} className="mb-4 opacity-50" />
                    <p>No active widgets.</p>
                    <button 
                        onClick={() => dispatch(toggleWidgetSelector())}
                        className="mt-4 text-indigo-400 font-medium hover:text-indigo-300"
                    >
                        Add a widget
                    </button>
                </div>
            )}
        </div>
    );
}
