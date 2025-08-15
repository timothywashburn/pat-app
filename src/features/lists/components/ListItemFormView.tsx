import React, { useState } from 'react';
import {
    Text,
    View,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormTextArea from '@/src/components/common/FormTextArea';
import SelectionList from '@/src/components/common/SelectionList';
import FormSection from '@/src/components/common/FormSection';
import { useListsStore } from '@/src/stores/useListsStore';
import { ListItemData, ListId, UpdateListItemRequest } from "@timothyw/pat-common";
import { ListWithItems } from "@/src/features/lists/models";

interface ListItemFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onCancel?: () => void;
    onListItemSaved?: () => void;
    existingListItem?: ListItemData;
    Lists: ListWithItems[];
    defaultListId?: ListId;
    initialName?: string;
    isEditMode?: boolean;
    hideListSelection?: boolean;
}

const ListItemFormView: React.FC<ListItemFormViewProps> = ({
    isPresented,
    onDismiss,
    onCancel,
    onListItemSaved,
    existingListItem,
    Lists,
    defaultListId,
    initialName = '',
    isEditMode = false,
    hideListSelection = false
}) => {
    const [name, setName] = useState(existingListItem?.name || initialName);
    const [notes, setNotes] = useState(existingListItem?.notes || '');
    const [selectedListId, setSelectedListId] = useState<ListId>(() => {
        if (existingListItem?.listId) return existingListItem.listId;
        if (defaultListId) return defaultListId;
        return Lists[0]?._id!;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { createListItem, updateListItem, deleteListItem } = useListsStore();

    if (!isPresented) {
        return null;
    }

    const handleSaveListItem = async () => {
        if (!name.trim()) {
            setErrorMessage('List item name is required');
            return;
        }

        if (!selectedListId) {
            setErrorMessage('Please select a list');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const listItemData: UpdateListItemRequest = {
                name: name.trim(),
                notes: notes.trim() || null,
                listId: selectedListId,
            };

            if (isEditMode && existingListItem) {
                await updateListItem(existingListItem._id, listItemData);
            } else {
                await createListItem({
                    name: name.trim(),
                    notes: notes.trim() || undefined,
                    listId: selectedListId,
                });
            }

            if (!isEditMode) {
                setName(initialName);
                setNotes('');
            }

            onListItemSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save list item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingListItem) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await deleteListItem(existingListItem._id);
            onListItemSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list item');
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isEditMode && existingListItem) {
            setName(existingListItem.name);
            setNotes(existingListItem.notes || '');
            setSelectedListId(existingListItem.listId);
        } else {
            setName(initialName);
            setNotes('');
            setSelectedListId(defaultListId || Lists[0]?._id!);
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

    const selectedList = Lists.find(list => list._id === selectedListId);

    return (
        <BaseFormView
            isPresented={isPresented}
            onDismiss={handleCancel}
            title={isEditMode ? 'Edit List Item' : 'New List Item'}
            isEditMode={isEditMode}
            onSave={handleSaveListItem}
            isSaveDisabled={!name.trim() || !selectedListId}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={existingListItem}
            onDelete={handleDelete}
            deleteButtonText="Delete List Item"
            deleteConfirmTitle="Delete List ITem"
            deleteConfirmMessage="Are you sure you want to delete this item? This action cannot be undone."
        >
                <FormSection title="List Item Details">
                    <FormField
                        label="Item Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter item name"
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

                    {hideListSelection ? (
                        <View className="mb-4">
                            <Text className="text-on-surface-variant text-sm mb-2">
                                Creating list item in: <Text className="text-on-surface font-semibold">{selectedList?.name}</Text>
                            </Text>
                        </View>
                    ) : (
                        <SelectionList
                            label="List"
                            options={Lists.map(list => ({
                                value: list._id,
                                label: list.name,
                                description: `${list.items.length} list items in this list`
                            }))}
                            selectedValue={selectedListId}
                            onSelectionChange={(value) => setSelectedListId(value as any)}
                            required
                        />
                    )}
                </FormSection>

        </BaseFormView>
    );
};

export default ListItemFormView;