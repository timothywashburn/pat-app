import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import AgendaItemFormView from '@/src/features/agenda/components/AgendaItemFormView';
import AgendaItemDetailView from '@/src/features/agenda/components/AgendaItemDetailView';
import AgendaItemCard from '@/src/features/agenda/components/AgendaItemCard';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";
import { useToast } from "@/src/components/toast/ToastContext";
import { ItemData, ModuleType } from "@timothyw/pat-common";
import { TableHeader } from "@/src/features/agenda/components/TableHeader";

export const AgendaPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const { width } = useWindowDimensions();
    const [agendaItems, setAgendaItems] = useState<ItemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    // State for the create/edit form
    const [showingCreateForm, setShowingCreateForm] = useState(false);
    const [showingEditForm, setShowingEditForm] = useState(false);

    // State for detail view
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
    const [showingDetailView, setShowingDetailView] = useState(false);

    const agendaManager = AgendaManager.getInstance();

    const isTableView = width >= 768;

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        if (isRefreshing) return;

        setIsLoading(true);

        try {
            await agendaManager.loadAgendaItems();
            setAgendaItems(agendaManager.agendaItems);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load items';
            errorToast(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            console.log('haptics not available:', err);
        }

        try {
            await agendaManager.loadAgendaItems();
            setAgendaItems(agendaManager.agendaItems);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to refresh items';
            errorToast(errorMsg);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddItem = () => {
        setShowingCreateForm(true);
    };

    const handleItemSelect = (item: ItemData) => {
        setSelectedItem(item);
        setShowingDetailView(true);
    };

    const handleDetailDismiss = () => {
        setShowingDetailView(false);
        setSelectedItem(null);
    };

    const handleEditRequest = () => {
        setShowingDetailView(false);
        setShowingEditForm(true);
    };

    const handleFormDismiss = async () => {
        await loadItems();
        
        setShowingCreateForm(false);
        setShowingEditForm(false);
        setSelectedItem(null);
    };

    const handleEditCancel = () => {
        setShowingEditForm(false);
        setShowingDetailView(true);
    };

    const handleItemUpdated = () => {
        loadItems();
        handleDetailDismiss();
    };

    const filteredItems = agendaItems
        .filter(item => item.completed === showCompleted)
        .sort((a, b) => {
            if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
            if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
        });

    return (
        <>
            <CustomHeader
                moduleType={ModuleType.AGENDA}
                title="Agenda"
                showAddButton
                onAddTapped={handleAddItem}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

            {isLoading && agendaItems.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <ActivityIndicator size="large" color={getColor("primary")} />
                </View>
            ) : filteredItems.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons
                        name="checkmark-circle"
                        size={48}
                        color={getColor("primary")}
                    />
                    <Text className="text-base text-on-background-variant mb-5">
                        {showCompleted ? 'No completed items' : 'No pending items'}
                    </Text>
                    <TouchableOpacity
                        className="bg-primary px-5 py-2.5 rounded-lg"
                        onPress={handleAddItem}
                    >
                        <Text className="text-on-primary text-base font-semibold">Add Item</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={[{ key: 'content' }]}
                    renderItem={() => (
                        isTableView ? (
                            <View className="p-6">
                                <View className="bg-surface rounded-xl overflow-hidden">
                                    <TableHeader />
                                    {filteredItems.map((item) => (
                                        <AgendaItemCard
                                            key={item._id}
                                            item={item}
                                            onPress={handleItemSelect}
                                            isTableView={true}
                                        />
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View className="px-4 pt-3">
                                {filteredItems.map((item, index) => (
                                    <AgendaItemCard
                                        key={item._id}
                                        item={item}
                                        onPress={handleItemSelect}
                                        isTableView={false}
                                    />
                                ))}
                            </View>
                        )
                    )}
                    keyExtractor={item => item.key}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[getColor("primary")]}
                            tintColor={getColor("primary")}
                        />
                    }
                />
            )}

            {/* Create new item view */}
            <AgendaItemFormView
                isPresented={showingCreateForm}
                onDismiss={handleFormDismiss}
                onItemSaved={loadItems}
            />

            {/* Edit item view */}
            {selectedItem && (
                <AgendaItemFormView
                    isPresented={showingEditForm}
                    onDismiss={handleFormDismiss}
                    onCancel={handleEditCancel}
                    onItemSaved={loadItems}
                    existingItem={selectedItem}
                    isEditMode={true}
                />
            )}

            {/* Item detail view */}
            {selectedItem && (
                <AgendaItemDetailView
                    item={selectedItem}
                    isPresented={showingDetailView}
                    onDismiss={handleDetailDismiss}
                    onEditRequest={handleEditRequest}
                    onItemUpdated={handleItemUpdated}
                />
            )}
        </>
    );
}

export default AgendaPanel;