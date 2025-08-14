import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    Alert,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { ListWithItems, sortListItems } from '@/src/features/lists/models';
import { ListItemData, ListType } from '@timothyw/pat-common';
import { useLists } from '@/src/features/lists/hooks/useLists';
import ListItemCard from './ListItemCard';

interface ListDetailViewProps {
    list: ListWithItems;
    isPresented: boolean;
    onDismiss: () => void;
    onEditRequest: () => void;
    onListItemPress: (listItem: ListItemData) => void;
    onListUpdated?: () => void;
}

const ListDetailView: React.FC<ListDetailViewProps> = ({
    list,
    isPresented,
    onDismiss,
    onEditRequest,
    onListItemPress,
    onListUpdated,
}) => {
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showListItems, setShowListItems] = React.useState(false);
    const [rotateAnimation] = React.useState(new Animated.Value(0));

    const listsHook = useLists();

    if (!isPresented) {
        return null;
    }

    const handleDeleteList = () => {
        const listItemCount = list.items.length;
        const message = listItemCount > 0
            ? `This will delete "${list.name}" and all ${listItemCount} items in it. This action cannot be undone.`
            : `This will delete "${list.name}". This action cannot be undone.`;

        Alert.alert(
            'Delete List',
            message,
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
                            await listsHook.deleteList(list._id);
                            onListUpdated?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete list');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const completedListItems = list.items.filter(item => item.completed);
    const totalListItems = list.items.length;

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

        Alert.alert(
            'Delete Completed Items',
            `This will delete ${completedListItems.length} completed ${completedListItems.length === 1 ? 'item' : 'items'}. This action cannot be undone.`,
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
                            // Delete all completed list items
                            await Promise.all(
                                completedListItems.map(listItems => listsHook.deleteListItem(listItems._id))
                            );
                            onListUpdated?.();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete completed list items');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const sections = [
        {
            content: (
                <>
                    <Text className="text-on-surface text-xl font-bold mb-4">{list.name}</Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons 
                                name={list.type === ListType.NOTES ? 'document-text' : 'checkbox'}
                                size={20} 
                                color={getColor("on-surface-variant")} 
                            />
                            <Text className="text-on-surface-variant text-base ml-2">
                                {list.type === ListType.NOTES ? 'Note List' : 'Task List'}
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Ionicons name="list-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                {list.type === ListType.NOTES
                                    ? `${totalListItems} note${totalListItems !== 1 ? 's' : ''}`
                                    : `${completedListItems.length}/${totalListItems} completed`
                                }
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                            <Text className="text-on-surface-variant text-base ml-2">
                                Created {new Date(list.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {list.updatedAt.getTime() !== list.createdAt.getTime() && (
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={20} color={getColor("on-surface-variant")} />
                                <Text className="text-on-surface-variant text-base ml-2">
                                    Updated {new Date(list.updatedAt).toLocaleDateString()}
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
                            {list.type === ListType.NOTES ? 'Notes' : 'Tasks'}{' '}
                            <Text className="text-on-surface-variant font-normal">
                                {totalListItems}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                    
                    {showListItems && (
                        <View className="p-4">
                            {totalListItems === 0 ? (
                                <Text className="text-on-surface-variant text-center py-4">
                                    {list.type === ListType.NOTES ? 'No notes in this list' : 'No tasks in this list'}
                                </Text>
                            ) : (
                                sortListItems(list.items, list.type).map((item, index) => (
                                        <ListItemCard
                                            key={item._id}
                                            listItem={item}
                                            list={list}
                                            onPress={onListItemPress}
                                            isLast={index === list.items.length - 1}
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
            onPress: onEditRequest,
            variant: 'outline',
            icon: 'create-outline'
        }
    ];

    // Add delete completed items action if there are completed items
    if (completedListItems.length > 0 && list.type === ListType.TASKS) {
        actions.push({
            label: "Delete Completed List Items",
            onPress: handleDeleteCompletedListItems,
            variant: 'secondary',
            icon: 'checkmark-done',
            loading: isLoading
        });
    }

    // Add delete list action
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
            isPresented={isPresented}
            onDismiss={onDismiss}
            title={list.type === ListType.NOTES ? "Note List" : "Task List"}
            onEditRequest={onEditRequest}
            errorMessage={errorMessage}
            sections={sections}
            actions={actions}
        />
    );
};

export default ListDetailView;