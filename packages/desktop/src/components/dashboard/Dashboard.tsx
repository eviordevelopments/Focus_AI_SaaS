import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setActiveTab } from '../../features/ui/uiSlice';
import {
    useGetTasksQuery,
    useGetRecentSessionsQuery,
    useGetTodayHealthQuery,
    useGetHabitsQuery,
    useUpdateTaskMutation,
    useStartSessionMutation,
    useGetBurnoutScoreQuery,
    useGetHealthHistoryQuery,
    useGetGamifiedDashboardQuery,
    useCreateLogMutation,
    useGetQuarterlyIdentitiesQuery
} from '../../features/api/apiSlice';
import GlassCard from '../ui/GlassCard';
import ProductivityWidget from './ProductivityWidget';
import HealthWidget from './HealthWidget';
import AIInsightWidget from './AIInsightWidget';
import TasksWidget from './TasksWidget';
import HabitsWidget from './HabitsWidget';
import QuickFocusWidget from './QuickFocusWidget';
import CalendarWidget from './CalendarWidget';
import HealthHistoryCharts from './HealthHistoryCharts';
import { EisenhowerWidget } from './EisenhowerWidget';
import { PlanningWidget } from './PlanningWidget';
import NextEventWidget from './NextEventWidget';
import { DailyLogModal } from '../Focus/DailyLogModal';
import { HabitDetailCard } from '../Focus/HabitDetailCard';
import { SystemCanvas } from '../Focus/SystemCanvas';
import { Settings2, X, Plus, Activity } from 'lucide-react';
import { getDay } from 'date-fns';

