import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { NavigationRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import { ListId, ListItemData, ListItemId, ModuleType } from "@timothyw/pat-common";
import { useListsStore } from '@/src/stores/useListsStore';
import ListCard from '@/src/features/lists/components/ListCard';
import { useToast } from "@/src/components/toast/ToastContext";
import { ListWithItems } from "@/src/features/lists/models";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { useNavStateLogger } from '@/src/hooks/useNavStateLogger';
import ListItemDetailScreen from './ListItemDetailScreen';
import ListItemFormScreen from './ListItemFormScreen';
import { CustomNavigation } from '@/src/navigation/CustomNavigation';
import { useHeaderControls } from '@/src/context/HeaderControlsContext';

interface ListsPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Lists'>;
    route: RouteProp<MainStackParamList, 'Lists'>;
}

export const ListsPanel: React.FC<ListsPanelProps> = ({
    navigation,
    route
}) => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const { getListsWithItems, isInitialized, loadAll } = useListsStore();
    const lists = getListsWithItems();
    const { isRefreshing, refreshControl } = useRefreshControl(loadAll, 'Failed to refresh lists');
    const { width } = useWindowDimensions();
    const isWideScreen = width >= 768;
    const { setHeaderControls } = useHeaderControls();

    useNavStateLogger(navigation, 'lists');

    useEffect(() => {
        if (!isInitialized) {
            loadAll();
        }
    }, [isInitialized, loadAll]);
    const [showCompleted, setShowCompleted] = useState(false);

    // Split-view state: stores screen name and params to render
    type SplitViewState = {
        screen: keyof MainStackParamList;
        params: any;
    } | null;

    const [splitViewState, setSplitViewState] = useState<SplitViewState>(null);
    const detailPanelTranslateX = useSharedValue(width);

    useFocusEffect(
        React.useCallback(() => {
            if (isRefreshing) return;

            loadAll().catch(err => {
                const errorMsg = err instanceof Error ? err.message : 'Failed to load lists';
                errorToast(errorMsg);
            });
        }, [isRefreshing])
    );

    const handleAddList = () => {
        navigation.navigate('ListForm', {});
    };

    useFocusEffect(
        useCallback(() => {
            setHeaderControls({
                showAddButton: true,
                onAddTapped: handleAddList,
                showFilterButton: true,
                isFilterActive: showCompleted,
                onFilterTapped: () => setShowCompleted(!showCompleted),
            });

            return () => {
                setHeaderControls({});
            };
        }, [showCompleted])
    );

    const handleListSelect = (list: ListWithItems) => {
        navigation.navigate('ListDetail', {
            listId: list._id
        });
    };

    const handleListItemSelect = (listItem: ListItemData) => {
        if (isWideScreen) {
            // On wide screens, show in split view with animation
            setSplitViewState({
                screen: 'ListItemDetail',
                params: {
                    listItemId: listItem._id,
                    listId: listItem.listId
                }
            });

            // Animate detail panel sliding in
            detailPanelTranslateX.value = withSpring(0, {
                damping: 20,
                stiffness: 90
            });
        } else {
            // On narrow screens, use navigation
            navigation.navigate('ListItemDetail', {
                listItemId: listItem._id,
                listId: listItem.listId
            });
        }
    };

    const closeSplitView = () => {
        detailPanelTranslateX.value = withTiming(width, {
            duration: 250
        });
        // Delay state update to allow animation to complete
        setTimeout(() => {
            setSplitViewState(null);
        }, 250);
    };

    const handleAddItemToList = (listId: ListId) => {
        navigation.navigate('ListItemForm', {
            listId
        });
    };

    // Animated style for detail panel
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: detailPanelTranslateX.value }]
    }));

    // Custom navigation for split-view mode
    const customNavigation: CustomNavigation = {
        navigate: (screen, params) => {
            // In wide screen mode, just update the split view state
            setSplitViewState({ screen, params });
        },
        goBack: () => {
            closeSplitView();
        },
        popTo: (screen, params) => {
            if (screen === 'Lists') {
                closeSplitView();
            } else {
                // If popTo is for a different screen, render it in split view
                setSplitViewState({ screen, params });
            }
        }
    };

    // Dynamically render the appropriate screen component based on screen name
    const renderSplitViewScreen = (screen: keyof MainStackParamList, params: any) => {
        switch (screen) {
            case 'ListItemDetail':
                return (
                    <ListItemDetailScreen
                        customParams={params}
                        customNavigation={customNavigation}
                    />
                );
            case 'ListItemForm':
                return (
                    <ListItemFormScreen
                        customParams={params}
                        customNavigation={customNavigation}
                    />
                );
            // Add more screens here as needed
            default:
                return null;
        }
    };

    const renderListContent = () => (
        <>
            {!isInitialized && lists.length === 0 ? (
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
        </>
    );

    return (
        <>
            <MainViewHeader
                moduleType={ModuleType.LISTS}
                title="Lists"
            />

            {isWideScreen ? (
                <View className="flex-1 flex-row">
                    {/* Main list panel - centered when no selection */}
                    <View
                        className={splitViewState ? 'items-start' : 'flex-1 items-center'}
                        style={{ flex: splitViewState ? 1 : undefined }}
                    >
                        <View
                            className="flex-1"
                            style={{
                                width: splitViewState ? '100%' : Math.min(600, width * 0.6)
                            }}
                        >
                            {renderListContent()}
                        </View>
                    </View>

                    {/* Detail/Form panel - slides in from right */}
                    {splitViewState && (
                        <Animated.View
                            className="flex-1 border-l border-divider"
                            style={animatedStyle}
                        >
                            {renderSplitViewScreen(splitViewState.screen, splitViewState.params)}
                        </Animated.View>
                    )}
                </View>
            ) : (
                renderListContent()
            )}
        </>
    );
}

export default ListsPanel;