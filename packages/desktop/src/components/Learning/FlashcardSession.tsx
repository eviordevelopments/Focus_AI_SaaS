import { useState } from 'react';
import { useReviewCardMutation } from '../../features/api/apiSlice';
import { Repeat } from 'lucide-react';

export function FlashcardSession({ deckId, cards, onComplete }: { deckId: string, cards: any[], onComplete: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewCard] = useReviewCardMutation();

    const currentCard = cards[currentIndex];

    const handleRate = async (grade: number) => {
        await reviewCard({ cardId: currentCard.id, grade });

        setIsFlipped(false);
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    if (!currentCard) return <div>No cards loaded.</div>;

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
            <div className="w-full flex justify-between text-gray-400 mb-4 px-2">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span>{deckId}</span>
            </div>

            {/* Card Container */}
            <div
                className="relative w-full aspect-[3/2] cursor-pointer perspective-1000 group mb-8"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`w-full h-full relative preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden glass-panel rounded-3xl flex items-center justify-center p-12 text-center">
                        <h3 className="text-3xl font-medium text-white">{currentCard.front}</h3>
                        <div className="absolute bottom-6 text-xs text-gray-500 uppercase tracking-widest">Tap to Flip</div>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 glass-panel rounded-3xl flex items-center justify-center p-12 text-center bg-white/10">
                        <h3 className="text-2xl text-gray-200">{currentCard.back}</h3>
                    </div>
                </div>
            </div>

            {/* Controls */}
            {isFlipped ? (
                <div className="grid grid-cols-4 gap-4 w-full">
                    <RateButton label="Again" color="bg-red-500/20 text-red-400 hover:bg-red-500/40" onClick={() => handleRate(0)} />
                    <RateButton label="Hard" color="bg-orange-500/20 text-orange-400 hover:bg-orange-500/40" onClick={() => handleRate(3)} />
                    <RateButton label="Good" color="bg-green-500/20 text-green-400 hover:bg-green-500/40" onClick={() => handleRate(4)} />
                    <RateButton label="Easy" color="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40" onClick={() => handleRate(5)} />
                </div>
            ) : (
                <div className="h-14 flex items-center text-gray-500 italic">
                    <Repeat className="mr-2" size={16} /> Flip card to rate
                </div>
            )}
        </div>
    );
}

function RateButton({ label, color, onClick }: { label: string, color: string, onClick: () => void }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`py-3 rounded-xl font-bold transition-all ${color}`}
        >
            {label}
        </button>
    )
}
