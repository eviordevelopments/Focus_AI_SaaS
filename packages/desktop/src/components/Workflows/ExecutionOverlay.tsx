import { useState, useEffect } from 'react';
import {
    X, CheckCircle2, Play, Pause, RotateCcw,
    ChevronRight, Zap, Target, Trophy, Clock
} from 'lucide-react';
import { Workflow, useCompleteWorkflowRunMutation } from '../../features/api/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';

interface ExecutionOverlayProps {
    workflow: Workflow;
    runId: string;
    onClose: () => void;
}

export default function ExecutionOverlay({ workflow, runId, onClose }: ExecutionOverlayProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [runResult, setRunResult] = useState<any>(null);

    const [completeRun, { isLoading: isFinishing }] = useCompleteWorkflowRunMutation();

    const currentStep = workflow.steps[currentStepIndex];
    const progress = (completedSteps.length / workflow.steps.length) * 100;

    const handleCompleteStep = () => {
        if (!completedSteps.includes(currentStep.id)) {
            setCompletedSteps([...completedSteps, currentStep.id]);
        }

        if (currentStepIndex < workflow.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handleFinish = async () => {
        try {
            const result = await completeRun({
                runId,
                completed_steps: completedSteps,
                xp_earned: 0 // Server calculates now
            }).unwrap();
            setRunResult(result);
            setIsFinished(true);
        } catch (err) {
            console.error('Failed to complete run:', err);
            onClose(); // Fallback
        }
    };

    const handleExit = () => {
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center"
        >
            {/* Top Bar */}
            <div className="absolute top-0 w-full p-8 flex justify-between items-center z-10">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <Zap size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{workflow.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{Math.round(progress)}% Execution</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-all hover:scale-110 active:scale-95"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="w-full max-w-6xl h-full flex pt-32 pb-12 px-8 gap-12">
                {/* Left: Step List */}
                <div className="w-80 flex flex-col gap-4">
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Protocol Sequence</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                        {workflow.steps.map((step, idx) => {
                            const isPast = idx < currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <div
                                    key={step.id}
                                    className={`p-4 rounded-3xl border flex items-center gap-4 transition-all duration-500 ${isCurrent ? 'bg-white/10 border-indigo-500 shadow-2xl' : isPast ? 'bg-white/5 border-white/5 opacity-40' : 'bg-white/[0.02] border-white/5'}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${isPast ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                                        {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[11px] font-black uppercase tracking-tight truncate ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                                            {step.config.title || step.step_type}
                                        </div>
                                    </div>
                                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Center: Execution Card */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isFinished ? (
                            <motion.div
                                key="finished"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-2xl glass-panel bg-white/5 border-white/10 p-12 rounded-[4rem] text-center space-y-8 relative overflow-hidden"
                            >
                                <div className="w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Trophy size={64} className="text-indigo-400" />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Protocol Completed</h2>
                                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                        You've successfully executed the system. Entropy reduced.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 py-6 w-full max-w-sm mx-auto">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">XP Secured</div>
                                        <div className="text-3xl font-black text-white">+{runResult?.xp || 0}</div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Streak</div>
                                        <div className="text-3xl font-black text-white">{runResult?.streak?.current || 0}d</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleExit}
                                    className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase tracking-[0.4em] text-xs hover:scale-[1.02] transition-all"
                                >
                                    Log Results & Exit
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentStep.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="w-full max-w-2xl glass-panel bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 p-12 rounded-[4rem] flex flex-col gap-12 relative"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-6">
                                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                            <StepIcon type={currentStep.step_type} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{currentStep.step_type} protocol</span>
                                            <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mt-2">{currentStep.config.title || 'Untitled Step'}</h3>
                                        </div>
                                    </div>
                                </div>

                                {currentStep.step_type === 'timer' ? (
                                    <TimerWorkspace duration={currentStep.config.duration || 25} onComplete={handleCompleteStep} />
                                ) : (
                                    <div className="flex-1 space-y-8">
                                        <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 min-h-[12rem] flex items-center justify-center text-center">
                                            <p className="text-xl font-medium text-gray-300 italic">
                                                "{currentStep.config.instruction || 'Execution pending. Ready for next procedure.'}"
                                            </p>
                                        </div>

                                        <div className="flex gap-4">
                                            {currentStep.config.url && (
                                                <button
                                                    onClick={() => window.open(currentStep.config.url, '_blank')}
                                                    className="flex-1 py-6 bg-white/10 hover:bg-white/20 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 border border-white/5"
                                                >
                                                    <Play size={16} fill="currentColor" />
                                                    Launch External
                                                </button>
                                            )}
                                            <button
                                                onClick={handleFinish}
                                                disabled={isFinishing}
                                                className="flex-1 py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.02] disabled:opacity-50"
                                            >
                                                {isFinishing ? 'Processing...' : 'Complete Sequence'}
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

function TimerWorkspace({ duration, onComplete }: { duration: number, onComplete: () => void }) {
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="text-[12rem] font-black tracking-tighter text-white tabular-nums drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] leading-none">
                {String(minutes).padStart(2, '0')}<span className="text-indigo-500">:</span>{String(seconds).padStart(2, '0')}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white/10 text-white' : 'bg-white text-black'}`}
                >
                    {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                </button>
                <button
                    onClick={() => setTimeLeft(duration * 60)}
                    className="w-24 h-24 rounded-full bg-white/5 text-gray-500 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                >
                    <RotateCcw size={32} />
                </button>
            </div>
        </div>
    );
}

function StepIcon({ type }: { type: string }) {
    switch (type) {
        case 'app': return <Play size={32} className="text-blue-400" />;
        case 'agent': return <Zap size={32} className="text-purple-400" fill="currentColor" />;
        case 'timer': return <Clock size={32} className="text-amber-400" />;
        case 'note': return <Target size={32} className="text-emerald-400" />;
        default: return <ChevronRight size={32} className="text-gray-400" />;
    }
}
