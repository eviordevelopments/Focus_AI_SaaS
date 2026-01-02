import { useGetTasksQuery } from '../features/api/apiSlice';
import { KanbanBoard } from './Kanban/KanbanBoard';

export function TaskList() {
    const { data: tasks, isLoading, error } = useGetTasksQuery();

    if (isLoading) return <div className="text-white p-4">Loading tasks...</div>;
    if (error) return <div className="text-red-400 p-4">Error loading tasks</div>;

    const taskList = tasks || [];

    return (
        <div className="h-full">
            <KanbanBoard tasks={taskList} />
        </div>
    );
}
