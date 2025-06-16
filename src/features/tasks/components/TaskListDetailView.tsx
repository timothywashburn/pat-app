import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import { TaskListWithTasks, sortTasks } from '@/src/features/tasks/models';
import { TaskManager } from '@/src/features/tasks/controllers/TaskManager';
import TaskItemCard from './TaskItemCard';

interface TaskListDetailViewProps {
    taskList: TaskListWithTasks;
    isPresented: boolean;
    onDismiss: () => void;
    onEditRequest: () => void;
    onTaskPress: (task: any) => void;
    onTaskListUpdated?: () => void;
}

const TaskListDetailView: React.FC<TaskListDetailViewProps> = ({
    taskList,
    isPresented,
    onDismiss,
    onEditRequest,
    onTaskPress,
    onTaskListUpdated,
}) => {
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showTasks, setShowTasks] = React.useState(false);
    const [rotateAnimation] = React.useState(new Animated.Value(0));

    const taskManager = TaskManager.getInstance();

    if (!isPresented) {
        return null;
    }

    const handleDeleteTaskList = async () => {
        const taskCount = taskList.tasks.length;
        const message = taskCount > 0 
            ? `This will delete "${taskList.name}" and all ${taskCount} tasks in it. This action cannot be undone.`
            : `This will delete "${taskList.name}". This action cannot be undone.`;

        Alert.alert(
            'Delete Task List',
            message,
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
                            await taskManager.deleteTaskList(taskList._id);
                            onTaskListUpdated?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task list');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const incompleteTasks = taskList.tasks.filter(task => !task.completed);
    const completedTasks = taskList.tasks.filter(task => task.completed);
    const incompleteTaskCount = incompleteTasks.length;
    const completedTaskCount = completedTasks.length;
    const totalTasks = taskList.tasks.length;

    const handleToggleTasks = () => {
        const newShowTasks = !showTasks;
        setShowTasks(newShowTasks);
        
        Animated.timing(rotateAnimation, {
            toValue: newShowTasks ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const rotateStyle = {
        transform: [
            {
                rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                }),
            },
        ],
    };

    const handleDeleteCompletedTasks = async () => {
        if (completedTaskCount === 0) return;

        Alert.alert(
            'Delete Completed Tasks',
            `This will delete ${completedTaskCount} completed ${completedTaskCount === 1 ? 'task' : 'tasks'}. This action cannot be undone.`,
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
                            // Delete all completed tasks
                            await Promise.all(
                                completedTasks.map(task => taskManager.deleteTask(task._id))
                            );
                            onTaskListUpdated?.();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete completed tasks');
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

                <Text className="text-on-surface text-lg font-bold">Task List</Text>

                <TouchableOpacity onPress={onEditRequest}>
                    <Ionicons name="create-outline" size={24} color={getColor("primary")} />
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <Text className="text-error p-4 text-center">{errorMessage}</Text>
            )}

            <ScrollView className="flex-1 p-4">
                <View className="bg-surface rounded-lg p-4 mb-5">
                    <Text className="text-on-surface text-xl font-bold mb-4">{taskList.name}</Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="list-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                {completedTaskCount}/{totalTasks} completed
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                Created {new Date(taskList.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {taskList.updatedAt.getTime() !== taskList.createdAt.getTime() && (
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={20} color={getColor("on-surface-variant")} />
                                <Text className="text-on-surface-variant text-base ml-2">
                                    Updated {new Date(taskList.updatedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Tasks section */}
                <View className="bg-surface rounded-lg mb-5">
                    <TouchableOpacity
                        className={`flex-row items-center p-4 ${showTasks ? 'border-b border-outline' : ''}`}
                        onPress={handleToggleTasks}
                    >
                        <Animated.View style={rotateStyle} className="mr-3">
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={getColor('on-surface-variant')}
                            />
                        </Animated.View>
                        <Text className="text-on-surface text-lg font-semibold">
                            Tasks{' '}
                            <Text className="text-on-surface-variant font-normal">
                                {totalTasks}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                    
                    {showTasks && (
                        <View className="p-4">
                            {totalTasks === 0 ? (
                                <Text className="text-on-surface-variant text-center py-4">
                                    No tasks in this list
                                </Text>
                            ) : (
                                sortTasks(taskList.tasks).map((task, index) => (
                                        <TaskItemCard
                                            key={task._id}
                                            task={task}
                                            onPress={onTaskPress}
                                            isLast={index === taskList.tasks.length - 1}
                                        />
                                    ))
                            )}
                        </View>
                    )}
                </View>

                <View className="mt-5 gap-2.5">
                    <TouchableOpacity
                        className="bg-surface border border-outline flex-row items-center justify-center rounded-lg p-3"
                        onPress={onEditRequest}
                    >
                        <Text className="text-primary text-base font-semibold mr-2">
                            Edit List
                        </Text>
                        <Ionicons name="create-outline" size={20} color={getColor("primary")} />
                    </TouchableOpacity>

                    {completedTaskCount > 0 && (
                        <TouchableOpacity
                            className="bg-error-container flex-row items-center justify-center rounded-lg p-3"
                            onPress={handleDeleteCompletedTasks}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={getColor("on-error-container")} />
                            ) : (
                                <>
                                    <Text className="text-on-error-container text-base font-semibold mr-2">
                                        Delete Completed Tasks
                                    </Text>
                                    <Ionicons
                                        name="checkmark-done"
                                        size={20}
                                        color={getColor("on-error-container")}
                                    />
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        className="bg-error flex-row items-center justify-center rounded-lg p-3"
                        onPress={handleDeleteTaskList}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={getColor("on-error")} />
                        ) : (
                            <>
                                <Text className="text-on-error text-base font-semibold mr-2">
                                    Delete List
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

export default TaskListDetailView;