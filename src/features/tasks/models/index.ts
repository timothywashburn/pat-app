import { TaskData, TaskListData } from "@timothyw/pat-common";

export interface TaskListWithTasks extends TaskListData {
    tasks: TaskData[];
}

// Utility function for consistent task sorting across all views
export const sortTasks = (tasks: TaskData[]): TaskData[] => {
    return tasks.sort((a, b) => {
        // Sort incomplete tasks first, then completed tasks
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Within each group, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};