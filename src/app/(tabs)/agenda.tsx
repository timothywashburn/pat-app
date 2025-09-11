import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTheme } from '@/src/context/ThemeContext';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import AgendaItemCard from '@/src/features/agenda/components/AgendaItemCard';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { useAgendaStore } from "@/src/stores/useAgendaStore";
import { AgendaItemData, ModuleType, NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { TableHeader } from "@/src/features/agenda/components/TableHeader";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';

interface AgendaPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Agenda'>;
    route: RouteProp<MainStackParamList, 'Agenda'>;
}

export const AgendaPanel: React.FC<AgendaPanelProps> = ({
    navigation,
    route
}) => {
    const { getColor } = useTheme();
    const { width } = useWindowDimensions();
    const { items, isInitialized, loadItems } = useAgendaStore();
    const { refreshControl } = useRefreshControl(loadItems, 'Failed to refresh items');
    const [showCompleted, setShowCompleted] = useState(false);

    const isTableView = width >= 768;

    // Load items when component mounts
    useEffect(() => {
        if (!isInitialized) {
            loadItems();
        }
    }, [isInitialized, loadItems]);

    const handleAddItem = () => {
        navigation.navigate('AgendaItemForm', {});
    };

    const handleItemSelect = (item: AgendaItemData) => {
        navigation.navigate('AgendaItemDetail', { itemId: item._id });
    };

    const handleNotificationsPress = () => {
        navigation.navigate('NotificationInfo', {
            targetEntityType: NotificationEntityType.AGENDA_PANEL,
            targetId: "agenda_panel",
            targetLevel: NotificationTemplateLevel.ENTITY,
            entityName: "Agenda Panel"
        });
    };

    const filteredItems = items
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
            <MainViewHeader
                moduleType={ModuleType.AGENDA}
                title="Agenda"
                showNotificationsButton
                onNotificationsTapped={handleNotificationsPress}
                showAddButton
                onAddTapped={handleAddItem}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

            {!isInitialized && items.length === 0 ? (
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
                isTableView ? (
                    <FlatList
                        data={[{ key: 'content' }]}
                        renderItem={() => (
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
                        )}
                        keyExtractor={item => item.key}
                        refreshControl={refreshControl}
                    />
                ) : (
                    <FlatList
                        data={filteredItems}
                        renderItem={({ item }) => (
                            <AgendaItemCard
                                item={item}
                                onPress={handleItemSelect}
                                isTableView={false}
                            />
                        )}
                        keyExtractor={item => item._id}
                        refreshControl={refreshControl}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
                    />
                )
            )}
        </>
    );
}

export default AgendaPanel;