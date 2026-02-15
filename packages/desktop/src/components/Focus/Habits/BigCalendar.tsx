import { useState } from 'react';
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetHabitOverviewQuery } from '../../../features/api/apiSlice';

interface BigCalendarProps {
    onSelectDate: (date: Date) => void;
}

export function BigCalendar({ onSelectDate }: BigCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // Fetch overview data to paint the calendar heat/progress
    const { data: overview } = useGetHabitOverviewQuery({
        period: viewMode
    });

    const headerDate = format(viewDate, viewMode === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy");

    const generateDays = () => {
        let start = startOfWeek(viewDate);
        let end = endOfWeek(viewDate);

        if (viewMode === 'month') {
            start = startOfWeek(startOfMonth(viewDate));
            end = endOfWeek(endOfMonth(viewDate));
        }

        return eachDayOfInterval({ start, end });
    };

    const days = generateDays();

    const handlePrev = () => {
        if (viewMode === 'month') setViewDate(subMonths(viewDate, 1));
        else setViewDate(subWeeks(viewDate, 1));
    };

    const handleNext = () => {
        if (viewMode === 'month') setViewDate(addMonths(viewDate, 1));
        else setViewDate(addWeeks(viewDate, 1));
    };

    return (
        <div className="flex-1 flex flex-col bg-transparent relative">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-6 py-2">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{headerDate}</h2>
                    <div className="flex items-center gap-6 mt-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <span key={d} className="w-full text-center">{d}</span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Week
                        </button>
                    </div>

                    <div className="flex gap-1">
                        <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => setViewDate(new Date())} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-colors">
                            Today
                        </button>
                        <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 gap-1 bg-transparent">
                {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, viewDate) || viewMode === 'week';

                    // Get data for this day
                    const dayStat = overview?.stats?.find((s: any) => s.date === dateStr);
                    const hasData = dayStat && dayStat.habits_scheduled > 0;

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onSelectDate(day)}
                            className={`
                                relative min-h-[120px] rounded-2xl p-3 flex flex-col justify-between group cursor-pointer transition-all border
                                ${isCurrentMonth ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10' : 'bg-transparent border-transparent opacity-30'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-[11px] font-black tracking-tighter ${isToday ? 'text-indigo-400' : isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {format(day, 'd')}
                                </span>
                                {hasData && (
                                    <div className="relative w-8 h-8 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="16" cy="16" r="14"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                className="text-white/5"
                                            />
                                            <circle
                                                cx="16" cy="16" r="14"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeDasharray={2 * Math.PI * 14}
                                                strokeDashoffset={2 * Math.PI * 14 * (1 - dayStat.completion_rate)}
                                                strokeLinecap="round"
                                                className={`transition-all duration-700 ${dayStat.completion_rate >= 0.8 ? 'text-emerald-500' :
                                                    dayStat.completion_rate >= 0.4 ? 'text-orange-500' :
                                                        'text-rose-500'
                                                    }`}
                                            />
                                        </svg>
                                        <span className="absolute text-[8px] font-black text-white">
                                            {Math.round(dayStat.completion_rate * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Checklist Small Card Content */}
                            <div className="mt-2 space-y-1">
                                {hasData ? (
                                    <>
                                        <div className="flex items-center gap-1.5 grayscale opacity-40">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[9px] font-bold text-gray-500 truncate uppercase tracking-widest">
                                                {dayStat.habits_completed}/{dayStat.habits_scheduled} Done
                                            </span>
                                        </div>
                                        {/* Activity Dots */}
                                        <div className="flex gap-1 flex-wrap pt-1">
                                            {Array.from({ length: dayStat.habits_completed }).map((_, idx) => (
                                                <div key={idx} className="w-1 h-1 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                            ))}
                                            {Array.from({ length: dayStat.habits_scheduled - dayStat.habits_completed }).map((_, idx) => (
                                                <div key={`m-${idx}`} className="w-1 h-1 rounded-full bg-white/10" />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-6 flex items-center">
                                        <div className="w-1 h-1 rounded-full bg-white/5" />
                                    </div>
                                )}
                            </div>

                            {/* Hover Review Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:bg-indigo-500/5 group-hover:backdrop-blur-[2px] rounded-2xl">
                                <div className="bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                                    Review Day
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
