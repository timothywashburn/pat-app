import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import { ListId, ListItemData, ModuleType } from "@timothyw/pat-common";
import { useListsStore } from '@/src/stores/useListsStore';
import ListCard from '@/src/features/lists/components/ListCard';
import { useToast } from "@/src/components/toast/ToastContext";
import { ListWithItems } from "@/src/features/lists/models";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { MainStackParamList } from '@/src/navigation/MainStack';

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

    useEffect(() => {
        if (!isInitialized) {
            loadAll();
        }
    }, [isInitialized, loadAll]);
    const [showCompleted, setShowCompleted] = useState(false);

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
        navigation.navigate('ListForm', {});
    };

    const handleListSelect = (list: ListWithItems) => {
        navigation.navigate('ListDetail', {
            listId: list._id
        });
    };

    const handleListItemSelect = (listItem: ListItemData) => {
        navigation.navigate('ListItemDetail', {
            listItemId: listItem._id,
            listId: listItem.listId
        });
    };

    const handleAddItemToList = (listId: ListId) => {
        navigation.navigate('ListItemForm', {
            listId
        });
    };

    return (
        <>
            <MainViewHeader
                moduleType={ModuleType.LISTS}
                title="Lists"
                showAddButton
                onAddTapped={handleAddList}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

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
    );
}

export default ListsPanel;