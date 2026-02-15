import { useState } from 'react';
import { useGetSystemsQuery, useGetAreasQuery, useGetGamifiedIdentitiesQuery, useDeleteSystemMutation, useGetGamifiedDashboardQuery } from '../../features/api/apiSlice';
import { SystemCanvas } from './SystemCanvas';
import { Plus, Zap, Trophy, Flame, Target, ArrowRight, Clock, Edit2, Trash2, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SystemsView() {
    const { data: systems = [] } = useGetSystemsQuery();
    const { data: areas = [] } = useGetAreasQuery();
    const { data: identities = [] } = useGetGamifiedIdentitiesQuery();
    const { data: gamifiedDashboard } = useGetGamifiedDashboardQuery();
    const [deleteSystem] = useDeleteSystemMutation();

    const [activeAreaId, setActiveAreaId] = useState<string | undefined>();
    const [isCreating, setIsCreating] = useState(false);
    const [editingSystem, setEditingSystem] = useState<any>(null);

    const handleCreate = (areaId?: string) => {
        setActiveAreaId(areaId);
        setEditingSystem(null);
        setIsCreating(true);
    };

    const handleEdit = (system: any) => {
        setEditingSystem(system);
        setIsCreating(true);
    };

    const handleDelete = async (systemId: string) => {
        if (confirm('Are you sure you want to delete this system?')) {
            await deleteSystem(systemId);
        }
    };

    // Group systems by Area
    const systemsByArea = areas.map(area => ({
        ...area,
        systems: systems.filter(s => s.life_area_id === area.id)
    })).filter(group => group.systems.length > 0);

    // Systems without areas
    const unassignedSystems = systems.filter(s =>
        !s.life_area_id || !areas.find(a => a.id === s.life_area_id)
    );

    if (unassignedSystems.length > 0) {
        systemsByArea.push({
            id: 'unassigned',
            name: 'Unassigned Circuits',
            description: 'Systems not yet anchored to a specific life area.',
            color_hex: '#4b5563', // gray-600
            systems: unassignedSystems,
            identity_statement: 'PROTOCOLS IN TRANSIT'
        } as any);
    }

    // Calculate overall statistics
    const totalSystems = systems.length;
    const totalXP = gamifiedDashboard?.totalXP || 0;
    const avgCompliance = gamifiedDashboard?.dailyCompliance || 0;
    const activeSystems = systems.filter((s: any) => s.is_active !== false).length;

    return (
        <div className="h-full flex flex-col bg-transparent relative overflow-hidden">
            {/* Header with Stats */}
            <header className="px-10 py-8 z-10">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-3">
                            <Zap className="text-yellow-400 fill-yellow-400" size={32} />
                            System Architecture
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">
                            Build the machines that build you.
                        </p>
                    </div>

                    <button
                        onClick={() => handleCreate()}
                        className="group relative px-6 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-white/5 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Plus size={16} />
                            New System
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                </div>

                {/* Overall Statistics Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total XP</span>
                            <Zap className="text-indigo-400" size={20} />
                        </div>
                        <div className="text-3xl font-black text-white">{totalXP.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-1">Lifetime Earned</div>
                    </div>

                    <div className="glass-panel bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Systems</span>
                            <Target className="text-amber-400" size={20} />
                        </div>
                        <div className="text-3xl font-black text-white">{activeSystems}/{totalSystems}</div>
                        <div className="text-xs text-gray-500 mt-1">Deployed</div>
                    </div>

                    <div className="glass-panel bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Compliance</span>
                            <TrendingUp className="text-emerald-400" size={20} />
                        </div>
                        <div className="text-3xl font-black text-white">{Math.round(avgCompliance)}%</div>
                        <div className="text-xs text-gray-500 mt-1">Daily Average</div>
                    </div>

                    <div className="glass-panel bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Trophies</span>
                            <Trophy className="text-rose-400" size={20} />
                        </div>
                        <div className="text-3xl font-black text-white">0</div>
                        <div className="text-xs text-gray-500 mt-1">Achievements</div>
                    </div>
                </div>
            </header>

            {/* Content - Scrollable Library */}
            <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar z-10 space-y-16">

                {systems.length === 0 && !isCreating && (
                    <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-white">No Systems Deployed</h2>
                            <p className="text-gray-400 max-w-md mx-auto">Systems are the compound interest of self-improvement.</p>
                        </div>
                        <button
                            onClick={() => handleCreate()}
                            className="w-64 h-40 rounded-3xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-white/5 flex flex-col items-center justify-center group transition-all"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center text-gray-400 group-hover:text-indigo-400 mb-2 transition-colors">
                                <Plus size={24} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">Create First System</span>
                        </button>
                    </div>
                )}

                {/* Area Groups */}
                {systemsByArea.map(group => (
                    <div key={group.id} className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-black/20"
                                style={{ backgroundColor: group.color_hex, color: '#fff' }}
                            >
                                <Target size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wide">{group.name}</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{group.identity_statement}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {group.systems.map(system => {
                                const identity = identities.find(i => i.id === system.identity_id);

                                return (
                                    <motion.div
                                        key={system.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -5 }}
                                        className="group relative glass-panel bg-white/5 border border-white/5 hover:border-white/20 rounded-3xl p-6 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
                                    >
                                        {/* Action Buttons */}
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(system);
                                                }}
                                                className="p-2 bg-white/10 hover:bg-indigo-500/20 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(system.id);
                                                }}
                                                className="p-2 bg-white/10 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Top Metadata */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${system.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-400' :
                                                    system.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {system.difficulty || 'Medium'}
                                                </span>
                                                <span className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {system.duration_minutes}m
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                                <Trophy size={14} />
                                            </div>
                                        </div>

                                        {/* Main Info */}
                                        <div className="mb-8 space-y-2">
                                            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                                                {system.name}
                                            </h3>
                                            {identity && (
                                                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    {identity.name}
                                                </p>
                                            )}
                                            {!identity && system.supports_identity && (
                                                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    {system.supports_identity}
                                                </p>
                                            )}
                                        </div>

                                        {/* Stats Footer */}
                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Streak</span>
                                                    <div className="flex items-center gap-1 text-white font-bold text-sm">
                                                        <Flame size={12} className="text-orange-500 fill-orange-500" />
                                                        0
                                                    </div>
                                                </div>
                                                <div className="w-px h-6 bg-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">XP/Run</span>
                                                    <div className="flex items-center gap-1 text-white font-bold text-sm">
                                                        <Zap size={12} className="text-cyan-500 fill-cyan-500" />
                                                        {system.xp_base || 25}
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>

                                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </motion.div>
                                );
                            })}
                            {/* Add New Card for Area Context */}
                            <button
                                onClick={() => handleCreate(group.id)}
                                className="group relative h-full min-h-[200px] rounded-3xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all bg-transparent"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center text-gray-500 group-hover:text-indigo-400 mb-3 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-600 group-hover:text-white transition-colors">Add System to {group.name}</span>
                                <p className="text-[10px] text-gray-600 mt-2 px-6 text-center group-hover:text-gray-400">Expand your protocols for this life area.</p>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal - Floating Window Style */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsCreating(false)}
                    >
                        {/* Subtle backdrop blur without heavy black */}
                        <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />

                        {/* Floating window */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <SystemCanvas
                                onSuccess={() => setIsCreating(false)}
                                onCancel={() => setIsCreating(false)}
                                initialLifeAreaId={activeAreaId}
                                existingSystem={editingSystem}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
