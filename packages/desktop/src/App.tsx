import { useState, useEffect } from 'react'
import { LayoutDashboard, CheckSquare, BrainCircuit, Activity, GraduationCap, Bot, Calendar as CalIcon, ChevronLeft, ChevronRight, Target, TrendingUp, Compass, Globe, Hash, BookOpen, Workflow, Settings } from 'lucide-react'
import { TaskList } from './components/TaskList'
import { DeepWorkView } from './components/DeepWorkView'
import { HealthView } from './components/HealthView'
import { LearningView } from './components/LearningView'
import { FocusAIView } from './components/FocusAIView'
import { EisenhowerMatrixPage } from './components/Eisenhower/EisenhowerMatrixPage'
import { AuthLayout } from './components/Auth/AuthLayout'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { setActiveTab } from './features/ui/uiSlice'
import { WelcomeSplash } from './components/WelcomeSplash'
import { WeeklyReview } from './components/Focus/WeeklyReview'
import { QuarterlyPlanning } from './components/Focus/QuarterlyPlanning'
import { LifeAreasGrid } from './components/Focus/LifeAreasGrid'
import { QuestDashboard } from './components/Focus/QuestDashboard'
import { HabitsView } from './components/Focus/HabitsView'
import { XPProvider } from './components/Focus/XPOverlay'
import { SidebarDateDisplay } from './components/ui/SidebarDateDisplay'
import { SidebarProfile } from './components/ui/SidebarProfile'
import { SettingsView } from './components/SettingsView'
import { ReferencesView } from './components/References/ReferencesView'

import Dashboard from './components/dashboard/Dashboard'
import CalendarPage from './components/Calendar/CalendarPage'
import WorkflowsPage from './components/Workflows/WorkflowsPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import logo from './assets/logo.png'
import deepmindLogo from './assets/deepmind.png'

import { tick } from './features/timer/timerSlice'
import GlobalTimerHeader from './components/GlobalTimerHeader'
import SessionBlockingOverlay from './components/SessionBlockingOverlay'

