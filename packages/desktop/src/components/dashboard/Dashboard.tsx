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
import { DailyLogModal } from '../Focus/DailyLogModal';
import { HabitDetailCard } from '../Focus/HabitDetailCard';
import { SystemCanvas } from '../Focus/SystemCanvas';
import { Settings2, X, Plus } from 'lucide-react';

export default function Dashboard() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
    const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<any>(null);

    // Queries
    const { data: tasks = [] } = useGetTasksQuery();
    const { data: habits = [] } = useGetHabitsQuery({});
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
    const burnoutScore = burnoutData?.score || 0;

    const todaySessions = recentSessions?.filter((s: any) => {
        if (!s.start_time) return false;
        try {
            const dateVal = new Date(s.start_time);
            return !isNaN(dateVal.getTime()) && dateVal.toISOString().startsWith(todayStr);
        } catch (e) { return false; }
    }) || [];

    const focusMinutes = todaySessions.reduce((acc: number, s: any) => acc + (s.actual_minutes || s.planned_minutes || 0), 0);
    const streak = habits.reduce((max: number, h: any) => Math.max(max, h.streak || 0), 0);

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
            {/* Gamified Header Section */}
            <div className="grid grid-cols-12 gap-8 items-stretch">
                {/* Main Character Status Card */}
                <div className="col-span-12 xl:col-span-7">
                    <div className="h-full relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-10 text-white shadow-2xl shadow-indigo-500/20 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-100">Main Character Status: {currentIdentity}</h2>
                                        <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Agent {user?.name?.split(' ')[0]}</div>
                                    </div>
                                    <h3 className="text-4xl font-black mt-2 flex items-baseline gap-3">
                                        LEVEL {level}
                                        <span className="text-lg font-bold text-indigo-200">/ Mastery {Math.floor(level / 10) + 1}</span>
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black">{currentXP.toLocaleString()}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Total XP Earned</div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-indigo-100">
                                    <span>Daily Progress</span>
                                    <span>{Math.round(progressPercent)}% to LVL {level + 1}</span>
                                </div>
                                <div className="w-full h-4 bg-black/20 rounded-full p-1 overflow-hidden backdrop-blur-md">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 via-indigo-300 to-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Achievement / Compliance Card */}
                <div className="col-span-12 xl:col-span-5">
                    <div className="h-full glass-panel rounded-[2.5rem] border border-white/10 bg-white/5 p-10 flex flex-col justify-center items-center text-center shadow-xl">
                        <div className="relative group">
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
                                    className="text-indigo-500 drop-shadow-[0_0_8px_rgba(79,70,229,0.5)] transition-all duration-1000 ease-out"
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
                                <span className="text-3xl font-black text-white">{Math.round(gamifiedDashboard?.dailyCompliance || 0)}%</span>
                            </div>
                        </div>
                        <h4 className="mt-6 text-sm font-black uppercase tracking-widest text-gray-400">Daily Compliance</h4>
                        <p className="text-gray-500 text-xs mt-2 max-w-[200px]">
                            {gamifiedDashboard?.dailyCompliance > 80 ? 'Mastery reached. Protocol followed with high precision.' :
                                gamifiedDashboard?.dailyCompliance > 50 ? 'Steady progress. Maintaining system integrity.' :
                                    'Initialize daily protocols to begin tracking performance.'}
                        </p>

                        <div className="flex gap-4 mt-8 w-full">
                            <button
                                onClick={() => setIsLogModalOpen(true)}
                                className="flex-1 bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
                            >
                                LOG DAY
                            </button>
                            <button
                                onClick={() => setIsSystemModalOpen(true)}
                                className="w-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
                                title="Create New System"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                onClick={() => dispatch(setActiveTab('systems'))}
                                className="w-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
                            >
                                <Settings2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Row: Burnout Gauge & Contributing Factors (HealthWidget) */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-4">
                    <GlassCard className="h-full flex flex-col justify-center items-center relative min-h-[220px]">
                        <h3 className="absolute top-6 left-6 font-bold text-lg text-white">Burnout Score</h3>
                        <div className="relative w-48 h-24 overflow-hidden mt-8">
                            <div className="absolute w-full h-full rounded-tl-full rounded-tr-full bg-white/10" />
                            <div
                                className={`absolute w-full h-full rounded-tl-full rounded-tr-full origin-bottom transition-all duration-1000 ease-out
                                ${burnoutScore <= 25 ? 'bg-emerald-500' :
                                        burnoutScore <= 50 ? 'bg-amber-500' :
                                            burnoutScore <= 75 ? 'bg-orange-500' : 'bg-rose-500'}`}
                                style={{ transform: `rotate(${(burnoutScore / 100) * 180 - 180}deg)` }}
                            />
                        </div>
                        <div className="absolute bottom-16 flex flex-col items-center">
                            <span className="text-4xl font-bold text-white mb-2">{burnoutScore}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                ${burnoutScore <= 25 ? 'bg-emerald-500/20 text-emerald-400' :
                                    burnoutScore <= 50 ? 'bg-amber-500/20 text-amber-400' :
                                        burnoutScore <= 75 ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {burnoutData?.level || 'Healthy'}
                            </span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <TasksWidget
                            tasks={tasks.filter((t: any) => {
                                if (t.status !== 'done') return true;
                                if (!t.due_date) return false;
                                try {
                                    return new Date(t.due_date).toISOString().startsWith(todayStr);
                                } catch (e) { return false; }
                            })}
                            onToggle={handleTaskToggle}
                        />
                        <EisenhowerWidget />
                        <HabitsWidget
                            habits={habits}
                            onToggle={handleHabitToggle}
                            onViewDetails={setSelectedHabitForDetail}
                        />
                    </div>
                </div>
                <div className="col-span-12 xl:col-span-4 space-y-6">
                    <QuickFocusWidget
                        lastSession={todaySessions[0]}
                        onStartSession={handleStartSession}
                    />
                    <ProductivityWidget
                        focusMinutes={focusMinutes}
                        tasksCompleted={tasks.filter((t: any) => t.status === 'done').length}
                        streak={streak}
                        dailyGoal={240}
                    />
                    <CalendarWidget
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        markedDates={tasks.filter((t: any) => t.due_date).map((t: any) => t.due_date)}
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
