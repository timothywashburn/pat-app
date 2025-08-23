import React from 'react';
import {
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { ListData, ListItemData, ListType } from '@timothyw/pat-common';
import { useListsStore } from '@/src/stores/useListsStore';
import { useAlert } from '@/src/components/alert';
import { StackNavigationProp } from "@react-navigation/stack";
import { ListsStackParamList } from "@/src/navigation/ListsStack";
import { RouteProp } from "@react-navigation/core";

interface ListItemDetailViewProps {
    navigation: StackNavigationProp<ListsStackParamList, 'ListItemDetail'>;
    route: RouteProp<ListsStackParamList, 'ListItemDetail'>;
}

const ListItemDetailScreen: React.FC<ListItemDetailViewProps> = ({
    navigation,
    route,
}) => {
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    
    const currentListItem = route.params.listItem;
    const currentList = route.params.list;
    
    const handleEditRequest = () => {
        navigation.navigate('ListItemForm', {
            listItem: currentListItem,
            isEditing: true,
        });
    };
    
    const isNoteList = currentList?.type === ListType.NOTES;
    const { setListItemCompleted, deleteListItem } = useListsStore();
    const { confirmAlert } = useAlert();

    if (!currentListItem || !currentList) {
        return null;
    }

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await setListItemCompleted(currentListItem._id, !currentListItem.completed);
            navigation.goBack();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update list item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteListItem = () => {
        confirmAlert(
            'Delete List Item',
            'Are you sure you want to delete this list item? This action cannot be undone.',
            async () => {
                setIsLoading(true);
                setErrorMessage(null);

                try {
                    await deleteListItem(currentListItem._id);
                    navigation.goBack();
                } catch (error) {
                    setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list item');
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    const actions = [
        {
            label: isNoteList ? "Edit Note" : "Edit Task",
            onPress: handleEditRequest,
            variant: 'outline' as const,
            icon: 'create-outline'
        },
        ...(isNoteList ? [] : [{
            label: currentListItem.completed ? "Mark as Incomplete" : "Mark as Complete",
            onPress: handleToggleCompleted,
            variant: 'primary' as const,
            icon: currentListItem.completed ? 'refresh-circle' : 'checkmark-circle',
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
            navigation={navigation}
            route={route}
            title={isNoteList ? "Note Details" : "Task Details"}
            onEditRequest={handleEditRequest}
            errorMessage={errorMessage}
            actions={actions}
        >
            <Text className="text-on-surface text-xl font-bold mb-4">{currentListItem.name}</Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                Created {new Date(currentListItem.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {currentListItem.updatedAt.getTime() !== currentListItem.createdAt.getTime() && (
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="time-outline" size={20} color={getColor("on-surface-variant")} />
                                <Text className="text-on-surface-variant text-base ml-2">
                                    Updated {new Date(currentListItem.updatedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {currentListItem.notes && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
                            <View className="bg-surface border border-outline rounded-lg p-3">
                                <Text className="text-on-surface text-base">{currentListItem.notes}</Text>
                            </View>
                        </View>
                    )}

            {!isNoteList && (
                <View className="flex-row items-center">
                    <Ionicons
                        name={currentListItem.completed ? "checkmark-circle" : "radio-button-off"}
                        size={20}
                        color={currentListItem.completed ? getColor("primary") : getColor("on-surface-variant")}
                    />
                    <Text className="text-on-surface text-base ml-2">
                        {currentListItem.completed ? "Completed" : "Not completed"}
                    </Text>
                </View>
            )}
        </BaseDetailView>
    );
};

export default ListItemDetailScreen;