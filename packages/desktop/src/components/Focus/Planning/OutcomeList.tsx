import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { OutcomeCard } from './OutcomeCard';
import { useCreateOutcomeMutation, useUpdateOutcomeMutation, useDeleteOutcomeMutation } from '../../../features/api/apiSlice';
import { Reorder, AnimatePresence } from 'framer-motion';

interface OutcomeListProps {
    identityShiftId: string;
    outcomes: any[];
}

export function OutcomeList({ identityShiftId, outcomes }: OutcomeListProps) {
    const [createOutcome] = useCreateOutcomeMutation();
    const [updateOutcome] = useUpdateOutcomeMutation();
    const [deleteOutcome] = useDeleteOutcomeMutation();
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    // Local state for optimistic drag
    const [items, setItems] = useState(outcomes);

    useEffect(() => {
        setItems(outcomes);
    }, [outcomes]);

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        await createOutcome({
            identity_shift_id: identityShiftId,
            title: newTitle
        });
        setNewTitle('');
        setIsAdding(false);
    };

    const handleReorder = (newOrder: any[]) => {
        setItems(newOrder);
        // Here we would ideally debut/batch API calls to update order
        // For now, just local or trigger update
        // newOrder.forEach((item, index) => {
        //    if (item.order !== index) updateOutcome({ id: item.id, updates: { order: index } });
        // });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tactical Backcasting</h3>
                <span className="text-xs text-gray-500">{items.length} Outcomes</span>
            </div>

            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
                <AnimatePresence>
                    {items.map(outcome => (
                        <Reorder.Item key={outcome.id} value={outcome}>
                            <OutcomeCard
                                outcome={outcome}
                                onUpdate={(id, updates) => updateOutcome({ id, updates })}
                                onDelete={(id) => deleteOutcome(id)}
                            />
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            {isAdding ? (
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex gap-2">
                    <input
                        autoFocus
                        type="text"
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/20"
                        placeholder="Define a key result..."
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    />
                    <button onClick={handleCreate} className="text-green-400 hover:text-green-300">
                        <Plus size={18} />
                    </button>
                    <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white">
                        <Plus size={18} className="rotate-45" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-2"
                >
                    <Plus size={14} /> Add Quarterly Outcome
                </button>
            )}
        </div>
    );
}
