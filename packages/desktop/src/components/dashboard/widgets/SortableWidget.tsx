import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableWidgetProps {
    id: string;
    children: React.ReactNode;
}

export const SortableWidget = ({ id, children }: SortableWidgetProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="h-[250px] relative group/drag">
            {/* Drag Handle */}
            <div 
                {...attributes} 
                {...listeners}
                className="absolute top-4 right-10 z-10 p-1 opacity-0 group-hover/drag:opacity-100 cursor-grab active:cursor-grabbing text-white/30 hover:text-white bg-black/20 hover:bg-black/40 rounded transition-all"
                title="Drag to reorder"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
            </div>
            
            {children}
        </div>
    );
};
