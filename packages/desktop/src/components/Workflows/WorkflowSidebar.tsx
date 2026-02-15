import { Plus, Search } from 'lucide-react';
import { Area, Workflow } from '../../features/api/apiSlice';

interface WorkflowSidebarProps {
    workflows: Workflow[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    viewMode: 'all' | 'manual' | 'block';
    onViewModeChange: (mode: 'all' | 'manual' | 'block') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    areas: Area[];
    activeAreaId: string | null;
    onAreaChange: (id: string | null) => void;
    topContent?: React.ReactNode;
}

export default function WorkflowSidebar({
    workflows,
    selectedId,
    onSelect,
    viewMode,
    onViewModeChange,
    searchQuery,
    onSearchChange,
    areas,
    activeAreaId,
    onAreaChange,
    topContent
}: WorkflowSidebarProps) {
    return (
        <aside className="w-80 flex flex-col gap-6 h-full min-w-[20rem]">
            {/* Header / New Button */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 px-2">Systems & Workflows</h2>
                <button className="w-full relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    <div className="relative p-4 flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-xs">
                        <Plus size={18} />
                        New Workflow
                    </div>
                </button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search protocols..."
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/10 transition-all font-medium"
                    />
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    {(['all', 'manual', 'block'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => onViewModeChange(mode)}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === mode ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onAreaChange(null)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${!activeAreaId ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                    >
                        All Areas
                    </button>
                    {areas.map(area => (
                        <button
                            key={area.id}
                            onClick={() => onAreaChange(area.id)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeAreaId === area.id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                            style={activeAreaId === area.id ? { backgroundColor: `${area.color_hex}44`, borderColor: area.color_hex, color: 'white' } : {}}
                        >
                            {area.name}
                        </button>
                    ))}
                </div>
            </div>

            {topContent}

            {/* Workflow List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {workflows.map(workflow => (
                    <button
                        key={workflow.id}
                        onClick={() => onSelect(workflow.id)}
                        className={`w-full group p-4 rounded-[2rem] border transition-all text-left relative overflow-hidden ${selectedId === workflow.id ? 'bg-white/10 border-white/20 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                                {workflow.emoji || '⚡'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-white italic truncate uppercase tracking-tight">{workflow.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                                        {areas.find(a => a.id === workflow.life_area_id)?.name || 'General'}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${workflow.type === 'block' ? 'text-amber-500' : 'text-cyan-500'}`}>
                                        {workflow.type === 'block' ? 'Time Block' : 'Manual'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {selectedId === workflow.id && (
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
                        )}
                    </button>
                ))}

                {workflows.length === 0 && (
                    <div className="py-12 text-center space-y-2">
                        <div className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No matching systems</div>
                        <p className="text-gray-700 text-xs">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
