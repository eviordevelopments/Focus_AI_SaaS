import { useState, useMemo } from 'react';
import { useGetQuarterlyIdentitiesQuery } from '../../features/api/apiSlice';
import { Compass, Calendar as CalIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { TenYearVision } from './Planning/TenYearVision';
import { IdentityBoard } from './Planning/IdentityBoard';
import { PlanningStats } from './Planning/PlanningStats';
import { IdentityShiftModal } from './Planning/IdentityShiftModal';

export function QuarterlyPlanning() {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);

    const { data: identities = [], refetch } = useGetQuarterlyIdentitiesQuery();

    const selectedShift = useMemo(() => {
        return identities.find((i: any) => i.year === selectedYear && i.quarter === selectedQuarter);
    }, [identities, selectedYear, selectedQuarter]);

    const handleQuarterClick = (quarter: string) => {
        setSelectedQuarter(quarter);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-[1400px] mx-auto p-12 animate-in fade-in duration-1000 pb-32 space-y-12">
            {/* Main Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                            <Compass className="text-white" size={32} />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Planning Canvas</h1>
                    </div>
                    <p className="text-gray-500 text-xs font-black tracking-[0.4em] uppercase ml-1">Quarterly Identity Architect</p>
                </div>

                <div className="flex items-center gap-4 bg-black/40 p-2 rounded-[24px] border border-white/5 backdrop-blur-xl">
                    <button
                        onClick={() => setSelectedYear(y => y - 1)}
                        className="p-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-6 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <span className="text-2xl font-black text-white tracking-tighter">{selectedYear}</span>
                    </div>
                    <button
                        onClick={() => setSelectedYear(y => y + 1)}
                        className="p-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {/* Top Vision & Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TenYearVision />
                </div>
                <div>
                    <PlanningStats />
                </div>
            </div>

            {/* Identity Board Section */}
            <section className="space-y-8 pt-6">
                <div className="flex justify-between items-center px-2">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
                            <CalIcon size={20} className="text-indigo-400" />
                            Identity Board
                        </h2>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Select a quarter to forge your shift</p>
                    </div>

                    <button
                        onClick={() => handleQuarterClick('Q' + (Math.floor(new Date().getMonth() / 3) + 1))}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                    >
                        <Plus size={14} /> Commit to Shift
                    </button>
                </div>

                <IdentityBoard
                    year={selectedYear}
                    identities={identities}
                    onSelectQuarter={handleQuarterClick}
                />
            </section>

            {/* Identity Shift Modal */}
            <IdentityShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                quarter={selectedQuarter || 'Q1'}
                year={selectedYear}
                initialData={selectedShift}
                onRefresh={refetch}
            />
        </div>
    );
}
