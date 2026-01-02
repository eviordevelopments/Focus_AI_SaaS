import { useState } from 'react';
import {
    useGetHabitOverviewQuery,
    useGetHabitsQuery,
    useCreateLogMutation,
    useGetLogsQuery
} from '../../features/api/apiSlice';
import GlassCard from '../ui/GlassCard';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
    Calendar as CalendarIcon,
    TrendingUp,
    Zap,
    Flame,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle2,
    Circle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';


function DayCardOverlay({ date, onClose }: { date: Date, onClose: () => void }) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data: habits = [] } = useGetHabitsQuery({});
    const { data: logs = [] } = useGetLogsQuery({ date: dateStr });
    const [createLog] = useCreateLogMutation();

    const todayDay = getDay(date);
    const scheduledHabits = habits.filter((h: any) => {
        if (!h.days_of_week) return true;
        let days = [];
        try {
            days = typeof h.days_of_week === 'string' ? JSON.parse(h.days_of_week) : h.days_of_week;
        } catch (e) {
            days = [0, 1, 2, 3, 4, 5, 6];
        }
        return days.includes(todayDay);
    });

    const handleToggle = async (habitId: string, currentStatus: boolean) => {
        const habit = habits.find((h: any) => h.id === habitId);
        await createLog({
            habit_id: habitId,
            system_id: habit.system_id,
            date: dateStr,
            completed: !currentStatus,
            effort_level: 3
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 backdrop-blur-sm bg-black/20"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-lg glass-panel p-10 rounded-[3rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter">{format(date, 'EEEE, d MMM')}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                {scheduledHabits.length} PROTOCOLS SCHEDULED
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Habit List */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {scheduledHabits.map((habit: any) => {
                        const log = logs.find((l: any) => l.habit_id === habit.id);
                        const isDone = log?.completed || false;

                        return (
                            <div
                                key={habit.id}
                                onClick={() => handleToggle(habit.id, isDone)}
                                className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer ${isDone ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDone ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                                        }`}>
                                        {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                    </div>
                                    <div>
                                        <h4 className={`font-black tracking-tight ${isDone ? 'text-white' : 'text-gray-400'}`}>{habit.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{habit.identity_statement || 'I AM EVOLVING'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-black ${isDone ? 'text-indigo-400' : 'text-gray-600'}`}>+{habit.base_xp} XP</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-200 transition-all text-[11px]"
                    >
                        Sync Protocol
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export function HabitsCockpit() {
    const [period, setPeriod] = useState('month');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    // Queries
    const { data: overview } = useGetHabitOverviewQuery({ period });
    const { data: habits = [] } = useGetHabitsQuery({});

    // Calendar Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Top Bar Filters */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">HABITS COCKPIT</h1>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mt-1">Self-Mastery Protocol v2.0</p>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                    {['week', 'month', 'quarter', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </header>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="p-6 border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Adherence</p>
                            <h3 className="text-3xl font-black text-white mt-1">{overview?.summary?.avgAdherence || 0}%</h3>
                        </div>
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-1000"
                            style={{ width: `${overview?.summary?.avgAdherence || 0}%` }}
                        />
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Focus XP</p>
                            <h3 className="text-3xl font-black text-white mt-1">{overview?.summary?.totalXP?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                            <Zap size={20} />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Streak</p>
                            <h3 className="text-3xl font-black text-white mt-1">
                                {Math.max(...habits.map((h: any) => h.streak || 0), 0)}
                            </h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Flame size={20} />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-l-4 border-l-rose-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Consistency Grade</p>
                            <h3 className="text-3xl font-black text-white mt-1">
                                {(overview?.summary?.avgAdherence || 0) > 80 ? 'A+' : (overview?.summary?.avgAdherence || 0) > 60 ? 'B' : 'C'}
                            </h3>
                        </div>
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                            <CalendarIcon size={20} />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Main Cockpit Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left: Mini Calendar */}
                <div className="col-span-12 xl:col-span-4">
                    <GlassCard className="p-8 h-full">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                                <CalendarIcon size={16} className="text-indigo-400" />
                                Adherence Map
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronLeft size={16} /></button>
                                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 rounded-xl transition-all"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <span key={d} className="text-[10px] font-black text-gray-600">{d}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-3">
                            {calendarDays.map((day, i) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const dayStat = overview?.stats?.find((s: any) => s.date === dateStr);
                                const isCompleted = dayStat && dayStat.habits_completed >= dayStat.habits_scheduled && dayStat.habits_scheduled > 0;
                                const partial = dayStat && dayStat.habits_completed > 0 && dayStat.habits_completed < dayStat.habits_scheduled;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedDay(day)}
                                        className="group relative aspect-square flex flex-col items-center justify-center rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                        <span className={`text-[11px] font-bold z-10 ${isSameDay(day, new Date()) ? 'text-indigo-400' : 'text-gray-400'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayStat && dayStat.habits_scheduled > 0 && (
                                            <div className="absolute inset-0 p-1">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle
                                                        className="text-white/5"
                                                        strokeWidth="2"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="45%"
                                                        cx="50%"
                                                        cy="50%"
                                                    />
                                                    <circle
                                                        className={isCompleted ? 'text-indigo-500' : partial ? 'text-indigo-400' : 'text-gray-500'}
                                                        strokeWidth="2"
                                                        strokeDasharray="100"
                                                        strokeDashoffset={100 - (dayStat.completion_rate * 100)}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="45%"
                                                        cx="50%"
                                                        cy="50%"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>

                {/* Right: Charts */}
                <div className="col-span-12 xl:col-span-8 space-y-8">
                    {/* Performance Line Chart */}
                    <GlassCard className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-white uppercase tracking-widest text-sm">Performance Velocity</h3>
                            <div className="text-[10px] text-gray-500 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                ROLLING ADHERENCE
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={overview?.stats || []}>
                                    <defs>
                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }}
                                        tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                    />
                                    <YAxis hide domain={[0, 1]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completion_rate"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRate)"
                                        name="Consistency"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Bottom Row: Distribution & XP Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <GlassCard className="p-8">
                            <h3 className="font-black text-white uppercase tracking-widest text-sm mb-6 text-center">Focus Distribution</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Completed', value: overview?.summary?.avgAdherence || 0 },
                                                { name: 'Remaining', value: 100 - (overview?.summary?.avgAdherence || 0) }
                                            ]}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#6366f1" />
                                            <Cell fill="rgba(255,255,255,0.05)" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Mastered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white/10" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Growth Gap</span>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <h3 className="font-black text-white uppercase tracking-widest text-sm mb-6">XP Accumulation</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overview?.stats?.slice(-7) || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }}
                                            tickFormatter={(val) => format(new Date(val), 'EEE')}
                                        />
                                        <YAxis hide />
                                        <Tooltip />
                                        <Bar dataKey="xp_earned" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* Day Card Overlay */}
            <AnimatePresence>
                {selectedDay && (
                    <DayCardOverlay
                        date={selectedDay}
                        onClose={() => setSelectedDay(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
