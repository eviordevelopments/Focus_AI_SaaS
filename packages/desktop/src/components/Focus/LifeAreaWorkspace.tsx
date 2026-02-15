import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Settings2, BarChart3, List, LayoutGrid,
    Columns, Calendar as CalendarIcon, History,
    Target, Search, Filter, Layers, Rocket
} from 'lucide-react';
import {
    Area, useGetAreaWorkspaceQuery,
    useUpdateSystemMutation, useUpdateProjectMutation, useUpdateHabitMutation
} from '../../features/api/apiSlice';

import { SystemCreationFlow } from './SystemCreationFlow';
import { ProjectCreationFlow } from './ProjectCreationFlow';
import { ArtifactCreationFlow } from './ArtifactCreationFlow';
import { HabitCreationFlow } from './HabitCreationFlow';
import { AreaCreationFlow } from './AreaCreationFlow';

// New specialized views
import { ListView } from './WorkspaceViews/ListView';
import { KanbanView } from './WorkspaceViews/KanbanView';
import { GalleryView } from './WorkspaceViews/GalleryView';
import { HealthIntelligence } from './WorkspaceViews/HealthIntelligence';
import { BooksKanban } from './WorkspaceViews/BooksKanban';
import { IdentityView } from './WorkspaceViews/IdentityView';
import { MissionsView } from './WorkspaceViews/MissionsView';

interface LifeAreaWorkspaceProps {
    areaId: string;
    onBack: () => void;
    areas: Area[];
}

type ViewType = 'list' | 'kanban' | 'gallery' | 'timeline' | 'calendar' | 'charts' | 'identity' | 'missions';
type ModalType = 'system' | 'habit' | 'project' | 'book' | 'note' | null;

