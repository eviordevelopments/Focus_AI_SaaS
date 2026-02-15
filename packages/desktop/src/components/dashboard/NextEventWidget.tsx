import { useState, useEffect } from 'react';
import { format, differenceInMinutes, isAfter, isBefore, addMinutes } from 'date-fns';
import { Bell, Clock, ArrowRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface NextEventWidgetProps {
    tasks: any[];
    habits: any[];
}

export default function NextEventWidget({ tasks, habits }: NextEventWidgetProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const getNextEvent = () => {
        const now = currentTime;
        const thirtyMinsFromNow = addMinutes(now, 30);

        const allEvents = [
            ...tasks.map(t => ({
                ...t,
                type: 'task',
                startTime: t.start_time ? new Date(t.start_time) : (t.due_date ? new Date(t.due_date) : null)
            })),
            ...habits.map(h => ({
                ...h,
                type: 'habit',
                title: h.name,
                startTime: h.start_time ? new Date(`1970-01-01T${h.start_time}`) : null
                // Habits might need better time handling if they are only time-of-day
            }))
        ]
            .filter(e => e.startTime && !isNaN(e.startTime.getTime()))
            // Adjust habit date to today for comparison
            .map(e => {
                if (e.type === 'habit') {
                    const d = new Date(now);
                    d.setHours(e.startTime.getHours(), e.startTime.getMinutes(), 0, 0);
                    return { ...e, startTime: d };
                }
                return e;
            })
            .filter(e => isAfter(e.startTime, now) && isBefore(e.startTime, thirtyMinsFromNow))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        return allEvents[0] || null;
    };

    const nextEvent = getNextEvent();

    if (!nextEvent) return null;

    const minsLeft = differenceInMinutes(nextEvent.startTime, currentTime);

    return (
        <GlassCard className="border-indigo-500/30 bg-indigo-500/10 animate-in slide-in-from-top duration-700 overflow-hidden relative" glowColor="bg-indigo-500/20" padding="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                        <Bell size={18} className="animate-bounce" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Next Protocol Initializing</span>
                        <div className="flex items-center gap-2 mt-0.5 text-indigo-200/50 font-black text-[9px] uppercase tracking-widest">
                            <Clock size={10} />
                            <span>Scheduled for {format(nextEvent.startTime, 'h:mm a')}</span>
                        </div>
                    </div>
                </div>
                <div className="px-3 py-1.5 bg-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-300 border border-indigo-500/20 shadow-inner">
                    {minsLeft} MINS REMAINING
                </div>
            </div>

            <div className="flex items-center justify-between mt-6">
                <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic truncate max-w-[400px]">
                    {nextEvent.title}
                </h4>

                <button className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-indigo-500/30">
                    <ArrowRight size={20} strokeWidth={3} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{ width: `${((30 - minsLeft) / 30) * 100}%` }}
                />
            </div>
        </GlassCard>
    );
}
