import { useState, useCallback } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/base/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/base/useAsyncOperation';
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
    GetTaskListsResponse,
    TaskListId,
    TaskListData,
    Serializer
} from '@timothyw/pat-common';
import { Task } from '@/src/features/tasks/models';
import { TaskListWithTasks } from '@/src/features/tasks/models';

export interface TasksHookState {
    taskLists: TaskListData[];
    tasks: Task[];
    taskListsWithTasks: TaskListWithTasks[];
    isLoading: boolean;
    error: string | null;
}

/**
 * React hook for managing tasks and task lists
 * Replaces the TaskManager singleton
 */
export function useTasks() {
    const [state, setState] = useState<TasksHookState>({
        taskLists: [],
        tasks: [],
        taskListsWithTasks: [],
        isLoading: false,
        error: null,
    });

    const { performAuthenticated } = useNetworkRequest();
    const asyncOp = useAsyncOperation();

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const updateTaskListsWithTasks = useCallback((taskLists: TaskListData[], tasks: Task[]) => {
        const taskListsWithTasks = taskLists.map(taskList => ({
            ...taskList,
            tasks: tasks.filter(task => task.taskListId === taskList._id),
        }));

        setState(prev => ({
            ...prev,
            taskLists,
            tasks,
            taskListsWithTasks,
            error: null
        }));
    }, []);

    /**
     * Load all task lists
     */
    const loadTaskLists = useCallback(async (): Promise<TaskListData[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, GetTaskListsResponse>({
                endpoint: '/api/tasks/lists',
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to load task lists');

            const taskLists = response.taskLists.map(taskList => Serializer.deserializeTaskListData(taskList));

            // Also load tasks to update the combined view
            const tasks = await loadTasksInternal();
            updateTaskListsWithTasks(taskLists, tasks);
            setLoading(false);

            return taskLists;
        }, { errorMessage: 'Failed to load task lists' });
    }, [asyncOp, performAuthenticated, setLoading, setError, updateTaskListsWithTasks]);

    /**
     * Internal method to load tasks without setting loading state
     */
    const loadTasksInternal = useCallback(async (): Promise<Task[]> => {
        const response = await performAuthenticated<undefined, GetTasksResponse>({
            endpoint: '/api/tasks',
            method: HTTPMethod.GET,
        }, { skipLoadingState: true });

        if (!response.success) throw new Error('Failed to load tasks');

        return response.tasks.map(task => Serializer.deserializeTaskData(task));
    }, [performAuthenticated]);

    /**
     * Load all tasks
     */
    const loadTasks = useCallback(async (): Promise<Task[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const tasks = await loadTasksInternal();
            updateTaskListsWithTasks(state.taskLists, tasks);
            setLoading(false);

            return tasks;
        }, { errorMessage: 'Failed to load tasks' });
    }, [asyncOp, state.taskLists, setLoading, setError, updateTaskListsWithTasks, loadTasksInternal]);

    /**
     * Create a new task list
     */
    const createTaskList = useCallback(async (name: string): Promise<TaskListData> => {
        const body: CreateTaskListRequest = { name };

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateTaskListRequest, CreateTaskListResponse>({
                endpoint: '/api/tasks/lists',
                method: HTTPMethod.POST,
                body,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create task list');

            const newTaskList = Serializer.deserializeTaskListData(response.taskList);

            // Refresh task lists
            await loadTaskLists();
            setLoading(false);

            return newTaskList;
        }, { errorMessage: 'Failed to create task list' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadTaskLists]);

    /**
     * Update a task list
     */
    const updateTaskList = useCallback(async (id: string, updates: { name?: string }): Promise<void> => {
        const body: UpdateTaskListRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<UpdateTaskListRequest, UpdateTaskListResponse>({
                endpoint: `/api/tasks/lists/${id}`,
                method: HTTPMethod.PUT,
                body,
            }, { skipLoadingState: true });

            // Refresh task lists
            await loadTaskLists();
            setLoading(false);
        }, { errorMessage: 'Failed to update task list' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadTaskLists]);

    /**
     * Delete a task list
     */
    const deleteTaskList = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated({
                endpoint: `/api/tasks/lists/${id}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            // Refresh task lists
            await loadTaskLists();
            setLoading(false);
        }, { errorMessage: 'Failed to delete task list' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadTaskLists]);

    /**
     * Create a new task
     */
    const createTask = useCallback(async (params: {
        name: string;
        notes?: string;
        taskListId: TaskListId;
    }): Promise<Task> => {
        const body: CreateTaskRequest = {
            name: params.name,
            notes: params.notes,
            taskListId: params.taskListId,
        };

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateTaskRequest, CreateTaskResponse>({
                endpoint: '/api/tasks',
                method: HTTPMethod.POST,
                body,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create task');

            const newTask = Serializer.deserializeTaskData(response.task);

            // Refresh tasks
            await loadTasks();
            setLoading(false);

            return newTask;
        }, { errorMessage: 'Failed to create task' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadTasks]);

    /**
     * Update a task
     */
    const updateTask = useCallback(async (
        id: string,
        updates: UpdateTaskRequest
    ): Promise<void> => {
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

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<UpdateTaskRequest, UpdateTaskResponse>({
                endpoint: `/api/tasks/${id}`,
                method: HTTPMethod.PUT,
                body,
            }, { skipLoadingState: true });

            // Refresh tasks
            await loadTasks();
            setLoading(false);
        }, { errorMessage: 'Failed to update task' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadTasks]);

    /**
     * Set task completion status
     */
    const setTaskCompleted = useCallback(async (id: string, completed: boolean): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<CompleteTaskRequest, CompleteTaskResponse>({
                endpoint: `/api/tasks/${id}/complete`,
                method: HTTPMethod.PUT,
                body: { completed },
            }, { skipLoadingState: true });

            // Refresh tasks
            await loadTasks();
            setLoading(false);
        }, { errorMessage: 'Failed to set task completed status' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadTasks]);

    /**
     * Delete a task
     */
    const deleteTask = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated({
                endpoint: `/api/tasks/${id}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            // Refresh tasks
            await loadTasks();
            setLoading(false);
        }, { errorMessage: 'Failed to delete task' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadTasks]);

    return {
        ...state,
        loadTaskLists,
        loadTasks,
        createTaskList,
        updateTaskList,
        deleteTaskList,
        createTask,
        updateTask,
        setTaskCompleted,
        deleteTask,
    };
}