import React from 'react';
import {
    Text,
    View,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { Task, TaskList } from '@/src/features/tasks/models';
import { TaskListType } from '@timothyw/pat-common';
import { useTasks } from '@/src/features/tasks/hooks/useTasks';

interface TaskDetailViewProps {
    task: Task;
    taskList: TaskList;
    isPresented: boolean;
    onDismiss: () => void;
    onEditRequest: () => void;
    onTaskUpdated?: () => void;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({
    task,
    taskList,
    isPresented,
    onDismiss,
    onEditRequest,
    onTaskUpdated,
}) => {
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    
    const isNoteList = taskList.type === TaskListType.NOTES;
    const tasksHook = useTasks();

    if (!isPresented) {
        return null;
    }

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await tasksHook.setTaskCompleted(task._id, !task.completed);
            onTaskUpdated?.();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update task');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTask = () => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        setErrorMessage(null);

                        try {
                            await tasksHook.deleteTask(task._id);
                            onTaskUpdated?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const actions = [
        {
            label: isNoteList ? "Edit Note" : "Edit Task",
            onPress: onEditRequest,
            variant: 'outline' as const,
            icon: 'create-outline'
        },
        ...(isNoteList ? [] : [{
            label: task.completed ? "Mark as Incomplete" : "Mark as Complete",
            onPress: handleToggleCompleted,
            variant: 'primary' as const,
            icon: task.completed ? 'refresh-circle' : 'checkmark-circle',
            loading: isLoading
        }]),
        {
            label: isNoteList ? "Delete Note" : "Delete Task",
            onPress: handleDeleteTask,
            variant: 'secondary' as const,
            icon: 'trash-outline',
            isDestructive: true
        }
    ];

    return (
        <BaseDetailView
            isPresented={isPresented}
            onDismiss={onDismiss}
            title={isNoteList ? "Note Details" : "Task Details"}
            onEditRequest={onEditRequest}
            errorMessage={errorMessage}
            actions={actions}
        >
            <Text className="text-on-surface text-xl font-bold mb-4">{task.name}</Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                Created {new Date(task.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {task.updatedAt.getTime() !== task.createdAt.getTime() && (
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="time-outline" size={20} color={getColor("on-surface-variant")} />
                                <Text className="text-on-surface-variant text-base ml-2">
                                    Updated {new Date(task.updatedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {task.notes && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
                            <View className="bg-surface border border-outline rounded-lg p-3">
                                <Text className="text-on-surface text-base">{task.notes}</Text>
                            </View>
                        </View>
                    )}

            {!isNoteList && (
                <View className="flex-row items-center">
                    <Ionicons
                        name={task.completed ? "checkmark-circle" : "radio-button-off"}
                        size={20}
                        color={task.completed ? getColor("primary") : getColor("on-surface-variant")}
                    />
                    <Text className="text-on-surface text-base ml-2">
                        {task.completed ? "Completed" : "Not completed"}
                    </Text>
                </View>
            )}
        </BaseDetailView>
    );
};

export default TaskDetailView;