import { useState } from 'react';
import {
    useGetAreasQuery,
} from '../../features/api/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';

import { HabitsPage } from './Habits/HabitsPage';
import { HabitCreationFlow } from './HabitCreationFlow';
import { LifeDashboard } from './LifeDashboard';
import { LifeAreaWorkspace } from './LifeAreaWorkspace';
import { AnnualArchitectureMap } from './Roadmap/AnnualArchitectureMap';
import { MonthlyDetailModal } from './Roadmap/MonthlyDetailModal';

export function HabitsView() {
    const [viewMode, setViewMode] = useState<'cockpit' | 'architecture' | 'roadmap'>('cockpit');
    const { data: areas = [] } = useGetAreasQuery();
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedRoadmapMonth, setSelectedRoadmapMonth] = useState<number | null>(null);

    return (
        <div className="h-full flex flex-col p-0 overflow-hidden bg-transparent relative">
            {/* View Switcher only on main view */}
            {!selectedAreaId && (
                <div className="px-8 pt-8 flex justify-end absolute top-0 right-0 z-50">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                        <button
                            onClick={() => setViewMode('cockpit')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'cockpit' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Cockpit
                        </button>
                        <button
                            onClick={() => setViewMode('architecture')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'architecture' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Architecture
                        </button>
                        <button
                            onClick={() => setViewMode('roadmap')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'roadmap' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Roadmap
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-20">
                {viewMode === 'cockpit' ? (
                    <HabitsPage />
                ) : viewMode === 'roadmap' ? (
                    <div className="p-8">
                        <AnnualArchitectureMap
                            onSelectMonth={(m) => setSelectedRoadmapMonth(m)}
                        />
                    </div>
                ) : (
                    <div className="min-h-full">
                        <AnimatePresence mode="wait">
                            {selectedAreaId ? (
                                <motion.div
                                    key="workspace"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full"
                                >
                                    <LifeAreaWorkspace
                                        areaId={selectedAreaId}
                                        onBack={() => setSelectedAreaId(null)}
                                        areas={areas}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-8"
                                >
                                    <LifeDashboard
                                        onSelectArea={(id) => setSelectedAreaId(id)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedRoadmapMonth && (
                    <MonthlyDetailModal
                        month={selectedRoadmapMonth}
                        year={new Date().getFullYear()}
                        onClose={() => setSelectedRoadmapMonth(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAddModalOpen && (
                    <HabitCreationFlow
                        onClose={() => setIsAddModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
