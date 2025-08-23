import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/src/context/ThemeContext';
import CustomHeader from '@/src/components/CustomHeader';
import AgendaItemCard from '@/src/features/agenda/components/AgendaItemCard';
import { AgendaStackParamList } from '@/src/navigation/AgendaStack';
import { useAgendaStore } from "@/src/stores/useAgendaStore";
import { AgendaItemData, ModuleType, NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { TableHeader } from "@/src/features/agenda/components/TableHeader";
import { NotificationConfigView } from '@/src/features/notifications/components/NotificationConfigView';
import { useRefreshControl } from '@/src/hooks/useRefreshControl';

type AgendaNavigationProp = StackNavigationProp<AgendaStackParamList, 'AgendaList'>;

export const AgendaPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { width } = useWindowDimensions();
    const navigation = useNavigation<AgendaNavigationProp>();
    const { items: agendaItems, isInitialized, loadItems, createItem, updateItem, deleteItem, setCompleted } = useAgendaStore();
    const { refreshControl } = useRefreshControl(loadItems, 'Failed to refresh items');
    const [showCompleted, setShowCompleted] = useState(false);

    // State for notifications
    const [showingNotifications, setShowingNotifications] = useState(false);

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
        navigation.navigate('AgendaItemDetail', { agendaItem: item });
    };

    const handleNotificationsPress = () => {
        setShowingNotifications(true);
    };

    const handleNotificationsDismiss = () => {
        setShowingNotifications(false);
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
                showNotificationsButton
                onNotificationsTapped={handleNotificationsPress}
                showAddButton
                onAddTapped={handleAddItem}
                showFilterButton
                isFilterActive={showCompleted}
                onFilterTapped={() => setShowCompleted(!showCompleted)}
            />

            {!isInitialized && agendaItems.length === 0 ? (
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

            {/* Panel notifications view */}
            {showingNotifications && (
                <NotificationConfigView
                    targetEntityType={NotificationEntityType.AGENDA_PANEL}
                    targetId="agenda_panel"
                    targetLevel={NotificationTemplateLevel.PARENT}
                    entityName="Agenda Panel"
                    onClose={handleNotificationsDismiss}
                />
            )}
        </>
    );
}

export default AgendaPanel;