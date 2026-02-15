import { Timer } from './Timer';
import FocusIsland from './Focus/FocusIsland';
import { useGetRecentSessionsQuery } from '../features/api/apiSlice';
import { Clock, Zap, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function DeepWorkView() {
    return (
        <div className="flex flex-col xl:flex-row gap-8 h-full">
            {/* Main Focus Zone */}
            <div className="flex-1 flex flex-col gap-8">
                <div className="flex-1 glass-panel rounded-[3rem] p-12 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />

                    <div className="relative z-10 w-full">
                        <section className="text-center mb-8">
                            <h2 className="text-4xl font-black text-[var(--text-heading)] italic uppercase tracking-tighter">Flow State</h2>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-[0.3em] mt-2">Activate the protocol. Silence the entropy.</p>
                        </section>

                        <Timer />
                    </div>
                </div>

                {/* Focus Island / Zen Garden */}
                <div className="h-[450px] glass-panel rounded-[3rem] p-8 flex flex-col relative group overflow-hidden">
                    <div className="flex justify-between items-start relative z-20">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-400 mb-1">
                                <Sparkles size={16} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Zen Garden</h3>
                            </div>
                            <h2 className="text-2xl font-black text-[var(--text-heading)] italic uppercase tracking-tight">Your Focus Island</h2>
                        </div>
                        <div className="p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--glass-border)]">
                            <Target className="text-[var(--text-dim)]" size={20} />
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <FocusIsland />
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Complete sessions to plant more trees
                    </div>
                </div>
            </div>

            {/* Sidebar Analytics */}
            <div className="w-full xl:w-96 flex flex-col gap-8">
                <SessionStats />
                <RecentSessionsList />
            </div>
        </div>
    );
}

function SessionStats() {
    return (
        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10">
            <h3 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Zap size={16} fill="currentColor" /> Session Intel
            </h3>
            <div className="space-y-6">
                <div>
                    <div className="text-5xl font-black text-[var(--text-heading)] italic tracking-tighter">1.2h</div>
                    <div className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest mt-1">Focused Today</div>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-500"
                    />
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                    <span>Target: 2h</span>
                    <span className="text-[var(--text-main)]">65% Reached</span>
                </div>
            </div>
        </div>
    )
}

function RecentSessionsList() {
    const { data: sessions = [] } = useGetRecentSessionsQuery();

    return (
        <div className="glass-panel p-8 rounded-[2.5rem] flex-1 min-h-0 flex flex-col border border-white/10">
            <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Clock size={16} /> Extraction Log
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {sessions.map(session => (
                    <div key={session.id} className="bg-[var(--bg-card)] p-5 rounded-3xl flex justify-between items-center border border-[var(--glass-border)] hover:border-[var(--accent)]/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-app)] flex items-center justify-center text-lg">
                                {session.type === 'pomodoro' ? '🍅' : '⚡'}
                            </div>
                            <div>
                                <div className="font-black text-xs text-[var(--text-heading)] uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{session.type}</div>
                                <div className="text-[10px] text-[var(--text-dim)] font-bold uppercase mt-1">{new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        <div className="text-[var(--text-heading)] font-black text-sm italic">
                            +{session.actual_minutes}m
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-30">
                        <Target size={40} className="mb-4" />
                        <div className="text-[10px] font-black uppercase tracking-widest">No focus captures found</div>
                    </div>
                )}
            </div>
        </div>
    )
}
