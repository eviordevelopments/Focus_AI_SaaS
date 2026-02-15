import { useState } from 'react';
import {
    Plus, Play, Workflow as WorkflowIcon
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
    useGetWorkflowsQuery,
    useGetAreasQuery,
    useStartWorkflowRunMutation
} from '../../features/api/apiSlice';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowSidebar from './WorkflowSidebar';
import WorkflowInspector from './WorkflowInspector';
import ExecutionOverlay from './ExecutionOverlay';
import SmartSuggestions from './SmartSuggestions';

export default function WorkflowsPage() {
    const { data: workflows = [] } = useGetWorkflowsQuery();
    const { data: areas = [] } = useGetAreasQuery();

    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'manual' | 'block'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeAreaId, setActiveAreaId] = useState<string | null>(null);
    const [showInspector, setShowInspector] = useState(false);
    const [activeRunId, setActiveRunId] = useState<string | null>(null);

    const [startRun] = useStartWorkflowRunMutation();

    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);

    const filteredWorkflows = workflows.filter(w => {
        const matchesView = viewMode === 'all' || w.type === viewMode;
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesArea = !activeAreaId || w.life_area_id === activeAreaId;
        return matchesView && matchesSearch && matchesArea;
    });

    const handleRunWorkflow = async () => {
        if (selectedWorkflow) {
            try {
                const run = await startRun(selectedWorkflow.id).unwrap();
                setActiveRunId(run.id);
                setIsExecuting(true);
            } catch (err) {
                console.error('Failed to start run:', err);
                alert('Connection error: Protocol could not be initiated.');
            }
        }
    };

    const handleRunFromSuggestion = async (workflow: any) => {
        setSelectedWorkflowId(workflow.id);
        try {
            const run = await startRun(workflow.id).unwrap();
            setActiveRunId(run.id);
            setIsExecuting(true);
        } catch (err) {
            console.error('Failed to start run from suggestion:', err);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
            {/* Left Sidebar */}
            <WorkflowSidebar
                workflows={filteredWorkflows}
                selectedId={selectedWorkflowId}
                onSelect={(id: string) => {
                    setSelectedWorkflowId(id);
                    setShowInspector(false);
                }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                areas={areas}
                activeAreaId={activeAreaId}
                onAreaChange={setActiveAreaId}
                topContent={<SmartSuggestions onRunWorkflow={handleRunFromSuggestion} />}
            />

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/20">
                            <WorkflowIcon className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                {selectedWorkflow ? selectedWorkflow.name : 'Systems & Workflows'}
                            </h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {selectedWorkflow ? `${selectedWorkflow.steps.length} Protocol Steps Configured` : 'Orchestrate your high-performance environment'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedWorkflow && (
                            <>
                                <button
                                    onClick={() => setShowInspector(!showInspector)}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl border border-white/5 transition-all"
                                >
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <Plus className={`transition-transform duration-500 ${showInspector ? 'rotate-45' : ''}`} size={20} />
                                    </div>
                                </button>
                                <button
                                    onClick={handleRunWorkflow}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                                >
                                    <Play size={14} fill="currentColor" />
                                    Initiate Protocol
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    {selectedWorkflow ? (
                        <WorkflowBuilder workflow={selectedWorkflow} />
                    ) : (
                        <EmptyState onCreate={() => {/* TODO */ }} />
                    )}
                </div>
            </div>

            {/* Right Inspector */}
            <AnimatePresence>
                {showInspector && selectedWorkflow && (
                    <WorkflowInspector
                        onClose={() => setShowInspector(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isExecuting && selectedWorkflow && activeRunId && (
                    <ExecutionOverlay
                        workflow={selectedWorkflow}
                        runId={activeRunId}
                        onClose={() => {
                            setIsExecuting(false);
                            setActiveRunId(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-8 glass-panel border-dashed border-2 border-white/10 rounded-[3rem]">
            <div className="relative">
                <div className="w-32 h-32 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <WorkflowIcon size={48} className="text-indigo-400/50" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl">
                    <Plus size={24} className="text-white" />
                </div>
            </div>

            <div className="text-center space-y-4 max-w-sm">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Deploy Your First System</h3>
                <p className="text-gray-500 font-medium text-sm">
                    Drag apps, agents, and actions to build your high-performance workflow. Systemize your growth.
                </p>
            </div>

            <button
                onClick={onCreate}
                className="px-8 py-4 bg-white text-black rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl"
            >
                Launch Builder
            </button>

            <div className="grid grid-cols-2 gap-4 mt-8">
                {['Work Morning Routine', 'Content Creation'].map(template => (
                    <div key={template} className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:border-white/20 hover:text-white cursor-pointer transition-all">
                        {template} Template
                    </div>
                ))}
            </div>
        </div>
    );
}
