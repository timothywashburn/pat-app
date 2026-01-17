import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, CompositeNavigationProp } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import WebHeader from '@/src/components/WebHeader';
import { Habit, ModuleType } from "@timothyw/pat-common";
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import HabitCard from '@/src/features/habits/components/HabitCard';
import HabitRowCondensed from '@/src/features/habits/components/HabitRowCondensed';
import { getActiveHabitDate, getTimeRemainingUntilRollover } from '@/src/features/habits/models';
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { TabNavigatorParamList } from '@/src/navigation/AppNavigator';
import { useNavStateLogger } from "@/src/hooks/useNavStateLogger";
import { DraggableList } from '@/src/components/common/DraggableList';
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';

interface HabitsPanelProps {
    navigation: CompositeNavigationProp<
        MaterialTopTabNavigationProp<TabNavigatorParamList, ModuleType.HABITS>,
        StackNavigationProp<MainStackParamList>
    >;
    route: RouteProp<TabNavigatorParamList, ModuleType.HABITS>;
}

export const HabitsPanel: React.FC<HabitsPanelProps> = ({
    navigation,
    route
}) => {
    console.log('[HabitsPanel] Component re-rendering');
    const { habits, isInitialized, loadHabits, updateHabit } = useHabitsStore();
    const { refreshControl } = useRefreshControl(loadHabits, 'Failed to refresh habits');
    const [localHabits, setLocalHabits] = useState<Habit[]>([]);

    useNavStateLogger(navigation, 'habits');

    const [showExpandedView, setShowExpandedView] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            loadHabits();
        }
    }, [isInitialized, loadHabits]);

    // Sync local habits with store
    useEffect(() => {
        // const sorted = [...habits].sort((a, b) => {
        //     const activeA = getActiveHabitDate(a);
        //     const activeB = getActiveHabitDate(b);
        //
        //     if (activeA && !activeB) return -1;
        //     if (!activeA && activeB) return 1;
        //
        //     return a.sortOrder - b.sortOrder;
        // });
        const sorted = [...habits].sort((a, b) => a.sortOrder - b.sortOrder);
        setLocalHabits(sorted);
    }, [habits]);

    const handleAddHabit = () => {
        navigation.navigate('HabitForm', {});
    };

    const handleEditHabit = (habit: Habit) => {
        navigation.navigate('HabitForm', { habitId: habit._id, isEditing: true });
    };

    const handleHabitPress = (habit: Habit) => {
        navigation.navigate('HabitDetail', { habitId: habit._id });
    };

    const handleHabitUpdated = async () => {
        try {
            await loadHabits();
        } catch (error) {
            console.error('Failed to update habits:', error);
        }
    };

    const handleReorder = (newData: (Habit & { section?: number })[]) => {
        setLocalHabits(newData as Habit[]);
    };

    const handleSaveOrder = async () => {
        try {
            const updatePromises = localHabits.map((habit, index) => {
                if (habit.sortOrder !== index) return updateHabit(habit._id, { sortOrder: index });
                return Promise.resolve();
            });

            await Promise.all(updatePromises);
            await loadHabits();
        } catch (error) {
            console.error('Failed to save habit order:', error);
        }
    };

    const handleCancelOrder = async () => {
        await loadHabits();
    };

    const headerProps = {
        showAddButton: true,
        onAddTapped: handleAddHabit,
        showFilterButton: true,
        isFilterActive: showExpandedView,
        onFilterTapped: () => setShowExpandedView(!showExpandedView),
    };

    return (
        <>
            <WebHeader {...headerProps} />
            <MainViewHeader
                moduleType={ModuleType.HABITS}
                title="Habits"
                {...headerProps}
            />

            <ScrollView
                className="flex-1 p-5"
                refreshControl={refreshControl}
            >
                {!isInitialized && habits.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-on-background-variant">Loading habits...</Text>
                    </View>
                ) : habits.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-on-background text-xl font-bold mb-3">No Habits Yet</Text>
                        <Text className="text-on-background-variant text-center">
                            Start building better habits by adding your first one!
                        </Text>
                    </View>
                ) : (
                    <View>
                        {showExpandedView ? (
                            localHabits.map((habit) => (
                                <HabitCard
                                    key={habit._id}
                                    habit={habit}
                                    onPress={handleHabitPress}
                                    onEditPress={handleEditHabit}
                                    onHabitUpdated={handleHabitUpdated}
                                />
                            ))
                        ) : localHabits.length === 0 ? null : (
                            <DraggableList
                                data={localHabits}
                                keyExtractor={(habit) => habit._id}
                                renderItem={({ item, isEditMode }) => (
                                    <HabitRowCondensed
                                        habit={item}
                                        onPress={handleHabitPress}
                                        onHabitUpdated={handleHabitUpdated}
                                        isEditMode={isEditMode}
                                    />
                                )}
                                onReorder={handleReorder}
                                onSaveChanges={handleSaveOrder}
                                onCancelChanges={handleCancelOrder}
                                reorderable={false}
                            />
                        )}
                    </View>
                )}
            </ScrollView>
        </>
    );
}

export default HabitsPanel;