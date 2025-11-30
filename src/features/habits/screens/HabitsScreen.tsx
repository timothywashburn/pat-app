import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import { Habit, ModuleType } from "@timothyw/pat-common";
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import HabitCard from '@/src/features/habits/components/HabitCard';
import HabitRowCondensed from '@/src/features/habits/components/HabitRowCondensed';
import { getActiveHabitDate, getTimeRemainingUntilRollover } from '@/src/features/habits/models';
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { useNavStateLogger } from "@/src/hooks/useNavStateLogger";
import { useHeaderControls } from '@/src/context/HeaderControlsContext';

interface HabitsPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Habits'>;
    route: RouteProp<MainStackParamList, 'Habits'>;
}

export const HabitsPanel: React.FC<HabitsPanelProps> = ({
    navigation,
    route
}) => {
    const { habits, isInitialized, loadHabits } = useHabitsStore();
    const { refreshControl } = useRefreshControl(loadHabits, 'Failed to refresh habits');
    const { setHeaderControls } = useHeaderControls();

    useNavStateLogger(navigation, 'habits');

    useEffect(() => {
        if (!isInitialized) {
            loadHabits();
        }
    }, [isInitialized, loadHabits]);
    const [showExpandedView, setShowExpandedView] = useState(false);

    const handleAddHabit = () => {
        navigation.navigate('HabitForm', {});
    };

    useFocusEffect(
        useCallback(() => {
            setHeaderControls({
                showAddButton: true,
                onAddTapped: handleAddHabit,
                showFilterButton: true,
                isFilterActive: showExpandedView,
                onFilterTapped: () => setShowExpandedView(!showExpandedView),
            });

            return () => {
                setHeaderControls({});
            };
        }, [showExpandedView])
    );

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

    const getSortedHabits = (): Habit[] => {
        return habits.sort((a, b) => {
            const activeA = getActiveHabitDate(a);
            const activeB = getActiveHabitDate(b);

            if (activeA && !activeB) return -1;
            if (!activeA && activeB) return 1;

            return a.sortOrder - b.sortOrder;
        });
    };

    const sortedHabits = getSortedHabits();

    return (
        <>
            <MainViewHeader
                moduleType={ModuleType.HABITS}
                title="Habits"
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
                            sortedHabits.map((habit) => (
                                <HabitCard
                                    key={habit._id}
                                    habit={habit}
                                    onPress={handleHabitPress}
                                    onEditPress={handleEditHabit}
                                    onHabitUpdated={handleHabitUpdated}
                                />
                            ))
                        ) : (
                            sortedHabits.map((habit) => (
                                <HabitRowCondensed
                                    key={habit._id}
                                    habit={habit}
                                    onPress={handleHabitPress}
                                    onHabitUpdated={handleHabitUpdated}
                                />
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </>
    );
}

export default HabitsPanel;