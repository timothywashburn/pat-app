import { TaskData, TaskListData, TaskListType } from "@timothyw/pat-common";

export type Task = TaskData;
export type TaskList = TaskListData;

export interface TaskListWithTasks extends TaskListData {
    tasks: TaskData[];
}

// Utility function for consistent task sorting across all views
export const sortTasks = (tasks: TaskData[], taskListType: TaskListType = TaskListType.TASKS): TaskData[] => {
    return tasks.sort((a, b) => {
        // For note lists, only sort by creation date (newest first)
        if (taskListType === TaskListType.NOTES) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        // For task lists, sort incomplete tasks first, then completed tasks
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Within each group, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};