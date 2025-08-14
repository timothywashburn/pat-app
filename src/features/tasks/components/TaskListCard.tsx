import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskListWithTasks, sortTasks } from '@/src/features/tasks/models';
import { TaskListId, TaskListType } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import TaskItemCard from './TaskItemCard';

interface TaskListCardProps {
    taskList: TaskListWithTasks;
    onPress: (taskList: TaskListWithTasks) => void;
    onTaskPress: (task: any) => void;
    onAddTask: (taskListId: TaskListId) => void;
    showCompleted: boolean;
}

const TaskListCard: React.FC<TaskListCardProps> = ({ taskList, onPress, onTaskPress, onAddTask, showCompleted }) => {
    const { getColor } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [rotateAnimation] = useState(new Animated.Value(0));
    
    const incompleteTasks = taskList.tasks.filter(task => !task.completed);
    const completedTasks = taskList.tasks.filter(task => task.completed);
    const incompleteTaskCount = incompleteTasks.length;
    const totalTasks = taskList.tasks.length;

    const handleHeaderPress = () => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        
        Animated.timing(rotateAnimation, {
            toValue: newExpanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleListPress = () => {
        onPress(taskList);
    };

    const handleAddTask = () => {
        onAddTask(taskList._id);
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

    return (
        <View className="bg-surface rounded-lg mb-3">
            {/* Header */}
            <TouchableOpacity
                className={`p-4 flex-row items-center ${isExpanded ? 'border-b border-outline' : ''}`}
                onPress={handleHeaderPress}
            >
                <Animated.View style={rotateStyle} className="mr-3">
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={getColor('on-surface-variant')}
                    />
                </Animated.View>
                
                <View className="flex-row items-center mr-3">
                    <Ionicons
                        name={taskList.type === TaskListType.NOTES ? 'document-text' : 'checkbox'}
                        size={20}
                        color={getColor('on-surface-variant')}
                    />
                </View>
                
                <View className="flex-1">
                    <Text className="text-on-surface text-lg font-semibold mb-1">
                        {taskList.name}
                    </Text>
                    <Text className="text-on-surface-variant text-sm">
                        {taskList.type === TaskListType.NOTES 
                            ? `${totalTasks} note${totalTasks !== 1 ? 's' : ''}`
                            : `${completedTasks.length}/${totalTasks} completed`
                        }
                    </Text>
                </View>
                
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="p-2 mr-2"
                        onPress={handleListPress}
                    >
                        <Ionicons 
                            name="create-outline"
                            size={20} 
                            color={getColor('on-surface-variant')} 
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        className="p-2"
                        onPress={handleAddTask}
                    >
                        <Ionicons 
                            name="add"
                            size={20} 
                            color={getColor('primary')} 
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Expanded tasks */}
            {isExpanded && (
                <View className="px-4 pb-4">
                    {taskList.tasks.length === 0 ? (
                        <Text className="text-on-surface-variant text-center py-4">
                            No tasks in this list
                        </Text>
                    ) : (
                        (() => {
                            const tasksToShow = showCompleted 
                                ? sortTasks(taskList.tasks, taskList.type)
                                : sortTasks(taskList.tasks.filter(task => !task.completed), taskList.type);
                            
                            return tasksToShow.map((task, index) => (
                                <TaskItemCard
                                    key={task._id}
                                    task={task}
                                    taskList={taskList}
                                    onPress={onTaskPress}
                                    isLast={index === tasksToShow.length - 1}
                                />
                            ));
                        })()
                    )}
                </View>
            )}
        </View>
    );
};

export default TaskListCard;