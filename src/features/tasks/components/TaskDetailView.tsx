import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Task } from '@/src/features/tasks/models';
import { TaskManager } from '@/src/features/tasks/controllers/TaskManager';

interface TaskDetailViewProps {
    task: Task;
    isPresented: boolean;
    onDismiss: () => void;
    onEditRequest: () => void;
    onTaskUpdated?: () => void;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({
    task,
    isPresented,
    onDismiss,
    onEditRequest,
    onTaskUpdated,
}) => {
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const taskManager = TaskManager.getInstance();

    if (!isPresented) {
        return null;
    }

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await taskManager.setTaskCompleted(task.id, !task.completed);
            onTaskUpdated?.();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update task');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTask = async () => {
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
                            await taskManager.deleteTask(task.id);
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

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
                <TouchableOpacity onPress={onDismiss}>
                    <Ionicons name="chevron-back" size={24} color={getColor("primary")} />
                </TouchableOpacity>

                <Text className="text-on-surface text-lg font-bold">Task Details</Text>

                <TouchableOpacity onPress={onEditRequest}>
                    <Ionicons name="create-outline" size={24} color={getColor("primary")} />
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <Text className="text-error p-4 text-center">{errorMessage}</Text>
            )}

            <ScrollView className="flex-1 p-4">
                <View className="bg-surface rounded-lg p-4 mb-5">
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
                </View>

                <View className="mt-5 gap-2.5">
                    <TouchableOpacity
                        className="bg-surface border border-outline flex-row items-center justify-center rounded-lg p-3"
                        onPress={onEditRequest}
                    >
                        <Text className="text-primary text-base font-semibold mr-2">
                            Edit Task
                        </Text>
                        <Ionicons name="create-outline" size={20} color={getColor("primary")} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-primary flex-row items-center justify-center rounded-lg p-3"
                        onPress={handleToggleCompleted}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={getColor("on-primary")} />
                        ) : (
                            <>
                                <Text className="text-on-primary text-base font-semibold mr-2">
                                    {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                </Text>
                                <Ionicons
                                    name={task.completed ? "refresh-circle" : "checkmark-circle"}
                                    size={20}
                                    color={getColor("on-primary")}
                                />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-error flex-row items-center justify-center rounded-lg p-3"
                        onPress={handleDeleteTask}
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

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default TaskDetailView;