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
import { TaskList } from '@/src/features/tasks/models';

interface TaskListFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onTaskListSaved?: () => void;
    existingTaskList?: TaskList;
    isEditMode?: boolean;
}

const TaskListFormView: React.FC<TaskListFormViewProps> = ({
    isPresented,
    onDismiss,
    onTaskListSaved,
    existingTaskList,
    isEditMode = false
}) => {
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();

    const [name, setName] = useState(existingTaskList?.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const taskManager = TaskManager.getInstance();

    if (!isPresented) {
        return null;
    }

    const handleSaveTaskList = async () => {
        if (!name.trim()) {
            setErrorMessage('List name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            if (isEditMode && existingTaskList) {
                await taskManager.updateTaskList(existingTaskList._id, {
                    name: name.trim()
                });
            } else {
                await taskManager.createTaskList(name.trim());
            }

            if (!isEditMode) {
                setName('');
            }

            onTaskListSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save task list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (!existingTaskList) return;

        Alert.alert(
            'Delete Task List',
            'Are you sure you want to delete this task list? This will also delete all tasks in it. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        setErrorMessage(null);

                        try {
                            await taskManager.deleteTaskList(existingTaskList._id);
                            onTaskListSaved?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task list');
                            setIsLoading(false);
                        }
                    }
                },
            ]
        );
    };

    const handleCancel = () => {
        if (isEditMode && existingTaskList) {
            setName(existingTaskList.name);
        } else {
            setName('');
        }
        setErrorMessage(null);
        onDismiss();
    };

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
                    {isEditMode ? 'Edit List' : 'New List'}
                </Text>

                <TouchableOpacity 
                    onPress={handleSaveTaskList} 
                    disabled={isLoading || !name.trim()}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={getColor("primary")} />
                    ) : (
                        <Text 
                            className={`text-base font-semibold ${
                                name.trim() ? 'text-primary' : 'text-on-surface-variant'
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
                        List Details
                    </Text>

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            List Name *
                        </Text>
                        <TextInput
                            className="bg-surface border border-outline rounded-lg p-3 text-on-surface text-base"
                            placeholder="Enter list name"
                            placeholderTextColor={getColor('on-surface-variant')}
                            value={name}
                            onChangeText={setName}
                            autoFocus={!isEditMode}
                            maxLength={100}
                        />
                    </View>
                </View>

                {isEditMode && existingTaskList && (
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
                )}

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default TaskListFormView;