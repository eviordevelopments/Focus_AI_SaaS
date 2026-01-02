import GlassCard from '../ui/GlassCard';
import { ChevronRight, Briefcase, GraduationCap, Heart, Wallet, User } from 'lucide-react';

// Using provided image "Life Areas" widgets logic
// Assuming 'areas' or 'systems' data passed in

interface LifeAreasWidgetProps {
    areas: any[]; // Assuming generic for now, ideally strictly typed
}

export default function LifeAreasWidget({ areas }: LifeAreasWidgetProps) {
    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('work')) return <Briefcase size={16} />;
        if (n.includes('study')) return <GraduationCap size={16} />;
        if (n.includes('health')) return <Heart size={16} />;
        if (n.includes('finance')) return <Wallet size={16} />;
        return <User size={16} />;
    };

    const getColor = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('work')) return 'bg-blue-500';
        if (n.includes('study')) return 'bg-purple-500';
        if (n.includes('health')) return 'bg-emerald-500';
        if (n.includes('finance')) return 'bg-amber-500';
        return 'bg-pink-500';
    };

    return (
        <GlassCard>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Life Areas</h3>
                <button className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300">View All <ChevronRight size={12} /></button>
            </div>

            <div className="space-y-4">
                {(areas || []).map((area, i) => (
                    <div key={area.id || i} className="group">
                        <div className="flex justify-between text-xs mb-1">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <div className={`p-1.5 rounded-md bg-white/5 text-gray-300`}>
                                    {getIcon(area.name)}
                                </div>
                                {area.name}
                            </div>
                            <span className="text-gray-500">1/2</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${getColor(area.name)} w-1/2 rounded-full`} />
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
