import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CreateTaskRequest,
    CreateTaskResponse,
    UpdateTaskRequest,
    UpdateTaskResponse,
    GetTasksResponse,
    CompleteTaskRequest,
    CompleteTaskResponse,
    CreateTaskListRequest,
    CreateTaskListResponse,
    UpdateTaskListRequest,
    UpdateTaskListResponse,
    GetTaskListsResponse, TaskListId, TaskListData, TaskId, Serializer
} from '@timothyw/pat-common';
import { Task } from "@/src/features/tasks/models";
import { TaskListWithTasks } from "@/src/features/tasks/models";
import { useUserDataStore } from "@/src/features/settings/controllers/useUserDataStore";

export class TaskManager {
    private static instance: TaskManager;
    private _taskLists: TaskListData[] = [];
    private _tasks: Task[] = [];
    private _taskListsWithTasks: TaskListWithTasks[] = [];

    private constructor() {}

    static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    get taskLists(): TaskListData[] {
        return [...this._taskLists];
    }

    get tasks(): Task[] {
        return [...this._tasks];
    }

    get taskListsWithTasks(): TaskListWithTasks[] {
        return [...this._taskListsWithTasks];
    }

    async loadTaskLists(): Promise<void> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetTaskListsResponse>({
                endpoint: '/api/tasks/lists',
                method: HTTPMethod.GET,
            });

            if (!response.success) throw new Error('Failed to load task lists');

            this._taskLists = response.taskLists.map(taskList => Serializer.deserializeTaskListData(taskList));

            await this.loadTasks();
            this.updateTaskListsWithTasks();
        } catch (error) {
            console.error('Failed to load task lists:', error);
            throw error;
        }
    }

    async loadTasks(): Promise<void> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetTasksResponse>({
                endpoint: '/api/tasks',
                method: HTTPMethod.GET,
            });

            if (!response.success) throw new Error('Failed to load tasks');

            this._tasks = response.tasks.map(task => Serializer.deserializeTaskData(task));

            this.updateTaskListsWithTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            throw error;
        }
    }

    private updateTaskListsWithTasks(): void {
        this._taskListsWithTasks = this._taskLists.map(taskList => ({
            ...taskList,
            tasks: this._tasks.filter(task => task.taskListId === taskList._id),
        }));
    }

    async createTaskList(name: string): Promise<TaskListData> {
        const body: CreateTaskListRequest = { name };

        try {
            const response = await NetworkManager.shared.performAuthenticated<CreateTaskListRequest, CreateTaskListResponse>({
                endpoint: '/api/tasks/lists',
                method: HTTPMethod.POST,
                body,
            });

            if (!response.success) throw new Error('Failed to create task list');

            await this.loadTaskLists();
            return Serializer.deserializeTaskListData(response.taskList);
        } catch (error) {
            console.error('Failed to create task list:', error);
            throw error;
        }
    }

    async updateTaskList(id: string, updates: { name?: string }): Promise<void> {
        const body: UpdateTaskListRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }

        try {
            await NetworkManager.shared.performAuthenticated<UpdateTaskListRequest, UpdateTaskListResponse>({
                endpoint: `/api/tasks/lists/${id}`,
                method: HTTPMethod.PUT,
                body,
            });

            await this.loadTaskLists();
        } catch (error) {
            console.error('Failed to update task list:', error);
            throw error;
        }
    }

    async deleteTaskList(id: string): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated({
                endpoint: `/api/tasks/lists/${id}`,
                method: HTTPMethod.DELETE,
            });

            await this.loadTaskLists();
        } catch (error) {
            console.error('Failed to delete task list:', error);
            throw error;
        }
    }

    async createTask(params: {
        name: string;
        notes?: string;
        taskListId: TaskListId;
    }): Promise<Task> {
        const body: CreateTaskRequest = {
            name: params.name,
            notes: params.notes,
            taskListId: params.taskListId,
        };

        try {
            const response = await NetworkManager.shared.performAuthenticated<CreateTaskRequest, CreateTaskResponse>({
                endpoint: '/api/tasks',
                method: HTTPMethod.POST,
                body,
            });

            if (!response.success) throw new Error('Failed to create task');

            await this.loadTasks();
            return Serializer.deserializeTaskData(response.task);
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }

    async updateTask(
        id: string,
        updates: UpdateTaskRequest
    ): Promise<void> {
        const body: UpdateTaskRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }
        if (updates.notes !== undefined) {
            body.notes = updates.notes;
        }
        if (updates.completed !== undefined) {
            body.completed = updates.completed;
        }
        if (updates.taskListId !== undefined) {
            body.taskListId = updates.taskListId;
        }

        try {
            await NetworkManager.shared.performAuthenticated<UpdateTaskRequest, UpdateTaskResponse>({
                endpoint: `/api/tasks/${id}`,
                method: HTTPMethod.PUT,
                body,
            });

            await this.loadTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }

    async setTaskCompleted(id: string, completed: boolean): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated<CompleteTaskRequest, CompleteTaskResponse>({
                endpoint: `/api/tasks/${id}/complete`,
                method: HTTPMethod.PUT,
                body: { completed },
            });

            await this.loadTasks();
        } catch (error) {
            console.error('Failed to set task completed status:', error);
            throw error;
        }
    }

    async deleteTask(id: string): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated({
                endpoint: `/api/tasks/${id}`,
                method: HTTPMethod.DELETE,
            });

            await this.loadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    }
}