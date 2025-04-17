import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import CreateAgendaItemView from '@/src/features/agenda/components/CreateAgendaItemView';
import AgendaDetailPanel from '@/src/features/agenda/components/AgendaDetailPanel';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";
import { AgendaItem } from "@/src/features/agenda/models";

export default function AgendaPanel() {
    const { getColor } = useTheme();
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showingCreateSheet, setShowingCreateSheet] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
    const [showingDetail, setShowingDetail] = useState(false);

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
        setShowingCreateSheet(true);
    };

    const handleItemSelect = (item: AgendaItem) => {
        setSelectedItem(item);
        setShowingDetail(true);
    };

    const handleDetailDismiss = () => {
        setShowingDetail(false);
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

    const renderItem = ({item}: { item: AgendaItem }) => (
        <TouchableOpacity
            className="bg-surface rounded-lg p-4 mb-3"
            onPress={() => handleItemSelect(item)}
        >
            <View className="flex-col">
                <Text className="text-on-surface text-base font-semibold mb-2">{item.name}</Text>

                {item.date && (
                    <Text className="text-secondary text-sm mb-1">
                        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    </Text>
                )}

                {item.category && <Text className="text-primary text-sm mb-1">{item.category}</Text>}

                {item.urgent && (
                    <View className="bg-error px-2 py-0.5 rounded self-start">
                        <Text className="text-on-error text-xs font-semibold">Urgent</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
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
                    <Text className="text-base text-secondary mb-5">
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
                    renderItem={renderItem}
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
            <CreateAgendaItemView
                visible={showingCreateSheet}
                onDismiss={() => setShowingCreateSheet(false)}
                onItemCreated={loadItems}
            />

            {/* Item detail panel */}
            {selectedItem && (
                <AgendaDetailPanel
                    item={selectedItem}
                    isPresented={showingDetail}
                    onDismiss={handleDetailDismiss}
                />
            )}
        </SafeAreaView>
    );
}