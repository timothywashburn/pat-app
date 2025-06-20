import React, { useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import {
    getActiveHabitDate,
    getPreviousHabitDate,
    fromDateOnlyString
} from '@/src/features/habits/models';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import HabitCalendarGrid from './HabitCalendarGrid';
import HabitActionButtons from './HabitActionButtons';
import TimeRemainingIndicator from './TimeRemainingIndicator';
import { fromDateString, Habit } from "@timothyw/pat-common";
import { HabitEntryStatus } from "@timothyw/pat-common/src/types/models/habit-data";

interface HabitDetailViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    habit: Habit | null;
    onEditPress?: (habit: Habit) => void;
    onHabitUpdated?: () => void;
}

const HabitDetailView: React.FC<HabitDetailViewProps> = ({
    isPresented,
    onDismiss,
    habit,
    onEditPress,
    onHabitUpdated,
}) => {
    const { getColor } = useTheme();
    const habitManager = HabitManager.getInstance();
    const [selectedTimeframe, setSelectedTimeframe] = useState<'current' | 'previous'>('current');

    if (!isPresented || !habit) {
        return null;
    }


    const currentDate = getActiveHabitDate(habit);
    const previousDate = getPreviousHabitDate(habit);
    
    const handleTimeframeChange = (timeframe: 'current' | 'previous') => {
        setSelectedTimeframe(timeframe);
    };

    const sections = [
        // Habit Info Section
        {
            content: (
                <>
                    <Text className="text-on-surface text-2xl font-bold mb-2">
                        {habit.name}
                    </Text>

                    {habit.description && (
                        <Text className="text-on-surface-variant text-base mb-4">
                            {habit.description}
                        </Text>
                    )}

                    {habit.notes && (
                        <Text className="text-on-surface-variant text-base mb-4">
                            {habit.notes}
                        </Text>
                    )}

                    <View className="flex-row justify-between mb-4">
                        <View>
                            <Text className="text-on-surface-variant text-xs">
                                Frequency: {habit.frequency}
                            </Text>
                            <Text className="text-on-surface-variant text-xs">
                                Rollover: {habit.rolloverTime}
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-primary text-xl font-bold">
                                {habit.stats.completedDays}/{habit.stats.totalDays - habit.stats.excusedDays} Completions
                            </Text>
                        </View>
                    </View>

                    <TimeRemainingIndicator rolloverTime={habit.rolloverTime} />

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
                                habit={habit}
                                targetDate={selectedTimeframe === 'current' ? currentDate : previousDate}
                                onHabitUpdated={onHabitUpdated}
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
                    habit={habit}
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
                            <Text className="text-on-surface">{habit.stats.completionRate == -1 ? "-" : habit.stats.completionRate.toFixed(1) + "%"}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Completed</Text>
                            <Text className="text-on-surface">{habit.stats.completedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Excused</Text>
                            <Text className="text-on-surface">{habit.stats.excusedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Missed</Text>
                            <Text className="text-on-surface">{habit.stats.missedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Created</Text>
                            <Text className="text-on-surface">
                                {fromDateOnlyString(habit.firstDay).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Total Days</Text>
                            <Text className="text-on-surface">{habit.stats.totalDays}</Text>
                        </View>
                    </View>
                </>
            )
        }
    ];

    return (
        <BaseDetailView
            isPresented={isPresented}
            onDismiss={onDismiss}
            title={habit.name}
            onEditRequest={() => onEditPress?.(habit)}
            showEdit={!!onEditPress}
            sections={sections}
        />
    );
};

export default HabitDetailView;