import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';
import CustomHeader from '@/src/components/CustomHeader';
import { ListId, ListItemData, ModuleType } from "@timothyw/pat-common";
import { useLists } from '@/src/features/lists/hooks/useLists';
import ListCard from '@/src/features/lists/components/ListCard';
import ListDetailView from '@/src/features/lists/components/ListDetailView';
import ListFormView from '@/src/features/lists/components/ListFormView';
import ListItemDetailView from '@/src/features/lists/components/ListItemDetailView';
import ListItemFormView from '@/src/features/lists/components/ListItemFormView';
import { useToast } from "@/src/components/toast/ToastContext";
import { ListWithItems } from "@/src/features/lists/models";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';

export const ListsPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const listsHook = useLists();
    const { listsWithItems: lists, isInitialized, error } = listsHook;
    const { isRefreshing, refreshControl } = useRefreshControl(listsHook.loadLists, 'Failed to refresh lists');
    const [showCompleted, setShowCompleted] = useState(false);

    // State for detail views
    const [selectedList, setSelectedList] = useState<ListWithItems | null>(null);
    const [selectedListItem, setSelectedListItem] = useState<ListItemData | null>(null);
    const [showingListDetail, setShowingListDetail] = useState(false);
    const [showingListItemDetail, setShowingListItemDetail] = useState(false);
    const [showingListEdit, setShowingListEdit] = useState(false);
    const [showingCreateList, setShowingCreateList] = useState(false);
    const [showingListItemEdit, setShowingListItemEdit] = useState(false);
    const [showingCreateListItem, setShowingCreateListItem] = useState(false);
    const [selectedListForNewItem, setSelectedListForNewItem] = useState<ListId | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            if (isRefreshing) return;

            listsHook.loadLists().catch(err => {
                const errorMsg = err instanceof Error ? err.message : 'Failed to load lists';
                errorToast(errorMsg);
            });
        }, [isRefreshing])
    );


    const handleAddList = () => {
        setShowingCreateList(true);
    };

    const handleListSelect = (list: ListWithItems) => {
        setSelectedList(list);
        setShowingListDetail(true);
    };

    const handleListItemSelect = (listItem: ListItemData) => {
        setSelectedListItem(listItem);
        setShowingListItemDetail(true);
    };

    const handleListDetailDismiss = () => {
        setShowingListDetail(false);
        setSelectedList(null);
    };

    const handleListItemDetailDismiss = () => {
        setShowingListItemDetail(false);
        setSelectedListItem(null);
    };

    const handleListItemEditRequest = () => {
        setShowingListItemDetail(false);
        setShowingListItemEdit(true);
    };

    const handleListItemUpdated = () => {
        handleListItemDetailDismiss();
    };

    const handleListItemFormDismiss = () => {
        setShowingListItemEdit(false);
        setSelectedListItem(null);
    };

    const handleListItemEditCancel = () => {
        setShowingListItemEdit(false);
        setShowingListItemDetail(true);
    };

    const handleListItemSaved = () => {
        setSelectedListItem(null);
        setShowingListItemEdit(false);
        setShowingCreateListItem(false);
    };

    const handleAddItemToList = (listId: ListId) => {
        setSelectedListForNewItem(listId);
        setShowingCreateListItem(true);
    };

    const handleCreateListItemDismiss = () => {
        setShowingCreateListItem(false);
        setSelectedListForNewItem(null);
    };

    const handleListEditRequest = () => {
        setShowingListDetail(false);
        setShowingListEdit(true);
    };

    const handleListUpdated = () => {
        handleListDetailDismiss();
    };

    const handleListFormDismiss = () => {
        setShowingCreateList(false);
        setShowingListEdit(false);
        setSelectedList(null);
    };

    const handleListEditCancel = () => {
        setShowingListEdit(false);
        setShowingListDetail(true);
    };

    const handleListSaved = () => {
        setSelectedList(null);
        setShowingListEdit(false);
        setShowingCreateList(false);
    };

    return (
        <>
            <CustomHeader
                moduleType={ModuleType.LISTS}
                title="Lists"
                showAddButton
                onAddTapped={handleAddList}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

            {isInitialized && lists.length === 0 ? (
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

            {selectedList && (
                <ListDetailView
                    list={selectedList}
                    isPresented={showingListDetail}
                    onDismiss={handleListDetailDismiss}
                    onEditRequest={handleListEditRequest}
                    onListItemPress={handleListItemSelect}
                    onListUpdated={handleListUpdated}
                />
            )}

            <ListFormView
                isPresented={showingCreateList}
                onDismiss={handleListFormDismiss}
                onListSaved={handleListSaved}
            />

            {selectedList && (
                <ListFormView
                    isPresented={showingListEdit}
                    onDismiss={handleListFormDismiss}
                    onCancel={handleListEditCancel}
                    onListSaved={handleListSaved}
                    existingList={selectedList}
                    isEditMode={true}
                />
            )}

            {selectedListItem && (() => {
                const list = lists.find(tl => tl._id === selectedListItem.listId);
                return list ? (
                    <ListItemDetailView
                        listItem={selectedListItem}
                        list={list}
                        isPresented={showingListItemDetail}
                        onDismiss={handleListItemDetailDismiss}
                        onEditRequest={handleListItemEditRequest}
                        onListItemUpdated={handleListItemUpdated}
                    />
                ) : null;
            })()}

            <ListItemFormView
                key={selectedListForNewItem || 'general'}
                isPresented={showingCreateListItem}
                onDismiss={handleCreateListItemDismiss}
                onListItemSaved={handleListItemSaved}
                Lists={lists}
                defaultListId={selectedListForNewItem || undefined}
                hideListSelection={!!selectedListForNewItem}
            />

            {selectedListItem && (
                <ListItemFormView
                    isPresented={showingListItemEdit}
                    onDismiss={handleListItemFormDismiss}
                    onCancel={handleListItemEditCancel}
                    onListItemSaved={handleListItemSaved}
                    existingListItem={selectedListItem}
                    Lists={lists}
                    isEditMode={true}
                />
            )}
        </>
    );
}

export default ListsPanel;