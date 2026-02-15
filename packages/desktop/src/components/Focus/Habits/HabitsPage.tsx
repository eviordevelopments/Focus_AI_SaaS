import { useState } from 'react';
import { useGetHabitBreakdownQuery, useGetHabitOverviewQuery } from '../../../features/api/apiSlice';
import { Layout } from 'lucide-react';
import { HabitTrendsGraph } from './HabitTrendsGraph';
import { HabitBreakdownGraph } from './HabitBreakdownGraph';
import { BigCalendar } from './BigCalendar';
import { DayDetailModal } from './DayDetailModal';
import GlassCard from '../../ui/GlassCard';

export function HabitsPage() {
    const [statsPeriod, setStatsPeriod] = useState('month'); // week, month, quarter, year
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Fetch data for graphs
    const { data: breakdown = [] } = useGetHabitBreakdownQuery({ period: statsPeriod });

    // Transform data for the trends graph (using the regular overview query or deriving from logs if needed)
    // For now we might need to rely on the backend overview or similar.
    // Let's assume breakdown also returns trend data in a future iteration, 
    // but for now we'll fetch basic stats to check.
    // Actually, let's use the breakdown logic to simulate trends or fetch a separate trend endpoint if desired.
    // To keep it simple per plan, we'll reuse the breakdown or summary data.

    // Mock trend data for visualization if not yet in backend, 
    // OR we can fetch summary stats endpoint.
    // The implementation plan mentioned `HabitTrendsGraph` but backend only added `breakdown` (per habit).
    // The `HabitOverview` endpoint DOES provide `stats` array which is perfect for the trends.
    const { data: overview } = useGetHabitOverviewQuery({ period: statsPeriod });

    return (
        <div className="min-h-full flex flex-col p-8 space-y-6 bg-transparent">
            {/* Header / Filter Stats */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Layout className="text-indigo-500" />
                    Habit Intelligence
                </h1>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {['week', 'month', 'quarter', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setStatsPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${statsPeriod === p ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Graphs Section (Top Half) */}
            <div className="grid grid-cols-12 gap-6 relative z-10">
                {/* Main Trend Curve */}
                <div className="col-span-12 lg:col-span-8">
                    <GlassCard className="h-[350px] p-6">
                        <HabitTrendsGraph data={overview?.stats || []} />
                    </GlassCard>
                </div>

                {/* Breakdown Bars */}
                <div className="col-span-12 lg:col-span-4">
                    <GlassCard className="h-[350px] p-6">
                        <HabitBreakdownGraph data={breakdown} />
                    </GlassCard>
                </div>
            </div>

            {/* Calendar Section (Bottom Half) */}
            <div className="w-full relative z-0">
                <GlassCard className="p-6">
                    <BigCalendar onSelectDate={setSelectedDate} />
                </GlassCard>
            </div>

            {/* Modal - Moved here to avoid stacking context issues */}
            {selectedDate && (
                <DayDetailModal
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </div>
    );
}
