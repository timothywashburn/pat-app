import React, { useState } from 'react';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormSection from '@/src/components/common/FormSection';
import SelectionList from '@/src/components/common/SelectionList';
import { useListsStore } from '@/src/stores/useListsStore';
import { ListType } from "@timothyw/pat-common";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";
import { CustomNavigation } from '@/src/hooks/useSplitView';

interface ListFormViewProps {
    navigation?: StackNavigationProp<MainStackParamList, 'ListForm'>;
    route?: RouteProp<MainStackParamList, 'ListForm'>;
    customParams?: MainStackParamList['ListForm'];
    customNavigation?: CustomNavigation;
}

const ListFormScreen: React.FC<ListFormViewProps> = ({
    navigation,
    route,
    customParams,
    customNavigation,
}) => {
    const nav = customNavigation || navigation!;
    const params = route?.params || customParams!;
    const { createList, updateList, deleteList, getListsWithItems } = useListsStore();
    const listsWithItems = getListsWithItems();
    const currentList = params?.listId ? listsWithItems.find(list => list._id === params.listId) : undefined;
    const currentIsEditMode = params?.isEditing || false;

    const [name, setName] = useState(currentList?.name || '');
    const [type, setType] = useState<ListType>(currentList?.type || ListType.TASKS);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSaveList = async () => {
        if (!name.trim()) {
            setErrorMessage('List name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            if (currentIsEditMode && currentList) {
                await updateList(currentList._id, {
                    name: name.trim(),
                    type: type
                });
            } else {
                await createList(name.trim(), type);
            }

            if (!currentIsEditMode) {
                setName('');
            }

            nav.popTo('Lists');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentList) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await deleteList(currentList._id);
            nav.navigate('Lists');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list');
            setIsLoading(false);
        }
    };

    return (
        <BaseFormView
            navigation={nav}
            route={route}
            title={currentIsEditMode ? 'Edit List' : 'New List'}
            isEditMode={currentIsEditMode}
            onSave={handleSaveList}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={currentList}
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
                    autoFocus={!currentIsEditMode}
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

export default ListFormScreen;