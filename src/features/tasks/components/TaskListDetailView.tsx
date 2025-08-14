import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    Alert,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { TaskListWithTasks, sortTasks } from '@/src/features/tasks/models';
import { useTasks } from '@/src/hooks/useTasks';
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
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showTasks, setShowTasks] = React.useState(false);
    const [rotateAnimation] = React.useState(new Animated.Value(0));

    const tasksHook = useTasks();

    if (!isPresented) {
        return null;
    }

    const handleDeleteTaskList = () => {
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
                            await tasksHook.deleteTaskList(taskList._id);
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

    const handleDeleteCompletedTasks = () => {
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
                                completedTasks.map(task => tasksHook.deleteTask(task._id))
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

    const sections = [
        // Task List Info Section
        {
            content: (
                <>
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
                </>
            )
        },
        // Tasks Section
        {
            content: (
                <View className="bg-surface rounded-lg">
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
            ),
            showCard: false
        }
    ];

    const actions: Array<{
        label: string;
        onPress: () => void;
        variant?: 'primary' | 'secondary' | 'outline';
        icon?: string;
        loading?: boolean;
        disabled?: boolean;
        isDestructive?: boolean;
    }> = [
        {
            label: "Edit List",
            onPress: onEditRequest,
            variant: 'outline',
            icon: 'create-outline'
        }
    ];

    // Add delete completed tasks action if there are completed tasks
    if (completedTaskCount > 0) {
        actions.push({
            label: "Delete Completed Tasks",
            onPress: handleDeleteCompletedTasks,
            variant: 'secondary',
            icon: 'checkmark-done',
            loading: isLoading
        });
    }

    // Add delete list action
    actions.push({
        label: "Delete List",
        onPress: handleDeleteTaskList,
        variant: 'secondary',
        icon: 'trash-outline',
        loading: isLoading,
        isDestructive: true
    });

    return (
        <BaseDetailView
            isPresented={isPresented}
            onDismiss={onDismiss}
            title="Task List"
            onEditRequest={onEditRequest}
            errorMessage={errorMessage}
            sections={sections}
            actions={actions}
        />
    );
};

export default TaskListDetailView;