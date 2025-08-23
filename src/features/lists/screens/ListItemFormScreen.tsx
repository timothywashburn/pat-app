import React, { useState } from 'react';
import {
    Text,
    View,
} from 'react-native';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormTextArea from '@/src/components/common/FormTextArea';
import SelectionList from '@/src/components/common/SelectionList';
import FormSection from '@/src/components/common/FormSection';
import { useListsStore } from '@/src/stores/useListsStore';
import { ListId, UpdateListItemRequest } from "@timothyw/pat-common";
import { ListWithItems } from "@/src/features/lists/models";
import { StackNavigationProp } from "@react-navigation/stack";
import { ListsStackParamList } from "@/src/navigation/ListsStack";
import { RouteProp } from "@react-navigation/core";

interface ListItemFormViewProps {
    navigation: StackNavigationProp<ListsStackParamList, 'ListItemForm'>;
    route: RouteProp<ListsStackParamList, 'ListItemForm'>;
}

const ListItemFormScreen: React.FC<ListItemFormViewProps> = ({
    navigation,
    route,
}) => {
    const currentListItem = route.params.listItem;
    const currentIsEditMode = route.params.isEditing || false;
    const allowListChange = route.params.allowListChange || false;
    const currentLists: ListWithItems[] = route.params.lists || [];

    const [name, setName] = useState(currentListItem?.name || '');
    const [notes, setNotes] = useState(currentListItem?.notes || '');
    const [selectedListId, setSelectedListId] = useState<ListId>(() => {
        if (route.params.listId) return route.params.listId;
        if (currentListItem?.listId) return currentListItem.listId;
        return currentLists[0]?._id!;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { createListItem, updateListItem, deleteListItem } = useListsStore();

    const selectedList = currentLists.find(list => list._id === selectedListId);

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

            if (currentIsEditMode) {
                navigation.goBack();
            } else {
                navigation.navigate('ListDetail', { list: selectedList! });
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
            navigation.navigate('ListDetail', { list: selectedList! });
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

                    <FormTextArea
                        label="Notes"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add notes (optional)"
                        maxLength={1000}
                        numberOfLines={4}
                    />

                    {allowListChange ? (
                        <SelectionList
                            label="List"
                            options={currentLists.map(list => ({
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