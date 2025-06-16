import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import { TaskManager } from '@/src/features/tasks/controllers/TaskManager';
import { TaskListWithTasks } from '@/src/features/tasks/models';
import { TaskData, TaskListId } from "@timothyw/pat-common";

interface TaskFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onTaskSaved?: () => void;
    existingTask?: TaskData;
    taskLists: TaskListWithTasks[];
    defaultTaskListId?: TaskListId;
    initialName?: string;
    isEditMode?: boolean;
}

const TaskFormView: React.FC<TaskFormViewProps> = ({
    isPresented,
    onDismiss,
    onTaskSaved,
    existingTask,
    taskLists,
    defaultTaskListId,
    initialName = '',
    isEditMode = false
}) => {
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();

    const [name, setName] = useState(existingTask?.name || initialName);
    const [notes, setNotes] = useState(existingTask?.notes || '');
    const [selectedTaskListId, setSelectedTaskListId] = useState<TaskListId>(
        existingTask?.taskListId || defaultTaskListId || taskLists[0]?._id!
    );
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const taskManager = TaskManager.getInstance();

    if (!isPresented) {
        return null;
    }

    const handleSaveTask = async () => {
        if (!name.trim()) {
            setErrorMessage('Task name is required');
            return;
        }

        if (!selectedTaskListId) {
            setErrorMessage('Please select a task list');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const taskData = {
                name: name.trim(),
                notes: notes.trim() || undefined,
                taskListId: selectedTaskListId,
            };

            if (isEditMode && existingTask) {
                await taskManager.updateTask(existingTask._id, taskData);
            } else {
                await taskManager.createTask({
                    name: name.trim(),
                    notes: notes.trim() || undefined,
                    taskListId: selectedTaskListId,
                });
            }

            if (!isEditMode) {
                setName(initialName);
                setNotes('');
            }

            onTaskSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save task');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (!existingTask) return;

        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        setErrorMessage(null);

                        try {
                            await taskManager.deleteTask(existingTask._id);
                            onTaskSaved?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task');
                            setIsLoading(false);
                        }
                    }
                },
            ]
        );
    };

    const handleCancel = () => {
        if (isEditMode && existingTask) {
            setName(existingTask.name);
            setNotes(existingTask.notes || '');
            setSelectedTaskListId(existingTask.taskListId);
        } else {
            setName(initialName);
            setNotes('');
            setSelectedTaskListId(defaultTaskListId || taskLists[0]?._id!);
        }
        setErrorMessage(null);
        onDismiss();
    };

    const selectedTaskList = taskLists.find(list => list._id === selectedTaskListId);

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
                <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
                    <Text className="text-primary text-base font-medium">
                        Cancel
                    </Text>
                </TouchableOpacity>

                <Text className="text-on-surface text-lg font-bold">
                    {isEditMode ? 'Edit Task' : 'New Task'}
                </Text>

                <TouchableOpacity 
                    onPress={handleSaveTask} 
                    disabled={isLoading || !name.trim() || !selectedTaskListId}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={getColor("primary")} />
                    ) : (
                        <Text 
                            className={`text-base font-semibold ${
                                name.trim() && selectedTaskListId ? 'text-primary' : 'text-on-surface-variant'
                            }`}
                        >
                            Save
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <View className="bg-error-container p-4">
                    <Text className="text-on-error-container text-center">{errorMessage}</Text>
                </View>
            )}

            <ScrollView className="flex-1 p-4">
                <View className="bg-surface rounded-lg p-4 mb-5">
                    <Text className="text-on-surface text-lg font-semibold mb-3">
                        Task Details
                    </Text>

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            Task Name *
                        </Text>
                        <TextInput
                            className="bg-surface border border-outline rounded-lg p-3 text-on-surface text-base"
                            placeholder="Enter task name"
                            placeholderTextColor={getColor('on-surface-variant')}
                            value={name}
                            onChangeText={setName}
                            autoFocus={!isEditMode}
                            maxLength={200}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            Notes
                        </Text>
                        <TextInput
                            className="bg-surface border border-outline rounded-lg p-3 text-on-surface text-base"
                            placeholder="Add notes (optional)"
                            placeholderTextColor={getColor('on-surface-variant')}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={1000}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            Task List *
                        </Text>
                        <View className="bg-surface border border-outline rounded-lg">
                            {taskLists.map((taskList, index) => (
                                <TouchableOpacity
                                    key={taskList._id}
                                    className={`flex-row items-center justify-between p-3 ${
                                        index < taskLists.length - 1 ? 'border-b border-outline' : ''
                                    }`}
                                    onPress={() => setSelectedTaskListId(taskList._id)}
                                >
                                    <Text className="text-on-surface text-base flex-1">
                                        {taskList.name}
                                    </Text>
                                    <Ionicons
                                        name={selectedTaskListId === taskList._id ? 'radio-button-on' : 'radio-button-off'}
                                        size={20}
                                        color={selectedTaskListId === taskList._id ? getColor('primary') : getColor('on-surface-variant')}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        {selectedTaskList && (
                            <Text className="text-on-surface-variant text-sm mt-1">
                                {selectedTaskList.tasks.length} tasks in this list
                            </Text>
                        )}
                    </View>
                </View>

                {isEditMode && existingTask && (
                    <View className="mt-5">
                        <TouchableOpacity
                            className="bg-error flex-row items-center justify-center rounded-lg p-3"
                            onPress={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={getColor("on-error")} />
                            ) : (
                                <>
                                    <Text className="text-on-error text-base font-semibold mr-2">
                                        Delete Task
                                    </Text>
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color={getColor("on-error")}
                                    />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default TaskFormView;