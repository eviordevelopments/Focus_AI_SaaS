import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Trophy } from 'lucide-react';

interface Question {
    q: string;
    options: string[];
    answer: number;
    explanation?: string;
}

interface QuizProps {
    title: string;
    questions: Question[];
}

export const InteractiveQuiz: React.FC<QuizProps> = ({ title, questions }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === questions[currentQuestion].answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    const handleRetry = () => {
        setCurrentQuestion(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResults(false);
    };

    if (!questions || questions.length === 0) return <div>Invalid Quiz Data</div>;

    if (showResults) {
        return (
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <Trophy size={48} className="text-yellow-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h3>
                <p className="text-white/70 mb-6">You scored {score} out of {questions.length}</p>
                
                <div className="w-full bg-white/5 h-2 rounded-full mb-6 overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(score / questions.length) * 100}%` }}
                    />
                </div>

                <button 
                    onClick={handleRetry}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                >
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const isCorrect = selectedOption === question.answer;

    return (
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl w-full max-w-2xl mx-auto flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{title || "Interactive Quiz"}</h3>
                <span className="text-sm font-medium text-white/50 bg-white/5 px-3 py-1 rounded-full">
                    {currentQuestion + 1} / {questions.length}
                </span>
            </div>

            <div className="mb-8">
                <p className="text-[17px] text-white/90 leading-relaxed font-medium">
                    {question.q}
                </p>
            </div>

            <div className="flex flex-col gap-3 flex-grow">
                {question.options.map((opt, idx) => {
                    let btnClass = "bg-white/5 hover:bg-white/10 border-white/10 text-white/80";
                    let icon: React.ReactNode = null;

                    if (isAnswered) {
                        if (idx === question.answer) {
                            btnClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
                            icon = <CheckCircle2 size={18} />;
                        } else if (idx === selectedOption) {
                            btnClass = "bg-red-500/10 border-red-500/50 text-red-400";
                            icon = <XCircle size={18} />;
                        } else {
                            btnClass = "bg-white/5 border-white/5 text-white/30 opacity-50";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={isAnswered}
                            className={`flex justify-between items-center text-left w-full px-5 py-4 rounded-xl border transition-all duration-200 ${btnClass} ${!isAnswered ? 'active:scale-[0.98]' : ''}`}
                        >
                            <span className="text-[15px]">{opt}</span>
                            {icon}
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <div className="mt-8 pt-6 border-t border-white/10 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    {question.explanation && (
                        <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-emerald-500/10 text-emerald-400/90' : 'bg-red-500/10 text-red-400/90'}`}>
                            <p className="text-[14px] leading-relaxed">
                                <span className="font-bold block mb-1">{isCorrect ? 'Correct!' : 'Incorrect.'}</span>
                                {question.explanation}
                            </p>
                        </div>
                    )}
                    <button
                        onClick={handleNext}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
                    </button>
                </div>
            )}
        </div>
    );
};