function App() {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
    const { activeTab } = useSelector((state: RootState) => state.ui)
    const { mode: themeMode } = useSelector((state: RootState) => state.theme)
    const { showPostSession } = useSelector((state: RootState) => state.timer)

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const dispatch = useDispatch()

    const [showSplash, setShowSplash] = useState(false);
    const [hasShownSplash, setHasShownSplash] = useState(false);

    // Global Timer Tick
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(tick());
        }, 1000);
        return () => clearInterval(interval);
    }, [dispatch]);

    // System Notifications - Safeguarded for Electron environments
    useEffect(() => {
        if (typeof Notification !== 'undefined') {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

    useEffect(() => {
        if (showPostSession && typeof Notification !== 'undefined') {
            try {
                new Notification("Focus Protocol Secured", {
                    body: "Mission complete. Your rewards are waiting.",
                    icon: logo
                });
            } catch (e) {
                console.warn("Notification failed", e);
            }
        }
    }, [showPostSession]);

    // Handle splash visibility via effect to avoid re-render loops
    useEffect(() => {
        if (isAuthenticated && !hasShownSplash && !showSplash) {
            setShowSplash(true);
        }
    }, [isAuthenticated, hasShownSplash, showSplash]);

    // Apply theme side effects to body
    useEffect(() => {
        if (themeMode === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, [themeMode]);

    if (!isAuthenticated) {
        return (
            <ErrorBoundary>
                <AuthLayout />
            </ErrorBoundary>
        )
    }

    if (showSplash) {
        return (
            <WelcomeSplash
                userName={user?.name || 'User'}
                onComplete={() => {
                    setShowSplash(false);
                    setHasShownSplash(true);
                }}
            />
        );
    }

    return (
        <ErrorBoundary>
            <XPProvider>
                <div className="flex h-screen w-full bg-[var(--bg-app)] text-[var(--text-main)] overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
                    <GlobalTimerHeader />
                    <SessionBlockingOverlay />

                    <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none mix-blend-screen animate-pulse" />
                    <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />

                    <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-20 lg:w-72'} m-4 h-[calc(100%-2rem)] rounded-[2.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-3xl flex flex-col transition-all duration-700 z-50 shadow-2xl relative group`}>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="absolute -right-3 top-24 w-7 h-7 bg-[var(--bg-side)] rounded-full flex items-center justify-center border border-[var(--glass-border)] shadow-2xl text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all z-50 hover:bg-white hover:text-black hover:scale-110 active:scale-95"
                        >
                            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>

                        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'items-center pt-8' : 'pt-8'}`}>
                            <div className={`flex items-center gap-1.5 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : 'px-8 mb-6'}`}>
                                <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 ${isSidebarCollapsed ? 'w-12 h-12' : 'w-12 h-12'}`}>
                                    <img src={logo} alt="Focus AI" className="w-full h-full object-contain" />
                                </div>
                                {!isSidebarCollapsed && (
                                    <img src={deepmindLogo} alt="Deepmind" className="h-8 w-auto hidden lg:block animate-in fade-in slide-in-from-left-2 duration-500 translate-y-[1px]" />
                                )}
                            </div>
                            <SidebarDateDisplay collapsed={isSidebarCollapsed} />
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
                            <SectionHeader label="Core" collapsed={isSidebarCollapsed} />
                            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => dispatch(setActiveTab('dashboard'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<BookOpen size={20} />} label="References" active={activeTab === 'references'} onClick={() => dispatch(setActiveTab('references'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<CalIcon size={20} />} label="Calendar" active={activeTab === 'calendar'} onClick={() => dispatch(setActiveTab('calendar'))} collapsed={isSidebarCollapsed} />

                            <SectionHeader label="Deep Work" collapsed={isSidebarCollapsed} />
                            <NavItem icon={<CheckSquare size={20} />} label="Tasks" active={activeTab === 'tasks'} onClick={() => dispatch(setActiveTab('tasks'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Target size={20} />} label="Eisenhower" active={activeTab === 'eisenhower'} onClick={() => dispatch(setActiveTab('eisenhower'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<BrainCircuit size={20} />} label="Flow State" active={activeTab === 'deepwork'} onClick={() => dispatch(setActiveTab('deepwork'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Hash size={20} />} label="Habits" active={activeTab === 'habits'} onClick={() => dispatch(setActiveTab('habits'))} collapsed={isSidebarCollapsed} />

                            <SectionHeader label="Growth" collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Activity size={20} />} label="Biometrics" active={activeTab === 'health'} onClick={() => dispatch(setActiveTab('health'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<GraduationCap size={20} />} label="Academy" active={activeTab === 'learning'} onClick={() => dispatch(setActiveTab('learning'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Bot size={20} />} label="Cognitive AI" active={activeTab === 'focus-ai'} onClick={() => dispatch(setActiveTab('focus-ai'))} collapsed={isSidebarCollapsed} />

                            <SectionHeader label="Strategy" collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Workflow size={20} />} label="Sistemas" active={activeTab === 'systems'} onClick={() => dispatch(setActiveTab('systems'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<TrendingUp size={20} />} label="Reviews" active={activeTab === 'reviews'} onClick={() => dispatch(setActiveTab('reviews'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Compass size={20} />} label="Planning" active={activeTab === 'planning'} onClick={() => dispatch(setActiveTab('planning'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Globe size={20} />} label="Architecture" active={activeTab === 'areas'} onClick={() => dispatch(setActiveTab('areas'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => dispatch(setActiveTab('settings'))} collapsed={isSidebarCollapsed} />
                        </nav>

                        <SidebarProfile user={user} collapsed={isSidebarCollapsed} />
                    </aside>

                    <main className="flex-1 h-full overflow-hidden relative z-10 pt-20 lg:pt-4">
                        <div className="h-full overflow-y-auto custom-scrollbar scroll-smooth">
                            <div className="p-4 md:p-8 min-h-full">
                                {activeTab === 'dashboard' && <Dashboard />}
                                {activeTab === 'references' && <ReferencesView />}
                                {activeTab === 'calendar' && <CalendarPage />}
                                {activeTab === 'tasks' && <TaskList />}
                                {activeTab === 'deepwork' && <DeepWorkView />}
                                {activeTab === 'health' && <HealthView />}
                                {activeTab === 'learning' && <LearningView />}
                                {activeTab === 'focus-ai' && <FocusAIView />}
                                {activeTab === 'eisenhower' && <EisenhowerMatrixPage />}
                                {activeTab === 'systems' && <WorkflowsPage />}
                                {activeTab === 'reviews' && <WeeklyReview />}
                                {activeTab === 'planning' && <QuarterlyPlanning />}
                                {activeTab === 'areas' && <LifeAreasGrid />}
                                {activeTab === 'quests' && <QuestDashboard />}
                                {activeTab === 'habits' && <HabitsView />}
                                {activeTab === 'settings' && <SettingsView />}
                            </div>
                        </div>
                    </main>
                </div>
            </XPProvider>
        </ErrorBoundary>
    )
}

function SectionHeader({ label, collapsed }: { label: string, collapsed: boolean }) {
    if (collapsed) return <div className="h-px bg-white/5 mx-4 my-4" />;
    return (
        <div className="px-4 pt-6 pb-2 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] animate-in fade-in duration-700">
            {label}
        </div>
    );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${active ? 'bg-indigo-500/10 text-indigo-400 shadow-xl backdrop-blur-xl border border-indigo-500/20' : 'text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-white/[0.03]'}`}
        >
            <span className={`shrink-0 transition-all duration-500 ${active ? 'text-indigo-400 scale-110' : 'group-hover:text-indigo-400 group-hover:scale-110'}`}>{icon}</span>
            <span className={`text-[13px] font-bold tracking-tight transition-all duration-500 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1 text-left'}`}>
                {label}
            </span>
            {active && !collapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse" />
            )}
            {collapsed && (
                <div className="absolute left-16 px-3 py-2 bg-[var(--bg-side)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 z-[60] pointer-events-none border border-[var(--glass-border)] shadow-2xl">
                    {label}
                </div>
            )}
        </button>
    )
}

export default App
