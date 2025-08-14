import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormTextArea from '@/src/components/common/FormTextArea';
import SelectionList from '@/src/components/common/SelectionList';
import FormSection from '@/src/components/common/FormSection';
import { useTasks } from '@/src/features/tasks/hooks/useTasks';
import { TaskListWithTasks } from '@/src/features/tasks/models';
import { TaskData, TaskListId } from "@timothyw/pat-common";

interface TaskFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onCancel?: () => void;
    onTaskSaved?: () => void;
    existingTask?: TaskData;
    taskLists: TaskListWithTasks[];
    defaultTaskListId?: TaskListId;
    initialName?: string;
    isEditMode?: boolean;
    hideTaskListSelection?: boolean;
}

const TaskFormView: React.FC<TaskFormViewProps> = ({
    isPresented,
    onDismiss,
    onCancel,
    onTaskSaved,
    existingTask,
    taskLists,
    defaultTaskListId,
    initialName = '',
    isEditMode = false,
    hideTaskListSelection = false
}) => {
    const { getColor } = useTheme();

    const [name, setName] = useState(existingTask?.name || initialName);
    const [notes, setNotes] = useState(existingTask?.notes || '');
    const [selectedTaskListId, setSelectedTaskListId] = useState<TaskListId>(() => {
        if (existingTask?.taskListId) return existingTask.taskListId;
        if (defaultTaskListId) return defaultTaskListId;
        return taskLists[0]?._id!;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const tasksHook = useTasks();

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
                notes: notes.trim() || null,
                taskListId: selectedTaskListId,
            };

            if (isEditMode && existingTask) {
                await tasksHook.updateTask(existingTask._id, taskData);
            } else {
                await tasksHook.createTask({
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

    const handleDelete = async () => {
        if (!existingTask) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await tasksHook.deleteTask(existingTask._id);
            onTaskSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task');
            setIsLoading(false);
        }
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
        
        // Use onCancel if provided (for edit mode navigation back to detail view)
        // Otherwise use onDismiss (for create mode navigation back to list)
        if (onCancel) {
            onCancel();
        } else {
            onDismiss();
        }
    };

    const selectedTaskList = taskLists.find(list => list._id === selectedTaskListId);

    return (
        <BaseFormView
            isPresented={isPresented}
            onDismiss={handleCancel}
            title={isEditMode ? 'Edit Task' : 'New Task'}
            isEditMode={isEditMode}
            onSave={handleSaveTask}
            isSaveDisabled={!name.trim() || !selectedTaskListId}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={existingTask}
            onDelete={handleDelete}
            deleteButtonText="Delete Task"
            deleteConfirmTitle="Delete Task"
            deleteConfirmMessage="Are you sure you want to delete this task? This action cannot be undone."
        >
                <FormSection title="Task Details">
                    <FormField
                        label="Task Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter task name"
                        required
                        autoFocus={!isEditMode}
                        maxLength={200}
                    />

                    <FormTextArea
                        label="Notes"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add notes (optional)"
                        maxLength={1000}
                        numberOfLines={4}
                    />

                    {hideTaskListSelection ? (
                        <View className="mb-4">
                            <Text className="text-on-surface-variant text-sm mb-2">
                                Creating task in: <Text className="text-on-surface font-semibold">{selectedTaskList?.name}</Text>
                            </Text>
                        </View>
                    ) : (
                        <SelectionList
                            label="Task List"
                            options={taskLists.map(taskList => ({
                                value: taskList._id,
                                label: taskList.name,
                                description: `${taskList.tasks.length} tasks in this list`
                            }))}
                            selectedValue={selectedTaskListId}
                            onSelectionChange={(value) => setSelectedTaskListId(value as any)}
                            required
                        />
                    )}
                </FormSection>

        </BaseFormView>
    );
};

export default TaskFormView;