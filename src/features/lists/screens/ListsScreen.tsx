import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import { ListId, ListItemData, ModuleType } from "@timothyw/pat-common";
import { useListsStore } from '@/src/stores/useListsStore';
import ListCard from '@/src/features/lists/components/ListCard';
import { useToast } from "@/src/components/toast/ToastContext";
import { ListWithItems } from "@/src/features/lists/models";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { MainStackParamList, splitScreenConfigs } from '@/src/navigation/MainStack';
import { useNavStateLogger } from '@/src/hooks/useNavStateLogger';
import { useHeaderControls } from '@/src/context/HeaderControlsContext';
import { useSplitView } from '@/src/hooks/useSplitView';
import { SplitViewLayout } from '@/src/components/layout/SplitViewLayout';

interface ListsPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Lists'>;
    route: RouteProp<MainStackParamList, 'Lists'>;
}

export const ListsPanel: React.FC<ListsPanelProps> = ({
    navigation,
    route
}) => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const { getListsWithItems, isInitialized, loadAll } = useListsStore();
    const lists = getListsWithItems();
    const { isRefreshing, refreshControl } = useRefreshControl(loadAll, 'Failed to refresh lists');
    const { setHeaderControls } = useHeaderControls();
    const [showCompleted, setShowCompleted] = useState(false);
    const splitView = useSplitView('Lists');

    useNavStateLogger(navigation, 'lists');

    useEffect(() => {
        if (!isInitialized) {
            loadAll();
        }
    }, [isInitialized, loadAll]);

    useFocusEffect(
        React.useCallback(() => {
            if (isRefreshing) return;

            loadAll().catch(err => {
                const errorMsg = err instanceof Error ? err.message : 'Failed to load lists';
                errorToast(errorMsg);
            });
        }, [isRefreshing])
    );

    const handleAddList = () => {
        if (splitView.isWideScreen) {
            splitView.openSplitView('ListForm', {});
        } else {
            navigation.navigate('ListForm', {});
        }
    };

    useFocusEffect(
        useCallback(() => {
            setHeaderControls({
                showAddButton: true,
                onAddTapped: handleAddList,
                showFilterButton: true,
                isFilterActive: showCompleted,
                onFilterTapped: () => setShowCompleted(!showCompleted),
            });

            return () => {
                setHeaderControls({});
            };
        }, [showCompleted])
    );

    const handleListSelect = (list: ListWithItems) => {
        if (splitView.isWideScreen) {
            splitView.openSplitView('ListDetail', {
                listId: list._id
            });
        } else {
            navigation.navigate('ListDetail', {
                listId: list._id
            });
        }
    };

    const handleListItemSelect = (listItem: ListItemData) => {
        if (splitView.isWideScreen) {
            // On wide screens, show in split view
            splitView.openSplitView('ListItemDetail', {
                listItemId: listItem._id,
                listId: listItem.listId
            });
        } else {
            // On narrow screens, use normal navigation
            navigation.navigate('ListItemDetail', {
                listItemId: listItem._id,
                listId: listItem.listId
            });
        }
    };

    const handleAddItemToList = (listId: ListId) => {
        if (splitView.isWideScreen) {
            splitView.openSplitView('ListItemForm', {
                listId
            });
        } else {
            navigation.navigate('ListItemForm', {
                listId
            });
        }
    };

    return (
        <>
            <MainViewHeader
                moduleType={ModuleType.LISTS}
                title="Lists"
            />

            <SplitViewLayout
                splitView={splitView}
                splitScreenConfig={splitScreenConfigs.Lists}
                centeredWidthPercentage={70}
                mainContent={(
                    <>
                        {!isInitialized && lists.length === 0 ? (
                            <View className="flex-1 justify-center items-center p-5">
                                <ActivityIndicator size="large" color={getColor("primary")} />
                            </View>
                        ) : lists.length === 0 ? (
                            <View className="flex-1 justify-center items-center p-5">
                                <Ionicons
                                    name="list"
                                    size={48}
                                    color={getColor("primary")}
                                />
                                <Text className="text-base text-on-background-variant mb-5">
                                    No lists yet
                                </Text>
                                <TouchableOpacity
                                    className="bg-primary px-5 py-2.5 rounded-lg"
                                    onPress={handleAddList}
                                >
                                    <Text className="text-on-primary text-base font-semibold">Create List</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={lists}
                                renderItem={({ item }) => (
                                    <ListCard
                                        list={item}
                                        onPress={handleListSelect}
                                        onListItemPress={handleListItemSelect}
                                        onAddListItem={handleAddItemToList}
                                        showCompleted={showCompleted}
                                    />
                                )}
                                keyExtractor={item => item._id}
                                contentContainerStyle={{ padding: 16 }}
                                refreshControl={refreshControl}
                            />
                        )}
                    </>
                )}
            />
        </>
    );
}

export default ListsPanel;