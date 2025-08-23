import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Habit } from '@timothyw/pat-common';
import HabitsPanel from '@/src/app/(tabs)/habits';
import HabitDetailScreen from '@/src/features/habits/screens/HabitDetailScreen';
import HabitFormScreen from '@/src/features/habits/screens/HabitFormScreen';

export type HabitsStackParamList = {
    HabitsList: undefined;
    HabitDetail: {
        habit: Habit
    };
    HabitForm: {
        habit?: Habit;
        isEditing?: boolean
    };
};

const Stack = createStackNavigator<HabitsStackParamList>();

export default function HabitsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We'll handle headers ourselves
            }}
        >
            <Stack.Screen name="HabitsList" component={HabitsPanel} />
            <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
            <Stack.Screen name="HabitForm" component={HabitFormScreen} />
        </Stack.Navigator>
    );
}