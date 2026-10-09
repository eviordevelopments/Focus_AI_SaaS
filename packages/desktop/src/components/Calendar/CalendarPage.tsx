import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, RefreshCw, Plus } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import EventModal from './EventModal';
import { useGetTasksQuery, useGetHabitsQuery, useGetSystemsQuery, useGetAreasQuery } from '../../features/api/apiSlice';

import { useDispatch } from 'react-redux';
import { setActiveTab, setPendingSessionConfig } from '../../features/ui/uiSlice';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarPage() {
    const dispatch = useDispatch();
    const [view, setView] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(undefined);
    const [modalInitialStartTime, setModalInitialStartTime] = useState<Date | undefined>(undefined);

    // Data
    const { data: tasks = [] } = useGetTasksQuery();
    const { data: habits = [] } = useGetHabitsQuery({});
    const { data: systems = [] } = useGetSystemsQuery();
    const { data: areas = [] } = useGetAreasQuery();

    const handlePrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    const [externalEvents, setExternalEvents] = useState<any[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            // @ts-ignore
            if (window.electron && window.electron.syncAppleCalendar) {
                // @ts-ignore
                const events = await window.electron.syncAppleCalendar();
                setExternalEvents(events);
            } else {
                alert('Mac Calendar sync is only available in the Desktop App. For Web, Google Calendar integration is coming soon!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to sync. Please ensure you grant Calendar permissions to Terminal/App.');
        } finally {
            setIsSyncing(false);
        }
    };

    // Merge internal tasks and external events for display
    const mappedExternalEvents = externalEvents.map((e: any) => {
        const startDateString = e.start || '';
        return {
            id: `ext-${e.title}-${startDateString}`,
            title: e.title,
            due_date: startDateString.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
            start_time: startDateString,
            status: 'external'
        };
    });

    // Map systems to calendar events
    const mappedSystems = systems.flatMap((system: any) => {
        const area = areas.find((a: any) => a.id === system.life_area_id);

        // Convert HH:mm to full ISO date for today to prevent "Invalid Date"
        const getFullDate = (timeStr: string) => {
            if (!timeStr || !timeStr.includes(':')) return null;
            const [h, m] = timeStr.split(':');
            const d = new Date();
            d.setHours(parseInt(h), parseInt(m), 0, 0);
            return d.toISOString();
        };

        // scheduled_days is typically [0,1,2,3,4,5,6] or similar
        let recurringDays: string[] = [];
        try {
            const days = typeof system.scheduled_days === 'string' ? JSON.parse(system.scheduled_days) : system.scheduled_days;
            if (Array.isArray(days)) {
                const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                recurringDays = days.map(d => dayMap[d]);
            }
        } catch (e) {
            recurringDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        }

        return {
            id: `system-${system.id}`,
            title: system.name,
            due_date: system.start_time ? `2000-01-01T${system.start_time}` : undefined, // Placeholder to avoid 'today' lock
            start_time: getFullDate(system.start_time),
            end_time: getFullDate(system.end_time),
            location: system.location,
            link: system.link,
            color: area?.color_hex || '#6366f1',
            type: 'system',
            focus_session: system.focus_session,
            system_id: system.id,
            is_recurring: true,
            recurring_days: recurringDays,
            session_config: system.focus_session ? JSON.stringify({
                type: 'focus',
                duration: system.duration_minutes || 30
            }) : null
        };
    });

    const displayTasks = [...tasks, ...mappedExternalEvents, ...mappedSystems];

    // Handlers
    const handleDateClick = (date: Date) => {
        setCurrentDate(date);
        setView('day');
    };

    const handleTimeClick = (date: Date) => {
        setModalInitialDate(date);
        setModalInitialStartTime(date);
        setIsModalOpen(true);
    };

    const [selectedTask, setSelectedTask] = useState<any>(null);

    const handleEventClick = (task: any) => {
        if (task.id?.startsWith('ext-')) {
            alert(`External Event: ${task.title}\n(Read-only)`);
            return;
        }

        if (task.session_config) {
            try {
                const config = JSON.parse(task.session_config);
                if (confirm(`Begin "${config.type}" protocol for "${task.title}"?`)) {
                    dispatch(setPendingSessionConfig({
                        type: config.type,
                        duration: config.duration || 30,
                        taskId: task.id
                    }));
                    dispatch(setActiveTab('deepwork'));
                    return;
                }
            } catch (e) { }
        }

        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const openNewEventModal = () => {
        setSelectedTask(null);
        setModalInitialDate(currentDate);
        setModalInitialStartTime(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full space-y-4 relative">
            {/* Header / Controls */}
            {/* ... (Header content) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/5 z-10">

                {/* Left: Title & Date */}
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md">
                        <CalIcon className="text-white/80" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {view === 'month' && format(currentDate, 'MMMM yyyy')}
                            {view === 'week' && `Week of ${format(currentDate, 'MMM d, yyyy')}`}
                            {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
                        </h1>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                            {view === 'month' ? 'Monthly Overview' : view === 'week' ? 'Weekly Schedule' : 'Daily Agenda'}
                        </p>
                    </div>
                </div>

                {/* Middle: Navigation */}
                <div className="flex items-center gap-2 bg-black/30 p-1 rounded-xl border border-white/10">
                    <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleToday} className="px-4 py-1.5 text-sm font-medium hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                        Today
                    </button>
                    <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Right: View Switcher & Sync */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${view === 'month' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${view === 'week' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${view === 'day' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Day
                        </button>
                    </div>

                    {/* Sync Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Add Event Button */}
                        <button
                            onClick={openNewEventModal}
                            className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                            title="Add Event"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 z-0">
                {view === 'month' && (
                    <MonthView date={currentDate} tasks={displayTasks} habits={habits} onDateClick={handleDateClick} />
                )}
                {view === 'week' && (
                    <WeekView date={currentDate} tasks={displayTasks} habits={habits} onDateClick={handleDateClick} onEventClick={handleEventClick} />
                )}
                {view === 'day' && (
                    <DayView date={currentDate} tasks={displayTasks} habits={habits} onTimeClick={handleTimeClick} onEventClick={handleEventClick} />
                )}
            </div>



            {/* Modal */}
            <EventModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                }}
                initialDate={modalInitialDate}
                initialStartTime={modalInitialStartTime}
                editingTask={selectedTask}
            />
        </div>
    );
}
