import React from 'react';
import {
    Text,
    View,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { ListData, ListItemData, ListType } from '@timothyw/pat-common';
import { useListsStore } from '@/src/stores/useListsStore';

interface ListItemDetailViewProps {
    listItem: ListItemData;
    list: ListData;
    isPresented: boolean;
    onDismiss: () => void;
    onEditRequest: () => void;
    onListItemUpdated?: () => void;
}

const ListItemDetailView: React.FC<ListItemDetailViewProps> = ({
    listItem,
    list,
    isPresented,
    onDismiss,
    onEditRequest,
    onListItemUpdated,
}) => {
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    
    const isNoteList = list.type === ListType.NOTES;
    const { setListItemCompleted, deleteListItem } = useListsStore();

    if (!isPresented) {
        return null;
    }

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await setListItemCompleted(listItem._id, !listItem.completed);
            onListItemUpdated?.();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update list item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteListItem = () => {
        Alert.alert(
            'Delete List Item',
            'Are you sure you want to delete this list item? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        setErrorMessage(null);

                        try {
                            await deleteListItem(listItem._id);
                            onListItemUpdated?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list item');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const actions = [
        {
            label: isNoteList ? "Edit Note" : "Edit Task",
            onPress: onEditRequest,
            variant: 'outline' as const,
            icon: 'create-outline'
        },
        ...(isNoteList ? [] : [{
            label: listItem.completed ? "Mark as Incomplete" : "Mark as Complete",
            onPress: handleToggleCompleted,
            variant: 'primary' as const,
            icon: listItem.completed ? 'refresh-circle' : 'checkmark-circle',
            loading: isLoading
        }]),
        {
            label: isNoteList ? "Delete Note" : "Delete Task",
            onPress: handleDeleteListItem,
            variant: 'secondary' as const,
            icon: 'trash-outline',
            isDestructive: true
        }
    ];

    return (
        <BaseDetailView
            isPresented={isPresented}
            onDismiss={onDismiss}
            title={isNoteList ? "Note Details" : "Task Details"}
            onEditRequest={onEditRequest}
            errorMessage={errorMessage}
            actions={actions}
        >
            <Text className="text-on-surface text-xl font-bold mb-4">{listItem.name}</Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                Created {new Date(listItem.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {listItem.updatedAt.getTime() !== listItem.createdAt.getTime() && (
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="time-outline" size={20} color={getColor("on-surface-variant")} />
                                <Text className="text-on-surface-variant text-base ml-2">
                                    Updated {new Date(listItem.updatedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {listItem.notes && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
                            <View className="bg-surface border border-outline rounded-lg p-3">
                                <Text className="text-on-surface text-base">{listItem.notes}</Text>
                            </View>
                        </View>
                    )}

            {!isNoteList && (
                <View className="flex-row items-center">
                    <Ionicons
                        name={listItem.completed ? "checkmark-circle" : "radio-button-off"}
                        size={20}
                        color={listItem.completed ? getColor("primary") : getColor("on-surface-variant")}
                    />
                    <Text className="text-on-surface text-base ml-2">
                        {listItem.completed ? "Completed" : "Not completed"}
                    </Text>
                </View>
            )}
        </BaseDetailView>
    );
};

export default ListItemDetailView;