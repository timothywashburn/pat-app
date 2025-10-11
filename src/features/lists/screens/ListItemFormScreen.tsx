import React, { useState } from 'react';
import {
    Text,
    View,
} from 'react-native';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import SelectionList from '@/src/components/common/SelectionList';
import FormSection from '@/src/components/common/FormSection';
import { useListsStore } from '@/src/stores/useListsStore';
import { ListId, UpdateListItemRequest } from "@timothyw/pat-common";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";

interface ListItemFormViewProps {
    navigation: StackNavigationProp<MainStackParamList, 'ListItemForm'>;
    route: RouteProp<MainStackParamList, 'ListItemForm'>;
}

const ListItemFormScreen: React.FC<ListItemFormViewProps> = ({
    navigation,
    route,
}) => {
    const { createListItem, updateListItem, deleteListItem, getListsWithItems, listItems } = useListsStore();
    const listsWithItems = getListsWithItems();
    const currentListItem = route.params.listItemId ? listItems.find(item => item._id === route.params.listItemId) : undefined;
    const currentIsEditMode = route.params.isEditing || false;
    const allowListChange = route.params.allowListChange || false;
    const thoughtId = route.params.thoughtId;
    const initialName = route.params.initialName || '';

    const [name, setName] = useState(currentListItem?.name || initialName);
    const [notes, setNotes] = useState(currentListItem?.notes || '');
    const [selectedListId, setSelectedListId] = useState<ListId>(() => {
        if (route.params.listId) return route.params.listId;
        if (currentListItem?.listId) return currentListItem.listId;
        return listsWithItems[0]?._id!;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selectedList = listsWithItems.find(list => list._id === selectedListId);

    const handleSaveListItem = async () => {
        if (!name.trim()) {
            setErrorMessage('List item name is required');
            return;
        }

        // TODO: better handling, but this probably only happens if there are no lists if opening from inbox view
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

            if (currentIsEditMode && currentListItem) {
                await updateListItem(currentListItem._id, listItemData);
            } else {
                await createListItem({
                    name: name.trim(),
                    notes: notes.trim() || undefined,
                    listId: selectedListId,
                });
            }

            if (!currentIsEditMode) {
                // setName(currentInitialName);
                setNotes('');
            }

            if (thoughtId) {
                navigation.popTo('Inbox', {
                    thoughtProcessed: true,
                    thoughtId: thoughtId
                });
            } else {
                navigation.popTo('Lists');
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save list item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentListItem) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await deleteListItem(currentListItem._id);
            navigation.navigate('ListDetail', { listId: selectedListId });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list item');
            setIsLoading(false);
        }
    };

    return (
        <BaseFormView
            navigation={navigation}
            route={route}
            title={currentIsEditMode ? 'Edit List Item' : 'New List Item'}
            isEditMode={currentIsEditMode}
            onSave={handleSaveListItem}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={currentListItem}
            onDelete={handleDelete}
            deleteButtonText="Delete List Item"
            deleteConfirmTitle="Delete List Item"
            deleteConfirmMessage="Are you sure you want to delete this item? This action cannot be undone."
        >
                <FormSection title="List Item Details">
                    <FormField
                        label="Item Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter item name"
                        required
                        autoFocus={!currentIsEditMode}
                        maxLength={200}
                    />

                    <FormField
                        label="Notes"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add notes (optional)"
                        maxLength={1000}
                        multiline
                    />

                    {allowListChange ? (
                        <SelectionList
                            label="List"
                            options={listsWithItems.map(list => ({
                                value: list._id,
                                label: list.name,
                                description: `${list.items.length} list items in this list`
                            }))}
                            selectedValue={selectedListId}
                            onSelectionChange={(value) => setSelectedListId(value as any)}
                            required
                        />
                    ) : (
                        <View className="mb-4">
                            <Text className="text-on-surface-variant text-sm mb-2">
                                Creating list item in: <Text className="text-on-surface font-semibold">{selectedList?.name}</Text>
                            </Text>
                        </View>
                    )}
                </FormSection>

        </BaseFormView>
    );
};

export default ListItemFormScreen;