export function LifeAreaWorkspace({ areaId, onBack, areas }: LifeAreaWorkspaceProps) {
    const area = areas.find(a => a.id === areaId);
    const [activeView, setActiveView] = useState<ViewType>('gallery'); // Default to Gallery as requested
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);

    const [isEditingArea, setIsEditingArea] = useState(false);

    const handleItemClick = (type: string, data: any) => {
        setEditingItem({ type, data });
        setActiveModal(type as ModalType);
    };

    const handleCloseModal = () => {
        setActiveModal(null);
        setEditingItem(null);
    };

    // Enhanced Data Fetching
    const { data: workspace, isLoading } = useGetAreaWorkspaceQuery(areaId);

    if (!area || isLoading || !workspace) return null;

    const {
        systems = [],
        habits = [],
        projects = [],
        resources = [],
        tasks = []
    } = workspace;

    const views = [
        { id: 'gallery', label: 'Overview', icon: LayoutGrid },
        { id: 'identity', label: 'Identity', icon: Target },
        { id: 'missions', label: 'Missions', icon: Rocket },
        { id: 'list', label: 'Systems', icon: List },
        { id: 'kanban', label: 'Tasks', icon: Columns },
        { id: 'timeline', label: 'Timeline', icon: History },
        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-transparent animate-in slide-in-from-right duration-700">
            {/* Header */}
            <header className="px-8 pt-10 pb-6 border-b border-white/5 space-y-8">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white flex items-center gap-2"
                    >
                        <ChevronLeft size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest pr-2">Vault</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditingArea(true)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white"
                        >
                            <Settings2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-12">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-3xl flex items-center justify-center border text-3xl"
                                style={{ backgroundColor: `${area.color_hex}11`, borderColor: `${area.color_hex}33`, color: area.color_hex }}
                            >
                                <Target />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{area.name}</h1>
                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic flex items-center gap-2">
                                    <Layers size={12} className="text-indigo-500" />
                                    {area.identity_statement || 'Forging a new baseline of excellence'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-panel px-8 py-4 rounded-3xl border border-white/5 bg-white/5 text-right">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">XP Power</span>
                            <span className="text-2xl font-black text-white">1,200</span>
                        </div>
                        <div className="glass-panel px-8 py-4 rounded-3xl border border-white/5 bg-white/5 text-right">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Compliance</span>
                            <span className="text-2xl font-black text-emerald-400">88%</span>
                        </div>
                    </div>
                </div>

                {/* Notion Tabs */}
                <div className="flex items-center gap-1 border-b border-white/5 pb-0">
                    {views.map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id as ViewType)}
                            className={`px-6 py-4 flex items-center gap-2 relative transition-all group ${activeView === view.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <view.icon size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{view.label}</span>
                            {activeView === view.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                />
                            )}
                        </button>
                    ))}
                    <div className="flex-1" />
                    <div className="flex items-center gap-4 px-4 pb-0">
                        <Search size={14} className="text-gray-600" />
                        <Filter size={14} className="text-gray-600" />
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-8">
                <main className="max-w-[1400px] mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeView === 'list' && (
                                <ListView
                                    systems={workspace.systems || []}
                                    habits={workspace.habits || []}
                                    projects={workspace.projects || []}
                                    areaColor={area.color_hex || '#6366f1'}
                                    onAddSystem={() => setActiveModal('system')}
                                    onAddProject={() => setActiveModal('project')}
                                    onAddHabit={() => setActiveModal('habit')}
                                    onItemClick={handleItemClick}
                                />
                            )}

                            {activeView === 'kanban' && (
                                area.name.toLowerCase().includes('personal') ? (
                                    <BooksKanban
                                        books={resources}
                                        areaId={areaId}
                                        projects={projects}
                                    />
                                ) : (
                                    <KanbanView
                                        projects={workspace.projects || []}
                                        tasks={workspace.tasks || []}
                                        onAddTask={() => setActiveModal('habit')}
                                        onAddProject={() => setActiveModal('project')}
                                        onItemClick={handleItemClick}
                                    />
                                )
                            )}

                            {activeView === 'gallery' && (
                                area.name.toLowerCase().includes('health') ? (
                                    <HealthIntelligence data={workspace.health_entries || []} />
                                ) : (
                                    <GalleryView
                                        area={area}
                                        systems={systems}
                                        habits={habits}
                                        projects={projects}
                                        resources={resources}
                                        notes={workspace.notes || []}
                                        onItemClick={handleItemClick}
                                    />
                                )
                            )}

                            {activeView === 'identity' && (
                                <IdentityView
                                    shifts={workspace.identity_shifts || []}
                                    areaColor={area.color_hex}
                                />
                            )}

                            {activeView === 'missions' && (
                                <MissionsView
                                    outcomes={workspace.outcomes || []}
                                    projects={workspace.projects || []}
                                    areaColor={area.color_hex}
                                />
                            )}

                            {(activeView === 'timeline' || activeView === 'calendar') && (
                                <div className="h-[60vh] flex flex-col items-center justify-center text-gray-700 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
                                    <Layers size={48} className="mb-6 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Neural Engine Initializing</p>
                                    <p className="text-xs font-bold text-gray-500 italic">Advanced synchronization for {activeView} in progress...</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <AnimatePresence>
                {activeModal === 'system' && (
                    <SystemCreationFlow
                        onClose={handleCloseModal}
                        lifeAreaId={areaId}
                        areas={areas}
                        editingId={editingItem?.type === 'system' ? editingItem.data.id : undefined}
                        initialData={editingItem?.type === 'system' ? editingItem.data : undefined}
                    />
                )}
                {activeModal === 'project' && (
                    <ProjectCreationFlow
                        onClose={handleCloseModal}
                        lifeAreaId={areaId}
                        areas={areas}
                        editingId={editingItem?.type === 'project' ? editingItem.data.id : undefined}
                        initialData={editingItem?.type === 'project' ? editingItem.data : undefined}
                    />
                )}
                {(activeModal === 'book' || activeModal === 'note') && (
                    <ArtifactCreationFlow
                        type={activeModal === 'book' ? 'books' : 'notes'}
                        lifeAreaId={areaId}
                        onClose={handleCloseModal}
                        areas={areas}
                    />
                )}
                {activeModal === 'habit' && (
                    <HabitCreationFlow
                        onClose={handleCloseModal}
                        editingId={editingItem?.type === 'habit' ? editingItem.data.id : undefined}
                        initialData={editingItem?.type === 'habit' ? editingItem.data : undefined}
                    />
                )}
                {isEditingArea && (
                    <AreaCreationFlow
                        onClose={() => setIsEditingArea(false)}
                        editingArea={area}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
