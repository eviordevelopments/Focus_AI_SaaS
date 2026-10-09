import { Timer } from './Timer';
import { useGetTasksQuery, useGetHabitsQuery, useStartSessionMutation } from '../features/api/apiSlice';
import { Play, Calendar as CalIcon, Target, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { startTimer } from '../features/timer/timerSlice';

export function DeepWorkView() {
    return (
        <div className="flex flex-col xl:flex-row gap-8 h-full">
            {/* Main Focus Zone - Centered Hero Timer */}
            <div className="flex-1 flex flex-col gap-8">
                <div className="flex-1 bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[3rem] p-12 flex flex-col items-center justify-center relative overflow-hidden min-h-[600px]">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />

                    <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
                        <section className="text-center mb-12">
                            <h2 className="text-4xl font-black text-[var(--text-heading)] uppercase tracking-tighter">Flow State</h2>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-[0.3em] mt-2">Activate the protocol. Silence the entropy.</p>
                        </section>

                        <div className="w-full flex justify-center scale-110">
                            <Timer />
                        </div>
                    </div>
                </div>
            </div>

            {/* Up Next Sidebar */}
            <div className="w-full xl:w-[450px] flex flex-col gap-8">
                <UpNextSidebar />
            </div>
        </div>
    );
}

function UpNextSidebar() {
    const { data: tasks = [] } = useGetTasksQuery();
    const { data: habits = [] } = useGetHabitsQuery();
    const dispatch = useDispatch();
    const [startSessionApi] = useStartSessionMutation();

    // Map habits to a unified executable item format
    const executableHabits = habits.map((h: any) => ({
        id: `habit-${h.id}`,
        title: h.name,
        type: 'Habit',
        icon: '💎',
        duration: h.duration_minutes || 25,
        original_id: h.id
    }));

    // Map tasks that have session configs or are just standard tasks
    const executableTasks = tasks.filter((t: any) => t.status !== 'done').map((t: any) => {
        let duration = 25; // Default Pomodoro
        if (t.session_config) {
            try {
                duration = JSON.parse(t.session_config).duration || 25;
            } catch (e) { }
        }
        return {
            id: `task-${t.id}`,
            title: t.title,
            type: 'Task',
            icon: '🎯',
            duration: duration,
            original_id: t.id
        }
    });

    const allExecutables = [...executableHabits, ...executableTasks];

    const handleExecute = async (item: any) => {
        try {
            // Register session in backend
            const result = await startSessionApi({
                type: 'pomodoro',
                planned_minutes: item.duration,
                linked_id: item.original_id
            }).unwrap();
            
            // Set the timer target and start
            dispatch(startTimer({
                minutes: item.duration,
                id: result.id,
                mode: 'pomodoro'
            }));
        } catch (err) {
            console.error("Failed to start session", err);
        }
    };

    return (
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-8 rounded-[2.5rem] flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Layers size={16} /> Up Next / Programmed Blocks
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {allExecutables.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-30">
                        <Target size={40} className="mb-4" />
                        <div className="text-[10px] font-black uppercase tracking-widest">No pending blocks found</div>
                    </div>
                )}
                
                {allExecutables.map(item => (
                    <div key={item.id} className="bg-[var(--bg-card)] p-5 rounded-3xl flex justify-between items-center border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/10">
                                {item.icon}
                            </div>
                            <div className="min-w-0 truncate pr-4">
                                <div className="font-black text-sm text-[var(--text-heading)] truncate group-hover:text-indigo-400 transition-colors">
                                    {item.title}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-dim)] font-bold uppercase mt-1">
                                    <span>{item.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{item.duration} Min</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleExecute(item)}
                            className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                        >
                            <Play size={20} fill="currentColor" className="ml-1" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
