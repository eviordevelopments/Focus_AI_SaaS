import {
    Zap, Clock, Bot,
    FileText, Plus, ExternalLink,
    Play, Settings, MoreHorizontal
} from 'lucide-react';
import { Workflow, WorkflowStep } from '../../features/api/apiSlice';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface WorkflowBuilderProps {
    workflow: Workflow;
}

export default function WorkflowBuilder({ workflow }: WorkflowBuilderProps) {
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

    const stepTypes = [
        { type: 'app', icon: <ExternalLink size={18} />, label: 'App/URL', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { type: 'agent', icon: <Bot size={18} />, label: 'AI Agent', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { type: 'timer', icon: <Clock size={18} />, label: 'Timer', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { type: 'note', icon: <FileText size={18} />, label: 'Checklist', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { type: 'function', icon: <Zap size={18} />, label: 'Action', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="h-full flex flex-col relative group/canvas">
            {/* Visual Graph Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-black/40 rounded-[3rem] border border-white/5 relative shadow-inner">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                <div className="h-full flex items-center px-12 min-w-max">
                    <div className="flex items-center">
                        {/* Start Node */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 shadow-2xl">
                                <Play size={16} fill="currentColor" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">Start</span>
                        </div>

                        {/* Connection Line */}
                        <div className="w-12 h-px bg-gradient-to-r from-gray-800 to-indigo-500/30" />

                        {/* Steps */}
                        {workflow.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <StepNode
                                    step={step}
                                    index={index}
                                    isSelected={selectedStepId === step.id}
                                    onSelect={() => setSelectedStepId(step.id)}
                                />

                                <div className="flex flex-col items-center group/arrow">
                                    <div className="w-16 h-px bg-white/10 relative">
                                        <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover/arrow:opacity-100 transition-all hover:bg-white hover:text-black scale-75 group-hover/arrow:scale-100">
                                            <Plus size={14} />
                                        </button>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* End Node */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                                <Zap size={16} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500/50">XP Finish</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-3xl p-2 rounded-[2rem] border border-white/10 shadow-2xl z-20">
                <div className="px-4 text-[9px] font-black uppercase tracking-widest text-gray-500 border-r border-white/5 py-2 mr-2">Components</div>
                {stepTypes.map(st => (
                    <button
                        key={st.type}
                        className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                    >
                        <div className={`p-2 rounded-xl scale-75 ${st.bg} ${st.color} group-hover:scale-100 transition-transform`}>
                            {st.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{st.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function StepNode({ step, index, isSelected, onSelect }: { step: WorkflowStep, index: number, isSelected: boolean, onSelect: () => void }) {
    const icons: Record<string, any> = {
        app: <ExternalLink size={20} />,
        agent: <Bot size={20} />,
        timer: <Clock size={20} />,
        note: <FileText size={20} />,
        function: <Zap size={20} />
    };

    const colors: Record<string, string> = {
        app: 'text-blue-400',
        agent: 'text-purple-400',
        timer: 'text-amber-400',
        note: 'text-emerald-400',
        function: 'text-rose-400'
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`w-56 p-5 rounded-[2.5rem] border backdrop-blur-2xl transition-all cursor-pointer relative group/node ${isSelected ? 'bg-indigo-600/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/20' : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'}`}
            onClick={onSelect}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${colors[step.step_type]}`}>
                    {icons[step.step_type]}
                </div>
                <span className="text-[9px] font-black text-gray-600 group-hover/node:text-gray-400 transition-colors">#{index + 1}</span>
            </div>

            <h4 className="text-xs font-black text-white italic truncate uppercase tracking-tight mb-1">
                {step.config.title || step.step_type.charAt(0).toUpperCase() + step.step_type.slice(1)}
            </h4>

            <p className="text-[10px] text-gray-500 font-medium line-clamp-2 leading-relaxed h-8">
                {step.config.description || 'Protocol instruction pending...'}
            </p>

            <div className="mt-4 flex items-center justify-between opacity-0 group-hover/node:opacity-100 transition-opacity">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
                <MoreHorizontal size={14} className="text-gray-600" />
            </div>

            {isSelected && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-xl rotate-12">
                    <Settings size={14} />
                </div>
            )}
        </motion.div>
    );
}
