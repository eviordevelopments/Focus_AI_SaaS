import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { addWidget, setWidgetSelectorOpen, DashboardWidgetType } from '../../../features/ui/dashboardSlice';
import { Bot, Network, Calendar, Lightbulb, FileText, Plus } from 'lucide-react';

const WIDGET_OPTIONS: { id: DashboardWidgetType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'ai-insights', label: 'AI Insights', icon: <Lightbulb size={18} className="text-amber-400" />, desc: 'AI-driven analysis of your workflow.' },
    { id: 'agents-shortcut', label: 'AI Agents', icon: <Bot size={18} className="text-cyan-400" />, desc: 'Shortcut to manage your agents.' },
    { id: 'automations-shortcut', label: 'Automations', icon: <Network size={18} className="text-purple-400" />, desc: 'Shortcut to your automations.' },
    { id: 'gantts-shortcut', label: 'Gantt Planning', icon: <Calendar size={18} className="text-emerald-400" />, desc: 'Shortcut to project timelines.' },
    { id: 'recent-notes', label: 'Recent Notes', icon: <FileText size={18} className="text-blue-400" />, desc: 'Quick view of your notes.' },
];

export const WidgetSelectorPanel = () => {
    const dispatch = useDispatch();
    const { isWidgetSelectorOpen } = useSelector((state: RootState) => state.dashboard);

    if (!isWidgetSelectorOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 z-40" 
                onClick={() => dispatch(setWidgetSelectorOpen(false))}
            />
            <div className="absolute top-16 right-0 w-80 bg-[#1a1a24]/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="grid grid-cols-1 gap-2">
                    {WIDGET_OPTIONS.map(option => (
                        <button
                            key={option.id}
                            onClick={() => {
                                dispatch(addWidget(option.id));
                                dispatch(setWidgetSelectorOpen(false));
                            }}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left group"
                        >
                            <div className="mt-0.5">{option.icon}</div>
                            <div className="flex-1">
                                <div className="text-white font-medium mb-0.5">{option.label}</div>
                                <div className="text-xs text-white/50">{option.desc}</div>
                            </div>
                            <Plus size={16} className="text-white/30 group-hover:text-white/80 mt-2" />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
