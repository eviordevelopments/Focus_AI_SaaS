import { useGetTasksQuery, useGetHabitsQuery, useGetAreasQuery } from '../features/api/apiSlice';
import { KanbanBoard } from './Kanban/KanbanBoard';

export function TaskList() {
    const { data: tasks = [], isLoading: loadingTasks } = useGetTasksQuery();
    const { data: habits = [], isLoading: loadingHabits } = useGetHabitsQuery({});
    const { data: areas = [] } = useGetAreasQuery();

    if (loadingTasks || loadingHabits) {
        return <div className="text-white p-4">Loading workspace...</div>;
    }

    const mappedHabits: any[] = habits.map((h: any) => ({
        id: `habit-${h.id}`,
        title: h.name,
        description: h.description,
        status: 'todo', // Default status for habits
        priority: 1, // Default priority (low)
        due_date: new Date().toISOString(),
        created_at: h.created_at || new Date().toISOString(),
        is_recurring: true,
        habit_type: h.habit_type,
        color: h.color_hex || '#8b5cf6',
        area_id: h.life_area_id,
        is_habit: true,
        original_id: h.id
    }));

    const displayTasks = [...tasks, ...mappedHabits];

    return (
        <div className="h-full">
            <KanbanBoard tasks={displayTasks} />
        </div>
    );
}
