import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import AgendaItemFormView from '@/src/features/agenda/components/AgendaItemFormView';
import AgendaItemDetailView from '@/src/features/agenda/components/AgendaItemDetailView';
import AgendaItemCard from '@/src/features/agenda/components/AgendaItemCard';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";
import { AgendaItem } from "@/src/features/agenda/models";
import { useToast } from "@/src/components/toast/ToastContext";
import { ModuleType } from "@timothyw/pat-common";
import { TableHeader } from "@/src/features/agenda/components/TableHeader";

export const AgendaPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const { width } = useWindowDimensions();
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    // State for the create/edit form
    const [showingCreateForm, setShowingCreateForm] = useState(false);
    const [showingEditForm, setShowingEditForm] = useState(false);

    // State for detail view
    const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
    const [showingDetailView, setShowingDetailView] = useState(false);
    const [editFromDetailView, setEditFromDetailView] = useState(false);

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
        setEditFromDetailView(false);
    };

    const handleItemSelect = (item: AgendaItem) => {
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
        setEditFromDetailView(true);
    };

    const handleFormDismiss = () => {
        setShowingCreateForm(false);
        setShowingEditForm(false);
        
        if (editFromDetailView) {
            // Return to detail view if edit was opened from detail
            setEditFromDetailView(false);
            setShowingDetailView(true);
        } else {
            // Clear selected item and return to list if this was a create form
            setSelectedItem(null);
        }
        
        loadItems();
    };

    const handleItemUpdated = () => {
        loadItems();
        handleDetailDismiss();
    };

    const filteredItems = agendaItems
        .filter(item => item.completed === showCompleted)
        .sort((a, b) => {
            if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
            if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (a.date) return -1;
            if (b.date) return 1;
            return 0;
        });

    const renderTableContent = () => (
        <View className="bg-surface rounded-xl overflow-hidden">
            <TableHeader />
            <FlatList
                data={filteredItems}
                renderItem={({ item }) => (
                    <AgendaItemCard
                        item={item}
                        onPress={handleItemSelect}
                        isTableView={true}
                    />
                )}
                keyExtractor={item => item.id}
                scrollEnabled={false}
            />
        </View>
    );

    const renderCardContent = () => (
        <FlatList
            data={filteredItems}
            renderItem={({ item }) => (
                <AgendaItemCard
                    item={item}
                    onPress={handleItemSelect}
                    isTableView={false}
                />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[getColor("primary")]}
                    tintColor={getColor("primary")}
                />
            }
        />
    );

    return (
        <SafeAreaView className="bg-background flex-1">
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
                <View className={isTableView ? "p-6" : ""}>
                    {isTableView ? (
                        <FlatList
                            data={[filteredItems]} // Wrap in array to render single item
                            renderItem={() => renderTableContent()}
                            keyExtractor={() => "table"}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefreshing}
                                    onRefresh={handleRefresh}
                                    colors={[getColor("primary")]}
                                    tintColor={getColor("primary")}
                                />
                            }
                        />
                    ) : (
                        renderCardContent()
                    )}
                </View>
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
        </SafeAreaView>
    );
}

export default AgendaPanel;