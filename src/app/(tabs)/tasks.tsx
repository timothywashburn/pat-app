import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { ModuleType } from "@timothyw/pat-common";
import { TaskManager } from '@/src/features/tasks/controllers/TaskManager';
import { TaskListWithTasks, Task } from '@/src/features/tasks/models';
import TaskListCard from '@/src/features/tasks/components/TaskListCard';
import TaskListDetailView from '@/src/features/tasks/components/TaskListDetailView';
import TaskListFormView from '@/src/features/tasks/components/TaskListFormView';
import TaskDetailView from '@/src/features/tasks/components/TaskDetailView';
import TaskFormView from '@/src/features/tasks/components/TaskFormView';
import { useToast } from "@/src/components/toast/ToastContext";

export const TasksPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const [taskLists, setTaskLists] = useState<TaskListWithTasks[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // State for detail views
    const [selectedTaskList, setSelectedTaskList] = useState<TaskListWithTasks | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showingTaskListDetail, setShowingTaskListDetail] = useState(false);
    const [showingTaskDetail, setShowingTaskDetail] = useState(false);
    const [showingTaskListEdit, setShowingTaskListEdit] = useState(false);
    const [showingCreateTaskList, setShowingCreateTaskList] = useState(false);
    const [showingTaskEdit, setShowingTaskEdit] = useState(false);
    const [showingCreateTask, setShowingCreateTask] = useState(false);
    const [selectedTaskListForNewTask, setSelectedTaskListForNewTask] = useState<string | null>(null);

    const taskManager = TaskManager.getInstance();

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

        setIsLoading(true);

        try {
            await taskManager.loadTaskLists();
            setTaskLists(taskManager.taskListsWithTasks);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load task lists';
            errorToast(errorMsg);
        } finally {
            setIsLoading(false);
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
            await taskManager.loadTaskLists();
            setTaskLists(taskManager.taskListsWithTasks);
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

    const handleTaskSaved = () => {
        loadTaskLists();
    };

    const handleAddTaskToList = (taskListId: string) => {
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

    const handleTaskListSaved = () => {
        loadTaskLists();
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                moduleType={ModuleType.TASKS}
                title="Tasks"
                showAddButton
                onAddTapped={handleAddTaskList}
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
                        />
                    )}
                    keyExtractor={item => item.id}
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
                isPresented={showingCreateTask}
                onDismiss={handleCreateTaskDismiss}
                onTaskSaved={handleTaskSaved}
                taskLists={taskLists}
                defaultTaskListId={selectedTaskListForNewTask || undefined}
            />

            {/* Edit Task Form */}
            {selectedTask && (
                <TaskFormView
                    isPresented={showingTaskEdit}
                    onDismiss={handleTaskFormDismiss}
                    onTaskSaved={handleTaskSaved}
                    existingTask={selectedTask}
                    taskLists={taskLists}
                    isEditMode={true}
                />
            )}
        </SafeAreaView>
    );
}

export default TasksPanel;