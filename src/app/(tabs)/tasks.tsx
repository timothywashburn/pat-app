import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { ModuleType } from "@timothyw/pat-common";
import { useTasks } from '@/src/hooks/useTasks';
import { TaskListWithTasks, Task } from '@/src/features/tasks/models';
import { TaskListId } from '@timothyw/pat-common';
import TaskListCard from '@/src/features/tasks/components/TaskListCard';
import TaskListDetailView from '@/src/features/tasks/components/TaskListDetailView';
import TaskListFormView from '@/src/features/tasks/components/TaskListFormView';
import TaskDetailView from '@/src/features/tasks/components/TaskDetailView';
import TaskFormView from '@/src/features/tasks/components/TaskFormView';
import { useToast } from "@/src/components/toast/ToastContext";

export const TasksPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const tasksHook = useTasks();
    const { taskListsWithTasks: taskLists, isLoading, error } = tasksHook;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    // State for detail views
    const [selectedTaskList, setSelectedTaskList] = useState<TaskListWithTasks | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showingTaskListDetail, setShowingTaskListDetail] = useState(false);
    const [showingTaskDetail, setShowingTaskDetail] = useState(false);
    const [showingTaskListEdit, setShowingTaskListEdit] = useState(false);
    const [showingCreateTaskList, setShowingCreateTaskList] = useState(false);
    const [showingTaskEdit, setShowingTaskEdit] = useState(false);
    const [showingCreateTask, setShowingCreateTask] = useState(false);
    const [selectedTaskListForNewTask, setSelectedTaskListForNewTask] = useState<TaskListId | null>(null);

    useEffect(() => {
        loadTaskLists();
    }, []);

    // Refresh data when tab is focused (e.g., after creating task from inbox)
    useFocusEffect(
        React.useCallback(() => {
            loadTaskLists();
        }, [])
    );

    const loadTaskLists = async () => {
        if (isRefreshing) return;

        try {
            await tasksHook.loadTaskLists();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load task lists';
            errorToast(errorMsg);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            console.log('haptics not available:', err);
        }

        try {
            await tasksHook.loadTaskLists();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to refresh task lists';
            errorToast(errorMsg);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddTaskList = () => {
        setShowingCreateTaskList(true);
    };

    const handleTaskListSelect = (taskList: TaskListWithTasks) => {
        setSelectedTaskList(taskList);
        setShowingTaskListDetail(true);
    };

    const handleTaskSelect = (task: Task) => {
        setSelectedTask(task);
        setShowingTaskDetail(true);
    };

    const handleTaskListDetailDismiss = () => {
        setShowingTaskListDetail(false);
        setSelectedTaskList(null);
    };

    const handleTaskDetailDismiss = () => {
        setShowingTaskDetail(false);
        setSelectedTask(null);
    };

    const handleTaskEditRequest = () => {
        setShowingTaskDetail(false);
        setShowingTaskEdit(true);
    };

    const handleTaskUpdated = () => {
        loadTaskLists();
        handleTaskDetailDismiss();
    };

    const handleTaskFormDismiss = () => {
        setShowingTaskEdit(false);
        setSelectedTask(null);
    };

    const handleTaskEditCancel = () => {
        setShowingTaskEdit(false);
        setShowingTaskDetail(true); // Go back to detail view instead of list
    };

    const handleTaskSaved = () => {
        loadTaskLists();
        setSelectedTask(null);
        setShowingTaskEdit(false);
        setShowingCreateTask(false);
    };

    const handleAddTaskToList = (taskListId: TaskListId) => {
        setSelectedTaskListForNewTask(taskListId);
        setShowingCreateTask(true);
    };

    const handleCreateTaskDismiss = () => {
        setShowingCreateTask(false);
        setSelectedTaskListForNewTask(null);
    };

    const handleTaskListEditRequest = () => {
        setShowingTaskListDetail(false);
        setShowingTaskListEdit(true);
    };

    const handleTaskListUpdated = () => {
        loadTaskLists();
        handleTaskListDetailDismiss();
    };

    const handleTaskListFormDismiss = () => {
        setShowingCreateTaskList(false);
        setShowingTaskListEdit(false);
        setSelectedTaskList(null);
    };

    const handleTaskListEditCancel = () => {
        setShowingTaskListEdit(false);
        setShowingTaskListDetail(true); // Go back to detail view instead of list
    };

    const handleTaskListSaved = () => {
        loadTaskLists();
        setSelectedTaskList(null);
        setShowingTaskListEdit(false);
        setShowingCreateTaskList(false);
    };

    return (
        <>
            <CustomHeader
                moduleType={ModuleType.TASKS}
                title="Tasks"
                showAddButton
                onAddTapped={handleAddTaskList}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

            {isLoading && taskLists.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <ActivityIndicator size="large" color={getColor("primary")} />
                </View>
            ) : taskLists.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons
                        name="list"
                        size={48}
                        color={getColor("primary")}
                    />
                    <Text className="text-base text-on-background-variant mb-5">
                        No task lists yet
                    </Text>
                    <TouchableOpacity
                        className="bg-primary px-5 py-2.5 rounded-lg"
                        onPress={handleAddTaskList}
                    >
                        <Text className="text-on-primary text-base font-semibold">Create List</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={taskLists}
                    renderItem={({ item }) => (
                        <TaskListCard
                            taskList={item}
                            onPress={handleTaskListSelect}
                            onTaskPress={handleTaskSelect}
                            onAddTask={handleAddTaskToList}
                            showCompleted={showCompleted}
                        />
                    )}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[getColor("primary")]}
                            tintColor={getColor("primary")}
                        />
                    }
                />
            )}

            {/* TaskList Detail View */}
            {selectedTaskList && (
                <TaskListDetailView
                    taskList={selectedTaskList}
                    isPresented={showingTaskListDetail}
                    onDismiss={handleTaskListDetailDismiss}
                    onEditRequest={handleTaskListEditRequest}
                    onTaskPress={handleTaskSelect}
                    onTaskListUpdated={handleTaskListUpdated}
                />
            )}

            {/* Create TaskList Form */}
            <TaskListFormView
                isPresented={showingCreateTaskList}
                onDismiss={handleTaskListFormDismiss}
                onTaskListSaved={handleTaskListSaved}
            />

            {/* Edit TaskList Form */}
            {selectedTaskList && (
                <TaskListFormView
                    isPresented={showingTaskListEdit}
                    onDismiss={handleTaskListFormDismiss}
                    onCancel={handleTaskListEditCancel}
                    onTaskListSaved={handleTaskListSaved}
                    existingTaskList={selectedTaskList}
                    isEditMode={true}
                />
            )}

            {/* Task Detail View */}
            {selectedTask && (
                <TaskDetailView
                    task={selectedTask}
                    isPresented={showingTaskDetail}
                    onDismiss={handleTaskDetailDismiss}
                    onEditRequest={handleTaskEditRequest}
                    onTaskUpdated={handleTaskUpdated}
                />
            )}

            {/* Create Task Form */}
            <TaskFormView
                key={selectedTaskListForNewTask || 'general'}
                isPresented={showingCreateTask}
                onDismiss={handleCreateTaskDismiss}
                onTaskSaved={handleTaskSaved}
                taskLists={taskLists}
                defaultTaskListId={selectedTaskListForNewTask || undefined}
                hideTaskListSelection={!!selectedTaskListForNewTask}
            />

            {/* Edit Task Form */}
            {selectedTask && (
                <TaskFormView
                    isPresented={showingTaskEdit}
                    onDismiss={handleTaskFormDismiss}
                    onCancel={handleTaskEditCancel}
                    onTaskSaved={handleTaskSaved}
                    existingTask={selectedTask}
                    taskLists={taskLists}
                    isEditMode={true}
                />
            )}
        </>
    );
}

export default TasksPanel;