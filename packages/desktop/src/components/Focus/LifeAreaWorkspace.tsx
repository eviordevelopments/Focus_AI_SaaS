import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Settings2, BarChart3, List, LayoutGrid,
    Columns, Calendar as CalendarIcon, History, Book,
    StickyNote, Target, Plus, Search, Filter, Layers, Hash
} from 'lucide-react';
import {
    Area, useGetSystemsQuery, useGetHabitsQuery,
    useGetProjectsQuery, useGetArtifactsQuery
} from '../../features/api/apiSlice';

import { SystemCreationFlow } from './SystemCreationFlow';
import { ProjectCreationFlow } from './ProjectCreationFlow';
import { ArtifactCreationFlow } from './ArtifactCreationFlow';
import { HabitCreationFlow } from './HabitCreationFlow';

interface LifeAreaWorkspaceProps {
    areaId: string;
    onBack: () => void;
    areas: Area[];
}

type ViewType = 'list' | 'kanban' | 'gallery' | 'timeline' | 'calendar' | 'charts';
type ModalType = 'system' | 'habit' | 'project' | 'book' | 'note' | null;

export function LifeAreaWorkspace({ areaId, onBack, areas }: LifeAreaWorkspaceProps) {
    const area = areas.find(a => a.id === areaId);
    const [activeView, setActiveView] = useState<ViewType>('list');
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Data Fetching
    const { data: systems = [] } = useGetSystemsQuery();
    const { data: habits = [] } = useGetHabitsQuery({});
    const { data: projects = [] } = useGetProjectsQuery({ lifeAreaId: areaId });
    const { data: books = [] } = useGetArtifactsQuery({ type: 'books', lifeAreaId: areaId });
    const { data: notes = [] } = useGetArtifactsQuery({ type: 'notes', lifeAreaId: areaId });

    const filteredSystems = systems.filter(s => s.life_area_id === areaId);
    // Habit filtering logic (habits from api might not have area_id directly, but we link them to systems)
    const systemIds = filteredSystems.map(s => s.id);
    const filteredHabits = habits.filter(h => systemIds.includes(h.system_id));

    if (!area) return null;

    const views = [
        { id: 'list', label: 'List', icon: List },
        { id: 'kanban', label: 'Kanban', icon: Columns },
        { id: 'gallery', label: 'Gallery', icon: LayoutGrid },
        { id: 'timeline', label: 'Timeline', icon: History },
        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
        { id: 'charts', label: 'Charts', icon: BarChart3 },
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
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white">
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
                <main className="max-w-[1400px] mx-auto space-y-12">
                    {activeView === 'list' && (
                        <div className="space-y-10">
                            {/* Systems */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Layers size={14} className="text-indigo-400" />
                                        Core Systems ({filteredSystems.length})
                                    </h2>
                                    <button
                                        onClick={() => setActiveModal('system')}
                                        className="flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        <Plus size={12} /> ADD SYSTEM
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredSystems.map(system => (
                                        <div key={system.id} className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5 hover:border-white/10 transition-all cursor-pointer">
                                            <h3 className="font-black text-white text-lg">{system.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">{system.supports_identity}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Habits */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Hash size={14} className="text-cyan-400" />
                                        Habit Tokens ({filteredHabits.length})
                                    </h2>
                                    <button
                                        onClick={() => setActiveModal('habit')}
                                        className="flex items-center gap-1 text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        <Plus size={12} /> ADD HABIT
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {filteredHabits.map(habit => (
                                        <div key={habit.id} className="glass-panel p-4 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-xs">
                                                    +{habit.base_xp}
                                                </div>
                                                <span className="text-sm font-bold text-white">{habit.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                                {habit.start_time ? `${habit.start_time}${habit.end_time ? ` - ${habit.end_time}` : ''}` : (habit.scheduled_time || 'UNSCHEDULED')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Projects */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Target size={14} className="text-emerald-400" />
                                        Active Projects ({projects.length})
                                    </h2>
                                    <button
                                        onClick={() => setActiveModal('project')}
                                        className="flex items-center gap-1 text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <Plus size={12} /> NEW PROJECT
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map(project => (
                                        <div key={project.id} className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-black text-white">{project.name}</h3>
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">
                                                    {project.status}
                                                </span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${project.progress * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Books & Notes */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Book size={14} className="text-amber-400" />
                                            Resource Library ({books.length})
                                        </h2>
                                        <button onClick={() => setActiveModal('book')} className="text-amber-400 hover:text-amber-300">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {books.map(book => (
                                            <div key={book.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-white">{book.title}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{book.author}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-white font-black">{Math.round((book.pages_read / (book.total_pages || 1)) * 100)}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <StickyNote size={14} className="text-rose-400" />
                                            Deep Knowledge ({notes.length})
                                        </h2>
                                        <button onClick={() => setActiveModal('note')} className="text-rose-400 hover:text-rose-300">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {notes.map(note => (
                                            <div key={note.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl h-24 flex flex-col justify-between">
                                                <p className="text-xs font-black text-white line-clamp-2">{note.title}</p>
                                                <p className="text-[10px] text-gray-600 font-bold">{note.tags}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeView !== 'list' && (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-600 space-y-4">
                            <Layers size={32} />
                            <p className="text-xs font-black uppercase tracking-widest">Workspace View Under Construction</p>
                        </div>
                    )}
                </main>
            </div>

            <AnimatePresence>
                {activeModal === 'system' && (
                    <SystemCreationFlow
                        onClose={() => setActiveModal(null)}
                        lifeAreaId={areaId}
                        areas={areas}
                    />
                )}
                {activeModal === 'project' && (
                    <ProjectCreationFlow
                        onClose={() => setActiveModal(null)}
                        lifeAreaId={areaId}
                        areas={areas}
                    />
                )}
                {(activeModal === 'book' || activeModal === 'note') && (
                    <ArtifactCreationFlow
                        type={activeModal === 'book' ? 'books' : 'notes'}
                        lifeAreaId={areaId}
                        onClose={() => setActiveModal(null)}
                        areas={areas}
                    />
                )}
                {activeModal === 'habit' && (
                    <HabitCreationFlow
                        onClose={() => setActiveModal(null)}
                    // No systemId passed, user needs to pick one or we assign to a generic/first system of area? 
                    // HabitCreationFlow generally expects a systemId. 
                    // We might need to handle this by asking generic HabitCreation to allow picking a system 
                    // or picking the first system of the area if exists.
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
