import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { ListItemData, ListType, ModuleType } from '@timothyw/pat-common';
import { useListsStore } from '@/src/stores/useListsStore';
import { useAlert } from '@/src/components/alert';
import ListItemCard from '../components/ListItemCard';
import { sortListItems } from "@/src/features/lists/models";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";
import { CustomNavigation } from '@/src/hooks/useSplitView';

interface ListDetailViewProps {
    navigation?: StackNavigationProp<MainStackParamList, 'ListDetail'>;
    route?: RouteProp<MainStackParamList, 'ListDetail'>;
    customParams?: MainStackParamList['ListDetail'];
    customNavigation?: CustomNavigation;
}

const ListDetailScreen: React.FC<ListDetailViewProps> = ({
    navigation,
    route,
    customParams,
    customNavigation,
}) => {
    const nav = customNavigation || navigation!;
    const params = route?.params || customParams!;
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showListItems, setShowListItems] = React.useState(false);
    const [rotateAnimation] = React.useState(new Animated.Value(0));

    const { deleteList, deleteListItem, getListsWithItems } = useListsStore();
    const { confirmAlert } = useAlert();

    const listsWithItems = getListsWithItems();
    const currentList = listsWithItems.find(list => list._id === params.listId);

    const handleEditRequest = () => {
        if (currentList) {
            nav.navigate('ListForm', { listId: currentList._id, isEditing: true });
        }
    };

    const handleListItemPress = (listItem: ListItemData) => {
        if (currentList) {
            nav.navigate('ListItemDetail', { listItemId: listItem._id, listId: currentList._id });
        }
    };

    if (!currentList) {
        return null;
    }

    const handleDeleteList = () => {
        const currentListItemCount = currentList.items.length;
        const message = currentListItemCount > 0
            ? `This will delete "${currentList.name}" and all ${currentListItemCount} items in it. This action cannot be undone.`
            : `This will delete "${currentList.name}". This action cannot be undone.`;

        confirmAlert(
            'Delete List',
            message,
            async () => {
                setIsLoading(true);
                setErrorMessage(null);

                try {
                    await deleteList(currentList._id);
                    nav.navigate('Tabs', { screen: ModuleType.LISTS });
                } catch (error) {
                    setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list');
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    const completedListItems = currentList.items.filter(item => item.completed);
    const totalListItems = currentList.items.length;

    const handleToggleListItems = () => {
        const newShowListItems = !showListItems;
        setShowListItems(newShowListItems);
        
        Animated.timing(rotateAnimation, {
            toValue: newShowListItems ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const rotateStyle = {
        transform: [
            {
                rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                }),
            },
        ],
    };

    const handleDeleteCompletedListItems = () => {
        if (completedListItems.length === 0) return;

        confirmAlert(
            'Delete Completed Items',
            `This will delete ${completedListItems.length} completed ${completedListItems.length === 1 ? 'item' : 'items'}. This action cannot be undone.`,
            async () => {
                setIsLoading(true);
                setErrorMessage(null);

                try {
                    // Delete all completed list items
                    await Promise.all(
                        completedListItems.map(listItem => deleteListItem(listItem._id))
                    );
                } catch (error) {
                    setErrorMessage(error instanceof Error ? error.message : 'Failed to delete completed list items');
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    const sections = [
        {
            content: (
                <>
                    <Text className="text-on-surface text-xl font-bold mb-4">{currentList.name}</Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons 
                                name={currentList.type === ListType.NOTES ? 'document-text' : 'checkbox'}
                                size={20} 
                                color={getColor("on-surface-variant")} 
                            />
                            <Text className="text-on-surface-variant text-base ml-2">
                                {currentList.type === ListType.NOTES ? 'Note List' : 'Task List'}
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Ionicons name="list-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                {currentList.type === ListType.NOTES
                                    ? `${totalListItems} note${totalListItems !== 1 ? 's' : ''}`
                                    : `${completedListItems.length}/${totalListItems} completed`
                                }
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                Created {new Date(currentList.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {currentList.updatedAt.getTime() !== currentList.createdAt.getTime() && (
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={20} color={getColor("on-surface-variant")} />
                                <Text className="text-on-surface-variant text-base ml-2">
                                    Updated {new Date(currentList.updatedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            )
        },
        {
            content: (
                <View className="bg-surface rounded-lg">
                    <TouchableOpacity
                        className={`flex-row items-center p-4 ${showListItems ? 'border-b border-outline' : ''}`}
                        onPress={handleToggleListItems}
                    >
                        <Animated.View style={rotateStyle} className="mr-3">
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={getColor('on-surface-variant')}
                            />
                        </Animated.View>
                        <Text className="text-on-surface text-lg font-semibold">
                            {currentList.type === ListType.NOTES ? 'Notes' : 'Tasks'}{' '}
                            <Text className="text-on-surface-variant font-normal">
                                {totalListItems}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                    
                    {showListItems && (
                        <View className="p-4">
                            {totalListItems === 0 ? (
                                <Text className="text-on-surface-variant text-center py-4">
                                    {currentList.type === ListType.NOTES ? 'No notes in this list' : 'No tasks in this list'}
                                </Text>
                            ) : (
                                sortListItems(currentList.items, currentList.type).map((item, index) => (
                                        <ListItemCard
                                            key={item._id}
                                            listItem={item}
                                            list={currentList}
                                            onPress={handleListItemPress}
                                            isLast={index === currentList.items.length - 1}
                                        />
                                    ))
                            )}
                        </View>
                    )}
                </View>
            ),
            showCard: false
        }
    ];

    const actions: Array<{
        label: string;
        onPress: () => void;
        variant?: 'primary' | 'secondary' | 'outline';
        icon?: string;
        loading?: boolean;
        disabled?: boolean;
        isDestructive?: boolean;
    }> = [
        {
            label: "Edit List",
            onPress: handleEditRequest,
            variant: 'outline',
            icon: 'create-outline'
        }
    ];

    // Add delete completed items action if there are completed items
    if (completedListItems.length > 0 && currentList.type === ListType.TASKS) {
        actions.push({
            label: "Delete Completed List Items",
            onPress: handleDeleteCompletedListItems,
            variant: 'secondary',
            icon: 'checkmark-done',
            loading: isLoading
        });
    }

    // Add delete currentList action
    actions.push({
        label: "Delete List",
        onPress: handleDeleteList,
        variant: 'secondary',
        icon: 'trash-outline',
        loading: isLoading,
        isDestructive: true
    });

    return (
        <BaseDetailView
            navigation={nav}
            route={route}
            title={currentList.type === ListType.NOTES ? "Note List" : "Task List"}
            onEditRequest={handleEditRequest}
            errorMessage={errorMessage}
            sections={sections}
            actions={actions}
        />
    );
};

export default ListDetailScreen;