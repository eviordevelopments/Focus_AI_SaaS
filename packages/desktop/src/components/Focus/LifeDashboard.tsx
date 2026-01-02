import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Activity, Target,
    Heart, Briefcase, GraduationCap,
    Globe, Users, Coins, TrendingUp
} from 'lucide-react';
import { useGetAreaStatsQuery, Area } from '../../features/api/apiSlice';
import { LifePieChart } from './LifePieChart';
import { AreaCreationFlow } from './AreaCreationFlow';

interface LifeDashboardProps {
    onSelectArea: (areaId: string) => void;
}

export function LifeDashboard({ onSelectArea }: LifeDashboardProps) {
    const { data: areas = [], isLoading } = useGetAreaStatsQuery();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const getIcon = (iconName: string, className?: string) => {
        switch (iconName?.toLowerCase()) {
            case 'health': return <Heart className={className} />;
            case 'career': return <Briefcase className={className} />;
            case 'learning': return <GraduationCap className={className} />;
            case 'finance': return <Coins className={className} />;
            case 'relationships': return <Users className={className} />;
            case 'spiritual': return <Globe className={className} />;
            case 'work': return <Briefcase className={className} />;
            default: return <Target className={className} />;
        }
    };

    const handleCreateClick = () => {
        setIsCreateOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Top Section: Pie Chart + Overall Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <section className="glass-panel p-10 rounded-[4rem] border border-white/10 bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={120} />
                    </div>
                    <LifePieChart areas={areas} />
                </section>

                <section className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} />
                            Biological Performance
                        </h2>
                        <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
                            Life <br /> Architecture
                        </h1>
                        <p className="text-gray-500 font-medium max-w-md mt-4 leading-relaxed">
                            Manage your life like a high-performance workspace.
                            Seven areas of renewal, optimized for identity and impact.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Overall Completion</p>
                            <p className="text-3xl font-black text-white">78%</p>
                        </div>
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">XP Earned (30d)</p>
                            <p className="text-3xl font-black text-white">4,200</p>
                        </div>
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5 col-span-2 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Bottlenecks Detected</p>
                                <p className="text-xl font-black text-amber-400 uppercase tracking-tighter">Health Adherence low</p>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                                <Activity size={20} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Life Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {areas.map((area: Area) => (
                    <motion.div
                        key={area.id}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => onSelectArea(area.id)}
                        className="glass-panel p-8 rounded-[3rem] border border-white/10 bg-white/5 group cursor-pointer transition-all hover:border-white/20 relative overflow-hidden"
                    >
                        <div
                            className="absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-30 group-hover:opacity-50 transition-opacity"
                            style={{ backgroundColor: area.color_hex }}
                        />

                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div
                                className="p-4 rounded-2xl border transition-all duration-500"
                                style={{
                                    backgroundColor: `${area.color_hex}11`,
                                    borderColor: `${area.color_hex}33`,
                                    color: area.color_hex
                                }}
                            >
                                {getIcon(area.name, "w-6 h-6")}
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Performance</span>
                                <span className="text-2xl font-black text-white tracking-tighter">
                                    {Math.round((area.completion_rate || 0) * 100)}%
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-indigo-300 transition-colors">
                                {area.name}
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] line-clamp-1 italic">
                                {area.identity_statement || 'I AM EVOLVING'}
                            </p>
                        </div>

                        <div className="mt-12 space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-600">Active Architecture</span>
                                <span className="text-white">{(area.active_systems || 0) + (area.open_projects || 0)} Units</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(area.completion_rate || 0) * 100}%` }}
                                    className="h-full"
                                    style={{ backgroundColor: area.color_hex }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Create New Card */}
                <button
                    onClick={handleCreateClick}
                    className="glass-panel p-8 rounded-[3rem] border-2 border-dashed border-white/10 bg-transparent hover:bg-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-4 group text-white relative z-10 cursor-pointer"
                >
                    <div className="p-4 bg-white/5 rounded-full border border-white/5 group-hover:scale-110 transition-transform group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20">
                        <Plus className="text-gray-500 group-hover:text-indigo-400" size={24} />
                    </div>
                    <span className="text-sm font-black text-gray-500 group-hover:text-white uppercase tracking-widest">Forge Area</span>
                </button>
            </div>

            {isCreateOpen && (
                <AreaCreationFlow onClose={() => setIsCreateOpen(false)} />
            )}
        </div>
    );
}
