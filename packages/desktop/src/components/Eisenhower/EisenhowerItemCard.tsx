import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface EisenhowerItemCardProps {
    item: any;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, updates: any) => void;
    isOverlay?: boolean;
}

export function EisenhowerItemCard({ item, onDelete, onUpdate, isOverlay }: EisenhowerItemCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(item.title);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: item.id,
        disabled: isEditing,
        data: {
            type: 'Item',
            item,
        }
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
    };

    const handleSave = () => {
        if (editTitle.trim() && editTitle !== item.title) {
            onUpdate?.(item.id, { title: editTitle });
        }
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group bg-white/5 border border-white/10 rounded-xl p-3 shadow-sm hover:border-white/20 transition-all ${isOverlay ? 'shadow-2xl ring-2 ring-blue-500/50 bg-gray-900/90' : ''}`}
        >
            <div className="flex items-start gap-2">
                {!isEditing && (
                    <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                        <GripVertical size={14} />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') { setIsEditing(false); setEditTitle(item.title); }
                            }}
                            className="w-full bg-white/10 border border-blue-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                        />
                    ) : (
                        <div className="flex items-center gap-2 mb-1">
                            <h4
                                className="text-sm font-semibold text-white truncate cursor-text hover:text-blue-400 transition-colors"
                                onClick={() => setIsEditing(true)}
                            >
                                {item.title}
                            </h4>
                            {item.task_id && (
                                <span className="shrink-0 text-[8px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold uppercase tracking-wider border border-blue-500/20">
                                    Task
                                </span>
                            )}
                        </div>
                    )}
                    {!isEditing && item.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                    )}
                </div>

                {!isEditing && (
                    <button
                        onClick={() => onDelete?.(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-lg transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
