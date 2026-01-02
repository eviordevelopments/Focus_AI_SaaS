import { useState } from 'react';
import { useGetDecksQuery, useCreateDeckMutation, useCreateCardMutation, useGetDueCardsQuery } from '../features/api/apiSlice';
import { Plus, BookOpen, Layers } from 'lucide-react';
import { FlashcardSession } from './Learning/FlashcardSession';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function LearningView() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: decks } = useGetDecksQuery(user?.id);
    const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
    const [mode, setMode] = useState<'list' | 'review'>('list');

    // If reviewing
    const { data: dueCards } = useGetDueCardsQuery(selectedDeckId || '', { skip: !selectedDeckId || mode !== 'review' });

    const handleDeckClick = (id: string) => {
        setSelectedDeckId(id);
        setMode('review');
    };

    const handleSessionComplete = () => {
        setMode('list');
        setSelectedDeckId(null);
        // Ideally show summary
    };

    if (mode === 'review' && selectedDeckId) {
        if (!dueCards) return <div className="p-8 text-white">Loading cards...</div>;
        if (dueCards.length === 0) return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4 text-green-400"><Layers size={48} /></div>
                <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
                <p className="text-gray-400 mb-6">No cards due for review in this deck.</p>
                <button onClick={() => setMode('list')} className="px-6 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20">Back to Decks</button>

                {/* Temp Add Card for Testing */}
                <AddCardForm deckId={selectedDeckId} />
            </div>
        );

        return <FlashcardSession deckId={selectedDeckId} cards={dueCards} onComplete={handleSessionComplete} />;
    }

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-cyan-400" /> Learning Decks
                </h2>
                <CreateDeckButton userId={user?.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks?.length === 0 && (
                    <div className="text-gray-500 col-span-full text-center p-8">
                        No decks found. Create one to get started!
                    </div>
                )}
                {decks?.map((deck: any) => (
                    <div
                        key={deck.id}
                        onClick={() => handleDeckClick(deck.id)}
                        className="glass-panel p-6 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                    >
                        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors">{deck.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">{deck.description || 'No description'}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300">{deck.card_count || 0} Cards</span>
                            <span className="text-xs font-bold text-cyan-400">Review Now &rarr;</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CreateDeckButton({ userId }: { userId?: string }) {
    const [createDeck] = useCreateDeckMutation();
    const handleCreate = async () => {
        const title = prompt("Deck Title:");
        if (title && userId) await createDeck({ title, userId });
        if (title && !userId) alert("Error: User ID missing. Please relogin.");
    };
    return (
        <button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> New Deck
        </button>
    )
}

function AddCardForm({ deckId }: { deckId: string }) {
    const [createCard] = useCreateCardMutation();
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (front && back) {
            await createCard({ deckId, front, back });
            setFront(''); setBack('');
            alert("Card Added!");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8 p-4 bg-white/5 rounded-xl text-left w-full max-w-md">
            <h4 className="text-white font-bold mb-4">Add Test Card</h4>
            <input className="w-full mb-2 p-2 rounded bg-black/20 text-white" placeholder="Front" value={front} onChange={e => setFront(e.target.value)} />
            <input className="w-full mb-4 p-2 rounded bg-black/20 text-white" placeholder="Back" value={back} onChange={e => setBack(e.target.value)} />
            <button className="w-full bg-cyan-600 p-2 rounded text-white">Add Card</button>
        </form>
    )
}
