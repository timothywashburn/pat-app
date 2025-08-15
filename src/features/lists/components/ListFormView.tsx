import React, { useState } from 'react';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormSection from '@/src/components/common/FormSection';
import SelectionList from '@/src/components/common/SelectionList';
import { useListsStore } from '@/src/stores/useListsStore';
import { ListData, ListType } from "@timothyw/pat-common";

interface ListFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onCancel?: () => void;
    onListSaved?: () => void;
    existingList?: ListData;
    isEditMode?: boolean;
}

const ListFormView: React.FC<ListFormViewProps> = ({
    isPresented,
    onDismiss,
    onCancel,
    onListSaved,
    existingList,
    isEditMode = false
}) => {
    const [name, setName] = useState(existingList?.name || '');
    const [type, setType] = useState<ListType>(existingList?.type || ListType.TASKS);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { createList, updateList, deleteList } = useListsStore();

    if (!isPresented) {
        return null;
    }

    const handleSaveList = async () => {
        if (!name.trim()) {
            setErrorMessage('List name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            if (isEditMode && existingList) {
                await updateList(existingList._id, {
                    name: name.trim(),
                    type: type
                });
            } else {
                await createList(name.trim(), type);
            }

            if (!isEditMode) {
                setName('');
            }

            onListSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingList) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await deleteList(existingList._id);
            onListSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list');
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isEditMode && existingList) {
            setName(existingList.name);
            setType(existingList.type);
        } else {
            setName('');
            setType(ListType.TASKS);
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
            onSave={handleSaveList}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={existingList}
            onDelete={handleDelete}
            deleteButtonText="Delete List"
            deleteConfirmTitle="Delete List"
            deleteConfirmMessage="Are you sure you want to delete this list? This will also delete all tasks in it. This action cannot be undone."
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
                    
                    <SelectionList
                        label="List Type"
                        selectedValue={type}
                        onSelectionChange={(value) => setType(value as ListType)}
                        options={[
                            { label: 'Task List', value: ListType.TASKS, description: 'Items can be marked as complete' },
                            { label: 'Note List', value: ListType.NOTES, description: 'Items are notes and cannot be completed' }
                        ]}
                        required
                    />
                </FormSection>

        </BaseFormView>
    );
};

export default ListFormView;