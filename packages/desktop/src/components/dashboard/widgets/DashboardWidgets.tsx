import React from 'react';
import GlassCard from '../../ui/GlassCard';
import { Bot, Network, Calendar, Lightbulb, FileText, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { removeWidget } from '../../../features/ui/dashboardSlice';

interface DashboardWidgetProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export const WidgetContainer: React.FC<DashboardWidgetProps> = ({ id, title, icon, children }) => {
    const dispatch = useDispatch();

    return (
        <GlassCard className="relative overflow-hidden group h-full flex flex-col hover:border-white/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-white/90">
                    {icon}
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <button 
                    onClick={() => dispatch(removeWidget(id))}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all text-white/50 hover:text-white"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
                {children}
            </div>
        </GlassCard>
    );
};

export const DashboardAgentsShortcut = ({ id }: { id: string }) => (
    <WidgetContainer id={id} title="AI Agents" icon={<Bot size={18} className="text-cyan-400" />}>
        <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <p className="text-sm text-white/70">Manage your autonomous crew.</p>
            <button className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-medium transition-colors">
                Open Studio
            </button>
        </div>
    </WidgetContainer>
);

export const DashboardAutomationsShortcut = ({ id }: { id: string }) => (
    <WidgetContainer id={id} title="Automations" icon={<Network size={18} className="text-purple-400" />}>
        <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <p className="text-sm text-white/70">Connect apps and streamline workflows.</p>
            <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium transition-colors">
                View Automations
            </button>
        </div>
    </WidgetContainer>
);

export const DashboardGanttShortcut = ({ id }: { id: string }) => (
    <WidgetContainer id={id} title="Gantt Planning" icon={<Calendar size={18} className="text-emerald-400" />}>
        <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <p className="text-sm text-white/70">Visualize project timelines.</p>
            <button className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors">
                Open Gantt
            </button>
        </div>
    </WidgetContainer>
);

export const DashboardRecentNotes = ({ id }: { id: string }) => {
    // We would normally select notes from Redux here
    return (
        <WidgetContainer id={id} title="Recent Notes" icon={<FileText size={18} className="text-blue-400" />}>
            <div className="flex flex-col gap-2">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-white/80">
                    <div className="font-semibold text-white mb-1">Project Ideas</div>
                    Need to add RAG pipeline for local files.
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-white/80">
                    <div className="font-semibold text-white mb-1">AI Insight</div>
                    "Use dnd-kit for accessible drag and drop."
                </div>
            </div>
        </WidgetContainer>
    );
};

export const DashboardAIInsights = ({ id }: { id: string }) => (
    <WidgetContainer id={id} title="AI Insights" icon={<Lightbulb size={18} className="text-amber-400" />}>
        <div className="flex flex-col gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200/90 text-sm">
                Based on your recent activity, you're most productive between 10 AM and 1 PM. Consider scheduling deep work tasks during this window.
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm">
                You've completed 80% of your Focus AI SaaS milestones. Keep it up!
            </div>
        </div>
    </WidgetContainer>
);
