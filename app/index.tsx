import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '../components/CustomHeader';
import { AgendaManager } from '../managers';
import { AgendaItem } from '../models';
import {Ionicons} from "@expo/vector-icons";

export default function AgendaPanel() {
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const showHamburgerMenu = useRef(false);

    // Initialize manager
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
            await agendaManager.loadAgendaItems();
            setAgendaItems(agendaManager.agendaItems);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to refresh items');
        } finally {
            setIsRefreshing(false);
        }
    };

    const filteredItems = agendaItems
        .filter(item => item.completed === showCompleted)
        .sort((a, b) => {
            // Sort by urgency first
            if (a.urgent !== b.urgent) {
                return a.urgent ? -1 : 1;
            }

            // Then sort by date
            if (a.date && b.date) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }

            if (a.date) return -1;
            if (b.date) return 1;

            return 0;
        });

    const renderItem = ({ item }: { item: AgendaItem }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                // Handle item tap (show detail panel)
                console.log('Item tapped:', item.id);
            }}
        >
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.name}</Text>

                {item.date && (
                    <Text style={styles.itemDate}>
                        {new Date(item.date).toLocaleDateString()}
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
        <View style={styles.container}>
            <StatusBar style="auto" />

            <CustomHeader
                title="Agenda"
                showAddButton
                onAddTapped={() => {
                    // Handle add button tap
                    console.log('Add button tapped');
                }}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
                showHamburgerMenu={showHamburgerMenu}
            />

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {isLoading && agendaItems.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
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
                        />
                    }
                />
            )}
        </View>
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
        marginTop: 12,
    },
});