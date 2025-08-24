import React, { useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import HabitCalendarGrid from '../components/HabitCalendarGrid';
import HabitActionButtons from '../components/HabitActionButtons';
import TimeRemainingIndicator from '../components/TimeRemainingIndicator';
import { fromDateOnlyString, getActiveHabitDate, getPreviousHabitDate } from "@/src/features/habits/models";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";

interface HabitDetailViewProps {
    navigation: StackNavigationProp<MainStackParamList, 'HabitDetail'>;
    route: RouteProp<MainStackParamList, 'HabitDetail'>;
}

const HabitDetailScreen: React.FC<HabitDetailViewProps> = ({
    navigation,
    route,
}) => {
    const { getColor } = useTheme();
    const { habits } = useHabitsStore();
    const [selectedTimeframe, setSelectedTimeframe] = useState<'current' | 'previous'>('current');

    const currentHabit = habits.find(habit => habit._id === route.params.habitId);
    
    if (!currentHabit) {
        return null;
    }
    
    // Handle edit request
    const handleEditRequest = () => {
        navigation.navigate('HabitForm', { habitId: currentHabit._id, isEditing: true });
    };

    const currentDate = getActiveHabitDate(currentHabit);
    const previousDate = getPreviousHabitDate(currentHabit);
    
    const handleTimeframeChange = (timeframe: 'current' | 'previous') => {
        setSelectedTimeframe(timeframe);
    };

    const sections = [
        // Habit Info Section
        {
            content: (
                <>
                    <Text className="text-on-surface text-2xl font-bold mb-2">
                        {currentHabit.name}
                    </Text>

                    {currentHabit.description && (
                        <Text className="text-on-surface-variant text-base mb-4">
                            {currentHabit.description}
                        </Text>
                    )}

                    {currentHabit.notes && (
                        <Text className="text-on-surface-variant text-base mb-4">
                            {currentHabit.notes}
                        </Text>
                    )}

                    <View className="flex-row justify-between mb-4">
                        <View>
                            <Text className="text-on-surface-variant text-xs">
                                Frequency: {currentHabit.frequency}
                            </Text>
                            <Text className="text-on-surface-variant text-xs">
                                Rollover: {currentHabit.rolloverTime}
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-primary text-xl font-bold">
                                {currentHabit.stats.completedDays}/{currentHabit.stats.totalDays - currentHabit.stats.excusedDays} Completions
                            </Text>
                        </View>
                    </View>

                    <TimeRemainingIndicator rolloverTime={currentHabit.rolloverTime} />

                    {/* Timeframe Toggle and Buttons */}
                    <View className="mt-4">
                        {/* Simple Toggle */}
                        <View className="flex-row bg-surface-variant rounded-lg p-1 mb-4">
                            <TouchableOpacity
                                className={`flex-1 py-2 px-3 rounded-md ${
                                    selectedTimeframe === 'current' ? 'bg-primary' : 'bg-transparent'
                                }`}
                                onPress={() => handleTimeframeChange('current')}
                            >
                                <Text className={`text-center text-sm font-medium ${
                                    selectedTimeframe === 'current' ? 'text-on-primary' : 'text-on-surface-variant'
                                }`}>
                                    Current
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                className={`flex-1 py-2 px-3 rounded-md ${
                                    selectedTimeframe === 'previous' ? 'bg-primary' : 'bg-transparent'
                                }`}
                                onPress={() => handleTimeframeChange('previous')}
                            >
                                <Text className={`text-center text-sm font-medium ${
                                    selectedTimeframe === 'previous' ? 'text-on-primary' : 'text-on-surface-variant'
                                }`}>
                                    Previous
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* Action Buttons for Selected Timeframe */}
                        <View>
                            <Text className="text-on-surface text-lg font-semibold mb-3">
                                {selectedTimeframe === 'current' ? 'Current Timeframe' : 'Previous Timeframe'}
                            </Text>
                            <HabitActionButtons
                                habit={currentHabit}
                                targetDate={selectedTimeframe === 'current' ? currentDate : previousDate}
                                showDateInfo={true}
                            />
                        </View>
                    </View>
                </>
            )
        },
        // Calendar Grid Section
        {
            content: (
                <HabitCalendarGrid
                    habit={currentHabit}
                    viewMode="weeks" // Default to last 52 weeks
                />
            )
        },
        // Habit Details Section
        {
            content: (
                <>
                    <Text className="text-on-surface text-lg font-semibold mb-3">
                        Details
                    </Text>
                    
                    <View className="space-y-2">
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Success Rate</Text>
                            <Text className="text-on-surface">{currentHabit.stats.completionRate == -1 ? "-" : currentHabit.stats.completionRate.toFixed(1) + "%"}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Completed</Text>
                            <Text className="text-on-surface">{currentHabit.stats.completedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Excused</Text>
                            <Text className="text-on-surface">{currentHabit.stats.excusedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Missed</Text>
                            <Text className="text-on-surface">{currentHabit.stats.missedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Created</Text>
                            <Text className="text-on-surface">
                                {fromDateOnlyString(currentHabit.firstDay).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Total Days</Text>
                            <Text className="text-on-surface">{currentHabit.stats.totalDays}</Text>
                        </View>
                    </View>
                </>
            )
        }
    ];

    return (
        <BaseDetailView
            navigation={navigation}
            route={route}
            title={currentHabit.name}
            onEditRequest={handleEditRequest}
            sections={sections}
        />
    );
};

export default HabitDetailScreen;