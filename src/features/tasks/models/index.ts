export interface TaskList {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Task {
    id: string;
    name: string;
    notes?: string;
    completed: boolean;
    taskListId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskListWithTasks extends TaskList {
    tasks: Task[];
}

// Utility function for consistent task sorting across all views
export const sortTasks = (tasks: Task[]): Task[] => {
    return tasks.sort((a, b) => {
        // Sort incomplete tasks first, then completed tasks
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Within each group, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};