import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import AgendaItemFormView from '@/src/features/agenda/components/AgendaItemFormView';
import AgendaItemDetailView from '@/src/features/agenda/components/AgendaItemDetailView';
import AgendaItemCard from '@/src/features/agenda/components/AgendaItemCard';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";
import { AgendaItem } from "@/src/features/agenda/models";

export default function AgendaPanel() {
    const { getColor } = useTheme();
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);

    // State for the create/edit form
    const [showingCreateForm, setShowingCreateForm] = useState(false);
    const [showingEditForm, setShowingEditForm] = useState(false);

    // State for detail view
    const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
    const [showingDetailView, setShowingDetailView] = useState(false);

    const agendaManager = AgendaManager.getInstance();

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        if (isRefreshing) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await agendaManager.loadAgendaItems();
            setAgendaItems(agendaManager.agendaItems);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to load items');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.log('haptics not available:', error);
        }

        setErrorMessage(null);

        try {
            await agendaManager.loadAgendaItems();
            setAgendaItems(agendaManager.agendaItems);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to refresh items');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddItem = () => {
        setShowingCreateForm(true);
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
    };

    const handleFormDismiss = () => {
        setShowingCreateForm(false);
        setShowingEditForm(false);
        setSelectedItem(null);
        loadItems();
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

    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                title="Agenda"
                showAddButton
                onAddTapped={handleAddItem}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

            {errorMessage && (
                <Text className="text-unknown p-4 text-center">{errorMessage}</Text>
            )}

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
                    data={filteredItems}
                    renderItem={({ item }) => (
                        <AgendaItemCard
                            item={item}
                            onPress={handleItemSelect}
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
            )}

            {/* Create new item modal */}
            <AgendaItemFormView
                visible={showingCreateForm}
                onDismiss={handleFormDismiss}
                onItemSaved={loadItems}
            />

            {/* Edit item modal */}
            {selectedItem && (
                <AgendaItemFormView
                    visible={showingEditForm}
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
                />
            )}
        </SafeAreaView>
    );
}