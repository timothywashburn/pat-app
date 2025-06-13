import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@/src/features/tasks/models';
import { useTheme } from '@/src/controllers/ThemeManager';

interface TaskItemCardProps {
    task: Task;
    onPress: (task: Task) => void;
    isLast?: boolean;
}

const TaskItemCard: React.FC<TaskItemCardProps> = ({ task, onPress, isLast }) => {
    const { getColor } = useTheme();

    return (
        <TouchableOpacity
            className={`flex-row items-center py-3 ${!isLast ? 'border-b border-surface-variant' : ''}`}
            onPress={() => onPress(task)}
        >
            <View className="mr-3">
                <Ionicons
                    name={task.completed ? 'checkmark-circle' : 'radio-button-off'}
                    size={20}
                    color={task.completed ? getColor('primary') : getColor('on-surface-variant')}
                />
            </View>
            
            <View className="flex-1">
                <Text 
                    className={`text-base ${
                        task.completed 
                            ? 'text-on-surface-variant line-through' 
                            : 'text-on-surface'
                    }`}
                >
                    {task.name}
                </Text>
                
                {task.notes && (
                    <Text className="text-on-surface-variant text-sm mt-1">
                        {task.notes}
                    </Text>
                )}
            </View>
            
            <Ionicons
                name="chevron-forward"
                size={16}
                color={getColor('on-surface-variant')}
            />
        </TouchableOpacity>
    );
};

export default TaskItemCard;