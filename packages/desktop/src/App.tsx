import { useState } from 'react'
import { LayoutDashboard, CheckSquare, BrainCircuit, Activity, GraduationCap, Bot, LogOut, Calendar as CalIcon, ChevronLeft, ChevronRight, Target, Settings2, TrendingUp, Compass, Globe, Hash } from 'lucide-react'
import { TaskList } from './components/TaskList'
import { DeepWorkView } from './components/DeepWorkView'
import { HealthView } from './components/HealthView'
import { LearningView } from './components/LearningView'
import { FocusAIView } from './components/FocusAIView'
import { EisenhowerMatrixPage } from './components/Eisenhower/EisenhowerMatrixPage'
import { AuthLayout } from './components/Auth/AuthLayout'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { logout } from './features/auth/authSlice'
import { setActiveTab } from './features/ui/uiSlice'
import { WelcomeSplash } from './components/WelcomeSplash'
import { SystemsView } from './components/Focus/SystemsView'
import { WeeklyReview } from './components/Focus/WeeklyReview'
import { QuarterlyPlanning } from './components/Focus/QuarterlyPlanning'
import { LifeAreasGrid } from './components/Focus/LifeAreasGrid'
import { QuestDashboard } from './components/Focus/QuestDashboard'
import { HabitsView } from './components/Focus/HabitsView'
import { XPProvider } from './components/Focus/XPOverlay'

import Dashboard from './components/dashboard/Dashboard'
import CalendarPage from './components/Calendar/CalendarPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import logo from './assets/logo.png'
import deepmindLogo from './assets/deepmind.png'

function App() {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
    const { activeTab } = useSelector((state: RootState) => state.ui)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const dispatch = useDispatch()


    const [showSplash, setShowSplash] = useState(false);
    const [hasShownSplash, setHasShownSplash] = useState(false);

    // Show splash on initial authentication
    if (isAuthenticated && !hasShownSplash && !showSplash) {
        setShowSplash(true);
    }

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
                <div className="flex h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 text-white overflow-hidden">
                    {/* Sidebar - Floating Glassmorphic */}
                    <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-20 lg:w-64'} m-4 h-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl flex flex-col transition-all duration-500 z-50 shadow-2xl relative group/sidebar`}>
                        {/* Collapse Toggle Button */}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border border-white/20 shadow-lg text-white opacity-0 group-hover/sidebar:opacity-100 transition-opacity z-50 hover:bg-blue-500 hover:scale-110 active:scale-95"
                        >
                            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>

                        <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'p-3 justify-center' : 'p-6'}`}>
                            <div className={`flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'w-14 h-14' : 'w-12 h-12'}`}>
                                <img src={logo} alt="Deepmind" className="w-full h-full object-contain" />
                            </div>
                            {!isSidebarCollapsed && (
                                <img
                                    src={deepmindLogo}
                                    alt="Deepmind"
                                    className="h-8 w-auto hidden lg:block animate-in fade-in slide-in-from-left-2 duration-300 translate-y-[2px]"
                                />
                            )}
                        </div>

                        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
                            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => dispatch(setActiveTab('dashboard'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<CalIcon size={20} />} label="Calendar" active={activeTab === 'calendar'} onClick={() => dispatch(setActiveTab('calendar'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<CheckSquare size={20} />} label="Tasks" active={activeTab === 'tasks'} onClick={() => dispatch(setActiveTab('tasks'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Target size={20} />} label="Eisenhower" active={activeTab === 'eisenhower'} onClick={() => dispatch(setActiveTab('eisenhower'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<BrainCircuit size={20} />} label="Deep Work" active={activeTab === 'deepwork'} onClick={() => dispatch(setActiveTab('deepwork'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Activity size={20} />} label="Health" active={activeTab === 'health'} onClick={() => dispatch(setActiveTab('health'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<GraduationCap size={20} />} label="Learning" active={activeTab === 'learning'} onClick={() => dispatch(setActiveTab('learning'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Bot size={20} />} label="Deepmind" active={activeTab === 'focus-ai'} onClick={() => dispatch(setActiveTab('focus-ai'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Settings2 size={20} />} label="Systems" active={activeTab === 'systems'} onClick={() => dispatch(setActiveTab('systems'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<TrendingUp size={20} />} label="Reviews" active={activeTab === 'reviews'} onClick={() => dispatch(setActiveTab('reviews'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Compass size={20} />} label="Planning" active={activeTab === 'planning'} onClick={() => dispatch(setActiveTab('planning'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Globe size={20} />} label="Architecture" active={activeTab === 'areas'} onClick={() => dispatch(setActiveTab('areas'))} collapsed={isSidebarCollapsed} />
                            <NavItem icon={<Target size={20} />} label="Quests" active={activeTab === 'quests'} onClick={() => dispatch(setActiveTab('quests'))} collapsed={isSidebarCollapsed} />

                            <div className="mt-8 pt-4 border-t border-white/10">
                                <NavItem icon={<LogOut size={20} />} label="Logout" active={false} onClick={() => dispatch(logout())} collapsed={isSidebarCollapsed} />
                            </div>
                            <NavItem icon={<Hash size={20} />} label="Habits" active={activeTab === 'habits'} onClick={() => dispatch(setActiveTab('habits'))} collapsed={isSidebarCollapsed} />
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex flex-col flex-1 h-full overflow-hidden relative transition-all duration-500">
                        {/* Background Blobs */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

                        {/* Header */}
                        <header className="h-16 border-b border-white/5 bg-black/5 backdrop-blur-sm flex justify-between items-center px-8 z-40 relative">
                            <h1 className="text-xl font-medium text-gray-200">
                                {activeTab === 'focus-ai' ? 'Deepmind Agent' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-white">{user?.name || 'User'}</div>
                                    <div className="text-xs text-gray-400">{new Date().toLocaleDateString()}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white border border-white/10 shadow-lg">
                                    {(user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </header>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 scroll-smooth">
                            {activeTab === 'dashboard' && <Dashboard />}
                            {activeTab === 'calendar' && <CalendarPage />}
                            {activeTab === 'tasks' && <TaskList />}
                            {activeTab === 'deepwork' && <DeepWorkView />}
                            {activeTab === 'health' && <HealthView />}
                            {activeTab === 'learning' && <LearningView />}
                            {activeTab === 'focus-ai' && <FocusAIView />}
                            {activeTab === 'eisenhower' && <EisenhowerMatrixPage />}
                            {activeTab === 'systems' && <SystemsView />}
                            {activeTab === 'reviews' && <WeeklyReview />}
                            {activeTab === 'planning' && <QuarterlyPlanning />}
                            {activeTab === 'areas' && <LifeAreasGrid />}
                            {activeTab === 'quests' && <QuestDashboard />}
                            {activeTab === 'habits' && <HabitsView />}
                        </div>
                    </main>
                </div>
            </XPProvider>
        </ErrorBoundary>
    )
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${active ? 'bg-white/10 text-white shadow-lg backdrop-blur-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <span className={`shrink-0 ${active ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'}`}>{icon}</span>
            <span className={`font-medium transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {label}
            </span>
            {collapsed && (
                <div className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none border border-white/10">
                    {label}
                </div>
            )}
        </button>
    )
}

export default App