export default function Dashboard() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
    const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<any>(null);

    // Queries
    const { data: tasks = [] } = useGetTasksQuery();
    const { data: allHabits = [] } = useGetHabitsQuery({});
    const { data: todayHealth } = useGetTodayHealthQuery();
    const { data: burnoutData } = useGetBurnoutScoreQuery();
    const { data: history = [] } = useGetHealthHistoryQuery();
    const { data: recentSessions = [] } = useGetRecentSessionsQuery();
    const { data: identities = [] } = useGetQuarterlyIdentitiesQuery();
    const { data: gamifiedDashboard } = useGetGamifiedDashboardQuery();

    const currentIdentity = identities[0]?.primary_identity || 'Focus Agent';

    // Mutations
    const [updateTask] = useUpdateTaskMutation();
    const [startSession] = useStartSessionMutation();
    const [createLog] = useCreateLogMutation();

    // Derived State
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDay = getDay(new Date());

    // Filter habits for today's schedule
    const habits = allHabits.filter((h: any) => {
        if (!h.is_active) return false;
        if (!h.days_of_week) return true;
        try {
            const days = typeof h.days_of_week === 'string' ? JSON.parse(h.days_of_week) : h.days_of_week;
            return Array.isArray(days) && days.includes(todayDay);
        } catch (e) {
            return true;
        }
    });

    const burnoutScore = burnoutData?.overall_score || 0;

    const todaySessions = recentSessions?.filter((s: any) => {
        if (!s.start_time) return false;
        try {
            const dateVal = new Date(s.start_time);
            return !isNaN(dateVal.getTime()) && dateVal.toISOString().startsWith(todayStr);
        } catch (e) { return false; }
    }) || [];

    const focusMinutes = todaySessions.reduce((acc: number, s: any) => acc + (s.actual_minutes || s.planned_minutes || 0), 0);
    const streak = allHabits.reduce((max: number, h: any) => Math.max(max, h.streak || 0), 0);

    const handleTaskToggle = (task: any) => {
        updateTask({
            id: task.id,
            updates: { status: task.status === 'done' ? 'todo' : 'done' }
        });
    };

    const handleHabitToggle = async (habit: any) => {
        const isCompleted = (habit.completed_dates || []).includes(todayStr);
        await createLog({
            system_id: habit.system_id,
            habit_id: habit.id,
            date: todayStr,
            completed: !isCompleted,
            effort_level: 3
        });
    };

    const handleStartSession = async (type: string, minutes: number) => {
        await startSession({ type, planned_minutes: minutes });
        dispatch(setActiveTab('deepwork'));
    };

    const level = Math.floor(Math.sqrt((gamifiedDashboard?.totalXP || 0) / 100)) + 1;
    const currentXP = gamifiedDashboard?.totalXP || 0;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const prevLevelXP = Math.pow(level - 1, 2) * 100;
    const progressXP = currentXP - prevLevelXP;
    const requiredXP = nextLevelXP - prevLevelXP;
    const progressPercent = Math.min((progressXP / requiredXP) * 100, 100);

    return (
        <div className="space-y-8 pb-8 animate-in fade-in duration-700">
            {/* Urgent Protocol / Next Event */}
            <NextEventWidget tasks={tasks} habits={habits} />

            {/* Gamified Header Section */}
            <div className="grid grid-cols-12 gap-8 items-stretch">
                {/* Main Character Status Card */}
                <div className="col-span-12 xl:col-span-7">
                    <div className="h-full relative overflow-hidden rounded-[2.5rem] bg-[var(--accent)]/10 border border-[var(--glass-border)] p-10 text-[var(--text-main)] shadow-2xl backdrop-blur-3xl group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-all duration-1000" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-3xl" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Main Character Status: {currentIdentity}</h2>
                                        <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 text-[var(--text-main)]">Agent {user?.name?.split(' ')[0]}</div>
                                    </div>
                                    <h3 className="text-5xl font-black mt-3 flex items-baseline gap-3 tracking-tighter italic uppercase text-[var(--text-heading)]">
                                        LEVEL {level}
                                        <span className="text-xl font-bold text-indigo-400">/ Mastery {Math.floor(level / 10) + 1}</span>
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black tracking-tighter italic text-[var(--text-heading)]">{currentXP.toLocaleString()}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] mt-1">Total XP Earned</div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-[var(--text-dim)]">
                                    <span>Daily Protocol Progress</span>
                                    <span>{Math.round(progressPercent)}% to LVL {level + 1}</span>
                                </div>
                                <div className="w-full h-4 bg-black/40 rounded-full p-1 overflow-hidden backdrop-blur-md border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Achievement / Compliance Card */}
                <div className="col-span-12 xl:col-span-5">
                    <div className="h-full bg-[var(--bg-card)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--glass-border)] p-10 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-110 transition-all duration-700" />

                        <div className="relative group/circle">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    className="text-white/5"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    className="text-indigo-500 drop-shadow-[0_0_12px_rgba(79,70,229,0.4)] transition-all duration-1000 ease-out"
                                    strokeWidth="8"
                                    strokeDasharray={364}
                                    strokeDashoffset={364 - (364 * (gamifiedDashboard?.dailyCompliance || 0) / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-[var(--text-heading)] italic tracking-tighter">{Math.round(gamifiedDashboard?.dailyCompliance || 0)}%</span>
                            </div>
                        </div>
                        <h4 className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Daily Compliance Rate</h4>
                        <p className="text-[var(--text-dim)] text-xs mt-3 max-w-[240px] font-medium leading-relaxed">
                            {gamifiedDashboard?.dailyCompliance > 80 ? 'Mastery reached. Protocol followed with high precision.' :
                                gamifiedDashboard?.dailyCompliance > 50 ? 'Steady progress. Maintaining system integrity.' :
                                    'Initialize daily protocols to begin tracking performance.'}
                        </p>

                        <div className="flex gap-4 mt-10 w-full">
                            <button
                                onClick={() => setIsLogModalOpen(true)}
                                className="flex-1 bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all shadow-xl text-xs uppercase tracking-[0.2em]"
                            >
                                LOG PROTOCOL
                            </button>
                            <button
                                onClick={() => setIsSystemModalOpen(true)}
                                className="w-16 h-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                                title="Create New System"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                onClick={() => dispatch(setActiveTab('systems'))}
                                className="w-16 h-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                            >
                                <Settings2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Row: Burnout Gauge & Contributing Factors (HealthWidget) */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
                <div className="col-span-12 md:col-span-4">
                    <GlassCard className="flex flex-col items-center justify-between min-h-[320px] relative overflow-hidden group/burnout">
                        <div className="w-full flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black text-[var(--text-heading)] italic uppercase tracking-tighter">Burnout Score</h3>
                            <Activity size={18} className="text-gray-500 group-hover/burnout:text-indigo-400 transition-colors" />
                        </div>

                        <div className="relative flex-1 flex flex-col items-center justify-center w-full">
                            {/* Apple-style Circular Gauge */}
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                    {/* Background Track */}
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-white/5"
                                    />
                                    {/* Progress Ring */}
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        stroke="url(#burnoutGradient)"
                                        strokeWidth="12"
                                        strokeDasharray={502.6}
                                        strokeDashoffset={502.6 - (502.6 * burnoutScore) / 100}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        className="transition-all duration-[1500ms] ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="burnoutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={burnoutScore > 75 ? "#f43f5e" : burnoutScore > 50 ? "#f59e0b" : "#6366f1"} />
                                            <stop offset="100%" stopColor={burnoutScore > 75 ? "#fb7185" : burnoutScore > 50 ? "#fbbf24" : "#a855f7"} />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Inner Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-5xl font-black text-[var(--text-heading)] italic tracking-tighter tabular-nums drop-shadow-lg">
                                        {burnoutScore}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Index</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border backdrop-blur-md transition-all duration-500
                                    ${burnoutScore <= 25 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' :
                                        burnoutScore <= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5' :
                                            burnoutScore <= 75 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/5' :
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5'}`}>
                                    {burnoutData?.risk_level || (burnoutScore > 75 ? 'Critical' : burnoutScore > 50 ? 'High' : 'Optimal Condition')}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
                <div className="col-span-12 md:col-span-8">
                    <HealthWidget healthEntry={todayHealth} />
                </div>
            </div>

            {/* Middle Row: Charts */}
            <HealthHistoryCharts history={history} />

            {/* Comparison/Action Grid */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 xl:col-span-8 space-y-6">
                    <AIInsightWidget
                        burnoutScore={burnoutScore}
                        healthEntry={todayHealth}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <PlanningWidget />
                        <TasksWidget
                            tasks={tasks.filter((t: any) => {
                                if (t.status !== 'done') return true;
                                if (!t.due_date) return false;
                                try {
                                    return new Date(t.due_date).toISOString().startsWith(todayStr);
                                } catch (e) { return false; }
                            }).sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99))}
                            onToggle={handleTaskToggle}
                        />
                        <EisenhowerWidget />
                        <HabitsWidget
                            habits={habits}
                            onToggle={handleHabitToggle}
                            onViewDetails={setSelectedHabitForDetail}
                            className="h-full min-h-[300px]"
                        />
                    </div>
                </div>
                <div className="col-span-12 xl:col-span-4 space-y-6 flex flex-col">
                    <QuickFocusWidget
                        lastSession={todaySessions[0]}
                        onStartSession={handleStartSession}
                        fullHeight={false}
                    />
                    <ProductivityWidget
                        focusMinutes={focusMinutes}
                        tasksCompleted={tasks.filter((t: any) => t.status === 'done').length}
                        streak={streak}
                        dailyGoal={240}
                        fullHeight={false}
                    />
                    <CalendarWidget
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        markedDates={tasks.filter((t: any) => t.due_date).map((t: any) => t.due_date)}
                        fullHeight={false}
                    />
                </div>
            </div>

            <DailyLogModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
            />

            {isSystemModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsSystemModalOpen(false)}
                >
                    {/* Subtle backdrop blur without heavy black */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />

                    {/* Floating window */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <SystemCanvas
                            onSuccess={() => setIsSystemModalOpen(false)}
                            onCancel={() => setIsSystemModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Habit Detail Modal */}
            {selectedHabitForDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="p-8 md:p-12">
                            <HabitDetailCard
                                habit={selectedHabitForDetail}
                                onClose={() => setSelectedHabitForDetail(null)}
                            />
                        </div>
                        <button
                            onClick={() => setSelectedHabitForDetail(null)}
                            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
