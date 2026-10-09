import React, { useState, useMemo } from 'react';
import { GanttChartSquare, ChevronLeft, ChevronRight, Plus, Filter, Search, User, CheckCircle2, Circle } from 'lucide-react';
import { format, addDays, startOfWeek, subDays, differenceInDays } from 'date-fns';

// MOCK DATA
type Status = 'todo' | 'in-progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface GanttTask {
    id: string;
    title: string;
    assignee: string;
    avatar: string;
    status: Status;
    priority: Priority;
    startDate: Date;
    endDate: Date;
    progress: number; // 0-100
    category: string;
    color: string;
}

const mockTasks: GanttTask[] = [
    {
        id: 't1', title: 'Phase 1: Research', assignee: 'Alex M.', avatar: 'A', status: 'done', priority: 'high',
        startDate: addDays(new Date(), -5), endDate: addDays(new Date(), -1), progress: 100, category: 'Planning', color: 'bg-indigo-500'
    },
    {
        id: 't2', title: 'Architecture Design', assignee: 'Sam K.', avatar: 'S', status: 'in-progress', priority: 'high',
        startDate: addDays(new Date(), -1), endDate: addDays(new Date(), 3), progress: 60, category: 'Engineering', color: 'bg-pink-500'
    },
    {
        id: 't3', title: 'API Implementation', assignee: 'Dev Team', avatar: 'D', status: 'todo', priority: 'medium',
        startDate: addDays(new Date(), 2), endDate: addDays(new Date(), 7), progress: 0, category: 'Engineering', color: 'bg-emerald-500'
    },
    {
        id: 't4', title: 'Frontend UI', assignee: 'Alex M.', avatar: 'A', status: 'todo', priority: 'high',
        startDate: addDays(new Date(), 4), endDate: addDays(new Date(), 10), progress: 0, category: 'Design', color: 'bg-amber-500'
    },
    {
        id: 't5', title: 'Beta Testing', assignee: 'QA', avatar: 'Q', status: 'todo', priority: 'medium',
        startDate: addDays(new Date(), 10), endDate: addDays(new Date(), 14), progress: 0, category: 'QA', color: 'bg-indigo-500'
    }
];

// Constants for layout
const DAY_WIDTH = 48; // px per day
const ROW_HEIGHT = 64; // px per row
const HEADER_HEIGHT = 80;

export const GanttStudio: React.FC = () => {
    const [tasks] = useState<GanttTask[]>(mockTasks);
    const [startDateOffset, setStartDateOffset] = useState(-7); // Start 7 days ago

    // Generate timeline
    const timelineStart = startOfWeek(addDays(new Date(), startDateOffset));
    const totalDays = 30; // Render 30 days
    
    const days = useMemo(() => {
        return Array.from({ length: totalDays }).map((_, i) => addDays(timelineStart, i));
    }, [timelineStart, totalDays]);

    const getStatusIcon = (status: Status) => {
        switch(status) {
            case 'done': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'in-progress': return <Circle size={16} className="text-amber-500 fill-amber-500/20" />;
            case 'todo': return <Circle size={16} className="text-white/30" />;
        }
    };

    const getTaskStyle = (task: GanttTask) => {
        const startOffset = differenceInDays(task.startDate, timelineStart);
        const duration = differenceInDays(task.endDate, task.startDate) + 1; // +1 to include end day
        
        return {
            left: `${startOffset * DAY_WIDTH}px`,
            width: `${duration * DAY_WIDTH}px`,
            height: '32px', // pill height
            marginTop: '16px' // (64 - 32)/2 vertically center
        };
    };

    return (
        <div className="flex flex-col h-full w-full font-sans relative z-10 animate-in fade-in duration-500 bg-transparent text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between p-8 pb-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <GanttChartSquare className="text-indigo-400" size={32} />
                        Gantt Studio
                    </h1>
                    <p className="text-white/50 mt-1">Visualize project timelines with impeccable clarity.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                        <button onClick={() => setStartDateOffset(p => p - 7)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                        <button className="px-4 text-sm font-medium border-x border-white/5 flex items-center">Timeline</button>
                        <button onClick={() => setStartDateOffset(p => p + 7)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                    </div>
                    <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        <Filter size={18} />
                    </button>
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Plus size={18} /> New Task
                    </button>
                </div>
            </div>

            {/* Main Gantt Area - Glass Panel Split View */}
            <div className="flex-1 overflow-hidden p-8 pt-0 flex gap-4">
                
                <div className="flex w-full bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    
                    {/* Left Sidebar: Task List */}
                    <div className="w-[350px] shrink-0 border-r border-white/10 flex flex-col bg-white/[0.02]">
                        <div className="h-[80px] border-b border-white/10 p-4 flex items-center justify-between">
                            <span className="font-semibold text-white/80">Tasks</span>
                            <Search size={16} className="text-white/30" />
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {tasks.map(task => (
                                <div key={task.id} className="h-[64px] border-b border-white/5 px-4 flex items-center gap-3 hover:bg-white/5 transition-colors group cursor-pointer">
                                    {getStatusIcon(task.status)}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[13px] font-semibold truncate group-hover:text-indigo-300 transition-colors">{task.title}</h3>
                                        <p className="text-[11px] text-white/40">{task.category}</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/20">
                                        {task.avatar}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Timeline Grid */}
                    <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar relative">
                        {/* Timeline Header */}
                        <div className="h-[80px] border-b border-white/10 flex sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-md z-20 shrink-0">
                            {days.map(day => {
                                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                                return (
                                    <div key={day.toISOString()} style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }} className="flex flex-col items-center justify-center border-r border-white/5 shrink-0 relative">
                                        <span className="text-[10px] text-white/40 uppercase tracking-widest">{format(day, 'EEE')}</span>
                                        <span className={`text-[13px] font-semibold mt-1 ${isToday ? 'text-indigo-400 bg-indigo-500/20 w-6 h-6 rounded-full flex items-center justify-center' : 'text-white/80'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {/* Marker for today line that extends down */}
                                        {isToday && <div className="absolute top-[80px] left-1/2 w-[2px] h-[2000px] bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-0 -translate-x-1/2 pointer-events-none" />}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Gantt Body / Rows */}
                        <div className="relative flex-1">
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 flex pointer-events-none z-0">
                                {days.map((day, i) => (
                                    <div key={i} style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }} className="h-full border-r border-white/[0.03] shrink-0" />
                                ))}
                            </div>

                            {/* Task Rows & Bars */}
                            <div className="relative z-10 pt-0">
                                {tasks.map((task, idx) => (
                                    <div key={task.id} style={{ height: ROW_HEIGHT }} className="border-b border-white/5 relative w-max group hover:bg-white/[0.02] transition-colors">
                                        
                                        {/* The Gantt Bar */}
                                        <div 
                                            style={getTaskStyle(task)}
                                            className="absolute rounded-full overflow-hidden shadow-lg shadow-black/20 group-hover:ring-2 ring-white/20 transition-all cursor-pointer"
                                        >
                                            {/* Bar Background (Base Color with opacity) */}
                                            <div className={`absolute inset-0 ${task.color} opacity-20`} />
                                            
                                            {/* Bar Progress (Solid Color) */}
                                            <div 
                                                className={`absolute inset-y-0 left-0 ${task.color} opacity-80`} 
                                                style={{ width: `${task.progress}%` }} 
                                            />
                                            
                                            {/* Overlay for glass effect */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

                                            {/* Label inside bar */}
                                            <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                                                <span className="text-[11px] font-bold text-white drop-shadow-md truncate">
                                                    {task.progress}%
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
