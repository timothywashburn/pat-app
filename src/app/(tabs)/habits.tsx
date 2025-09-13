import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import { Habit, ModuleType } from "@timothyw/pat-common";
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import HabitCard from '@/src/features/habits/components/HabitCard';
import { getActiveHabitDate, toDateOnlyString } from '@/src/features/habits/models';
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { MainStackParamList } from '@/src/navigation/MainStack';

interface HabitsPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Habits'>;
    route: RouteProp<MainStackParamList, 'Habits'>;
}

export const HabitsPanel: React.FC<HabitsPanelProps> = ({
    navigation,
    route
}) => {
    const { habits, isInitialized, loadHabits, getHabitById } = useHabitsStore();
    const { refreshControl } = useRefreshControl(loadHabits, 'Failed to refresh habits');

    useEffect(() => {
        if (!isInitialized) {
            loadHabits();
        }
    }, [isInitialized, loadHabits]);
    const [showUnmarkedOnly, setShowUnmarkedOnly] = useState(false);

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

    const getFilteredHabits = (): Habit[] => {
        if (!showUnmarkedOnly) {
            return habits;
        }
        
        return habits.filter(habit => {
            const activeDate = getActiveHabitDate(habit);
            const targetDateString = toDateOnlyString(activeDate);
            const currentEntry = habit.entries.find(entry => entry.date === targetDateString);
            return currentEntry === undefined;
        });
    };

    const filteredHabits = getFilteredHabits();

    return (
        <>
            <MainViewHeader
                moduleType={ModuleType.HABITS}
                title="Habits"
                showAddButton
                onAddTapped={handleAddHabit}
                showFilterButton
                isFilterActive={showUnmarkedOnly}
                onFilterTapped={() => setShowUnmarkedOnly(!showUnmarkedOnly)}
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
                ) : filteredHabits.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-on-background text-xl font-bold mb-3">No Unmarked Habits</Text>
                        <Text className="text-on-background-variant text-center">
                            All habits have been marked for today!
                        </Text>
                    </View>
                ) : (
                    <View>
                        <Text className="text-on-background text-2xl font-bold mb-5">
                            {showUnmarkedOnly ? 'Unmarked Habits' : 'Your Habits'}
                        </Text>
                        
                        {filteredHabits.map((habit, index) => (
                            <HabitCard
                                key={habit._id}
                                habit={habit}
                                onPress={handleHabitPress}
                                onEditPress={handleEditHabit}
                                onHabitUpdated={handleHabitUpdated}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </>
    );
}

export default HabitsPanel;