import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormSection from '@/src/components/common/FormSection';
import { TaskManager } from '@/src/features/tasks/controllers/TaskManager';
import { TaskList } from '@/src/features/tasks/models';

interface TaskListFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onCancel?: () => void;
    onTaskListSaved?: () => void;
    existingTaskList?: TaskList;
    isEditMode?: boolean;
}

const TaskListFormView: React.FC<TaskListFormViewProps> = ({
    isPresented,
    onDismiss,
    onCancel,
    onTaskListSaved,
    existingTaskList,
    isEditMode = false
}) => {
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

    const handleDelete = async () => {
        if (!existingTaskList) return;

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
    };

    const handleCancel = () => {
        if (isEditMode && existingTaskList) {
            setName(existingTaskList.name);
        } else {
            setName('');
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

    return (
        <BaseFormView
            isPresented={isPresented}
            onDismiss={handleCancel}
            title={isEditMode ? 'Edit List' : 'New List'}
            isEditMode={isEditMode}
            onSave={handleSaveTaskList}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={existingTaskList}
            onDelete={handleDelete}
            deleteButtonText="Delete List"
            deleteConfirmTitle="Delete Task List"
            deleteConfirmMessage="Are you sure you want to delete this task list? This will also delete all tasks in it. This action cannot be undone."
        >
                <FormSection title="List Details">
                    <FormField
                        label="List Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter list name"
                        required
                        autoFocus={!isEditMode}
                        maxLength={100}
                    />
                </FormSection>

        </BaseFormView>
    );
};

export default TaskListFormView;