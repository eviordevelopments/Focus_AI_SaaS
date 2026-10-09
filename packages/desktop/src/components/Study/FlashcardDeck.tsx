import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardDeckProps {
    title: string;
    cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ title, cards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) return <div>Invalid Flashcard Data</div>;

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : prev));
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }, 150);
    };

    return (
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-2xl mx-auto flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 perspective-1000">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{title || "Flashcards"}</h3>
                <span className="text-sm font-medium text-white/50 bg-white/5 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {cards.length}
                </span>
            </div>

            <div 
                className="relative flex-grow min-h-[300px] w-full cursor-pointer group perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div 
                    className={`absolute inset-0 w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div 
                        className="absolute inset-0 w-full h-full backface-hidden bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center justify-center text-center shadow-lg"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <p className="text-2xl font-bold text-white/90 leading-relaxed">{cards[currentIndex].front}</p>
                        <div className="absolute bottom-4 right-4 text-white/30 flex items-center gap-2 text-sm font-medium group-hover:text-white/50 transition-colors">
                            <RotateCcw size={14} /> Click to flip
                        </div>
                    </div>

                    {/* Back */}
                    <div 
                        className="absolute inset-0 w-full h-full backface-hidden bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-8 flex items-center justify-center text-center shadow-lg rotate-y-180"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <p className="text-xl font-medium text-indigo-100 leading-relaxed">{cards[currentIndex].back}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 px-4 py-2 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
                >
                    <ChevronLeft size={18} /> Previous
                </button>
                <div className="flex gap-1">
                    {cards.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 px-4 py-2 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
                >
                    Next <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};
