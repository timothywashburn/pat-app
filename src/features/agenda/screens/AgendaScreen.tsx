import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTheme } from '@/src/context/ThemeContext';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import AgendaItemCard from '@/src/features/agenda/components/AgendaItemCard';
import { MainStackParamList, splitScreenConfigs } from '@/src/navigation/MainStack';
import { useAgendaStore } from "@/src/stores/useAgendaStore";
import { useSplitView } from '@/src/hooks/useSplitView';
import { SplitViewLayout } from '@/src/components/layout/SplitViewLayout';
import {
    AgendaItemData,
    ItemId,
    ModuleType,
    NotificationEntityType,
    NotificationTemplateLevel
} from "@timothyw/pat-common";
import { TableHeader } from "@/src/features/agenda/components/TableHeader";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import AgendaFilterDropdown, { FilterType } from "@/src/features/agenda/components/AgendaFilterDropdown";
import { useNavigationStore } from "@/src/stores/useNavigationStore";
import { useLocalSearchParams } from "expo-router";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useNavStateLogger } from "@/src/hooks/useNavStateLogger";
import { useHeaderControls } from '@/src/context/HeaderControlsContext';

interface AgendaPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Agenda'>;
    route: RouteProp<MainStackParamList, 'Agenda'>;
}

export const AgendaPanel: React.FC<AgendaPanelProps> = ({
    navigation,
    route
}) => {
    const params = useLocalSearchParams();

    if (params.itemId) {
        console.log('Navigating to item detail for ID:', params.itemId);
        navigation.navigate('AgendaItemDetail', {
            itemId: params.itemId as ItemId
        });
    }

    const { getColor } = useTheme();
    const { width } = useWindowDimensions();
    const { items, isInitialized, loadItems } = useAgendaStore();
    const { data } = useUserDataStore();
    const { refreshControl } = useRefreshControl(loadItems, 'Failed to refresh items');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('incomplete');
    const { setHeaderControls } = useHeaderControls();
    const splitView = useSplitView('Agenda');

    useNavStateLogger(navigation, 'agenda');

    const isTableView = width >= 768;

    useEffect(() => {
        if (!isInitialized) {
            loadItems();
        }
    }, [isInitialized, loadItems]);

    const handleAddItem = () => {
        if (splitView.isWideScreen) {
            splitView.openSplitView('AgendaItemForm', {});
        } else {
            navigation.navigate('AgendaItemForm', {});
        }
    };

    useFocusEffect(
        useCallback(() => {
            setHeaderControls({
                showAddButton: true,
                onAddTapped: handleAddItem,
                customFilter: () => (
                    <AgendaFilterDropdown
                        selectedFilter={selectedFilter}
                        categories={data.config.agenda.itemCategories}
                        onFilterChange={setSelectedFilter}
                    />
                ),
            });

            return () => {
                setHeaderControls({});
            };
        }, [selectedFilter, data.config.agenda.itemCategories])
    );

    const handleItemSelect = (item: AgendaItemData) => {
        if (splitView.isWideScreen) {
            splitView.openSplitView('AgendaItemDetail', { itemId: item._id });
        } else {
            navigation.navigate('AgendaItemDetail', { itemId: item._id });
        }
    };

    const filteredItems = items
        .filter(item => {
            switch (selectedFilter) {
                case 'incomplete':
                    return !item.completed;
                case 'complete':
                    return item.completed;
                default:
                    return !item.completed && item.category === selectedFilter;
            }
        })
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
                hideOnWeb
            />

            <SplitViewLayout
                splitView={splitView}
                splitScreenConfig={splitScreenConfigs.Agenda}
                mainContentFlex={3}
                detailPanelFlex={1}
                mainContent={(
                    <>
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
                                    {selectedFilter === 'complete' ? 'No completed items' :
                                        selectedFilter === 'incomplete' ? 'No incomplete items' :
                                            `No incomplete items in ${selectedFilter}`}
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
                                                <View className="border-b-2 border-background" />
                                                {filteredItems.map((item, index) => (
                                                    <>
                                                        <AgendaItemCard
                                                            key={item._id}
                                                            item={item}
                                                            onPress={handleItemSelect}
                                                            isTableView={true}
                                                        />
                                                        {index < filteredItems.length - 1 && (
                                                            <View className="border-b-[1.5px] border-background" />
                                                        )}
                                                    </>
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
                )}
            />
        </>
    );
}

export default AgendaPanel;