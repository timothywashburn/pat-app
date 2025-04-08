import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@/src/components/CustomHeader';
import CreateAgendaItemView from '@/src/features/agenda/components/CreateAgendaItemView';
import AgendaDetailPanel from '@/src/features/agenda/components/AgendaDetailPanel';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";
import { AgendaItem } from "@/src/features/agenda/models";

export default function AgendaPanel() {
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
            console.log('Haptics not available:', error);
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
            style={styles.itemContainer}
            onPress={() => handleItemSelect(item)}
        >
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.name}</Text>

                {item.date && (
                    <Text style={styles.itemDate}>
                        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    </Text>
                )}

                {item.category && <Text style={styles.itemCategory}>{item.category}</Text>}

                {item.urgent && (
                    <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <CustomHeader
                title="Agenda"
                showAddButton
                onAddTapped={handleAddItem}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {isLoading && agendaItems.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF"/>
                </View>
            ) : filteredItems.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons
                        name="checkmark-circle"
                        size={48}
                        color="gray"
                    />
                    <Text style={styles.emptyText}>
                        {showCompleted ? 'No completed items' : 'No pending items'}
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddItem}
                    >
                        <Text style={styles.addButtonText}>Add Item</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#007AFF']} // iOS uses tintColor, Android uses colors
                            tintColor="#007AFF"
                            title="Refreshing..."
                            titleColor="#999999"
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
    },
    itemContent: {
        flexDirection: 'column',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    itemDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 4,
    },
    urgentBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    urgentText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    errorText: {
        color: 'red',
        padding: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});