import { useState } from 'react';
import { useGetAreasQuery, useGetSystemsQuery, Area } from '../../features/api/apiSlice';
import { Target, Heart, Briefcase, GraduationCap, Globe, Users, Coins, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { AreaCreationFlow } from './AreaCreationFlow';
import { LifeAreaWorkspace } from './LifeAreaWorkspace';
import { AnimatePresence } from 'framer-motion';
import { LifePieChart } from './LifePieChart';

export function LifeAreasGrid() {
    const { data: areas = [] } = useGetAreasQuery();
    const { data: systems = [] } = useGetSystemsQuery();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

    const getIcon = (iconName: string) => {
        switch (iconName?.toLowerCase()) {
            case 'health': return <Heart className="text-rose-400" />;
            case 'career': return <Briefcase className="text-blue-400" />;
            case 'growth': return <GraduationCap className="text-emerald-400" />;
            case 'wealth': return <Coins className="text-amber-400" />;
            case 'relationships': return <Users className="text-pink-400" />;
            case 'spirituality': return <Globe className="text-indigo-400" />;
            default: return <Target className="text-gray-400" />;
        }
    };

    if (selectedAreaId) {
        return (
            <LifeAreaWorkspace
                areaId={selectedAreaId}
                onBack={() => setSelectedAreaId(null)}
                areas={areas}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
                <header>
                    <h1 className="text-4xl font-bold text-white mb-2">Life Architecture</h1>
                    <p className="text-gray-400">Holistic overview of your focus areas and systems alignment.</p>
                </header>

                <div className="w-full lg:w-1/3">
                    <section className="glass-panel p-6 rounded-[3rem] border border-white/10 bg-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={80} />
                        </div>
                        <LifePieChart areas={areas} />
                    </section>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas?.map((area: Area) => {
                    const areaSystems = systems?.filter((s: any) => s.life_area_id === area.id) || [];
                    const alignment = 0; // Starting from 0 as requested

                    return (
                        <div key={area.id} className="glass-panel p-8 rounded-[40px] border border-white/10 group hover:border-indigo-500/30 transition-all hover:translate-y-[-4px]">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                                    {getIcon(area.name)}
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Alignment</span>
                                    <span className="text-lg font-bold text-white">{alignment}%</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{area.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                                {area.description || `Optimizing your systems for ${area.name.toLowerCase()}.`}
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Active Systems</span>
                                    <span className="text-white font-bold">{areaSystems.length}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${alignment}%` }} />
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedAreaId(area.id)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition-all"
                            >
                                Manage Systems
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    );
                })}

                {/* Add Area Placeholder */}
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="p-8 rounded-[40px] border-2 border-dashed border-white/5 hover:border-indigo-500/20 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer"
                >
                    <div className="p-4 bg-white/5 rounded-full border border-white/5 group-hover:scale-110 transition-transform">
                        <Sparkles className="text-gray-500 group-hover:text-indigo-400" size={24} />
                    </div>
                    <span className="text-sm font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">Add Life Area</span>
                </button>
            </div>

            <AnimatePresence>
                {isCreateOpen && (
                    <AreaCreationFlow onClose={() => setIsCreateOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
