import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@/src/components/CustomHeader';
import { Habit, ModuleType } from "@timothyw/pat-common";
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import HabitCard from '@/src/features/habits/components/HabitCard';
import HabitFormView from '@/src/features/habits/components/HabitFormView';
import HabitDetailView from '@/src/features/habits/components/HabitDetailView';

export const HabitsPanel: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHabitForm, setShowHabitForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [showHabitDetail, setShowHabitDetail] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        try {
            setIsLoading(true);
            const manager = HabitManager.getInstance();
            await manager.loadHabits();
            setHabits(manager.habits);
        } catch (error) {
            console.error('Failed to load habits:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddHabit = () => {
        setEditingHabit(null);
        setShowHabitForm(true);
    };

    const handleEditHabit = (habit: Habit) => {
        setEditingHabit(habit);
        setShowHabitForm(true);
    };

    const handleHabitPress = (habit: Habit) => {
        setSelectedHabit(habit);
        setShowHabitDetail(true);
    };

    const handleEditHabitFromDetail = (habit: Habit) => {
        setShowHabitDetail(false);
        setEditingHabit(habit);
        setShowHabitForm(true);
    };

    const handleHabitSaved = () => {
        loadHabits(); // Reload habits after save/delete
    };

    const handleCloseForm = () => {
        setShowHabitForm(false);
        setEditingHabit(null);
    };

    const handleEditCancel = () => {
        setShowHabitForm(false);
        setShowHabitDetail(true); // Go back to detail view instead of list
    };

    const handleCloseDetail = () => {
        setShowHabitDetail(false);
        setSelectedHabit(null);
    };

    const handleHabitUpdated = async () => {
        try {
            const manager = HabitManager.getInstance();
            await manager.loadHabits();
            const updatedHabits = manager.habits;
            setHabits(updatedHabits);
            
            // If we have a selected habit, update it with fresh data
            if (selectedHabit) {
                const updatedSelectedHabit = updatedHabits.find(h => h._id === selectedHabit._id);
                if (updatedSelectedHabit) {
                    setSelectedHabit(updatedSelectedHabit);
                }
            }
        } catch (error) {
            console.error('Failed to update habits:', error);
        }
    };


    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                moduleType={ModuleType.HABITS}
                title="Habits"
                showAddButton
                onAddTapped={handleAddHabit}
            />

            <ScrollView className="flex-1 p-5">
                {isLoading ? (
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
                        <Text className="text-on-background text-2xl font-bold mb-5">Your Habits</Text>
                        
                        {habits.map((habit, index) => (
                            <HabitCard
                                key={habit._id}
                                habit={habit}
                                onPress={handleHabitPress}
                                onEditPress={handleEditHabit}
                                onHabitUpdated={handleHabitUpdated}
                                isLast={index === habits.length - 1}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            <HabitFormView
                isPresented={showHabitForm}
                onDismiss={handleCloseForm}
                onCancel={editingHabit !== null ? handleEditCancel : undefined}
                onHabitSaved={handleHabitSaved}
                existingHabit={editingHabit || undefined}
                isEditMode={editingHabit !== null}
            />

            <HabitDetailView
                isPresented={showHabitDetail}
                onDismiss={handleCloseDetail}
                habit={selectedHabit}
                onEditPress={handleEditHabitFromDetail}
                onHabitUpdated={handleHabitUpdated}
            />
        </SafeAreaView>
    );
}

export default HabitsPanel;