import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import DetailViewHeader from '@/src/components/common/DetailViewHeader';
import { formatTimeRemaining, getTimeRemainingUntilRollover, getActiveHabitDate, getPreviousHabitDate } from '@/src/features/habits/models';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import HabitCalendarGrid from './HabitCalendarGrid';
import HabitActionButtons from './HabitActionButtons';
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
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();
    const habitManager = HabitManager.getInstance();
    const [selectedTimeframe, setSelectedTimeframe] = useState<'current' | 'previous'>('current');

    if (!isPresented || !habit) {
        return null;
    }

    const timeRemaining = getTimeRemainingUntilRollover(habit.rolloverTime);

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <DetailViewHeader
                title={habit.name}
                onBack={onDismiss}
                onEdit={() => onEditPress?.(habit)}
            />

            <ScrollView className="flex-1">
                {/* Habit Info Section */}
                <View className="p-4">
                    <View className="bg-surface rounded-lg p-4 mb-4">
                        <Text className="text-on-surface text-2xl font-bold mb-2">
                            {habit.name}
                        </Text>
                        
                        {habit.description && (
                            <Text className="text-on-surface-variant text-base mb-4">
                                {habit.description}
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

                        {/* Time remaining bar */}
                        <View className="mb-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-on-surface text-sm font-medium">
                                    Time Remaining Today
                                </Text>
                                <Text className={`text-sm ${timeRemaining.isOverdue ? 'text-error' : timeRemaining.totalMinutes < 60 ? 'text-warning' : 'text-on-surface-variant'}`}>
                                    {formatTimeRemaining(timeRemaining)}
                                </Text>
                            </View>
                            <View className="bg-outline-variant rounded-full h-3">
                                <View 
                                    className={`rounded-full h-3 ${timeRemaining.isOverdue ? 'bg-error' : timeRemaining.percentage >= 80 ? 'bg-error' : 'bg-primary'}`}
                                    style={{ width: `${timeRemaining.percentage}%` }}
                                />
                            </View>
                        </View>

                        {/* Timeframe Toggle and Buttons */}
                        {(() => {
                            const currentDate = getActiveHabitDate(habit);
                            const previousDate = getPreviousHabitDate(habit);
                            
                            const handleTimeframeChange = (timeframe: 'current' | 'previous') => {
                                setSelectedTimeframe(timeframe);
                            };
                            
                            return (
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
                            );
                        })()}
                    </View>

                    
                    {/* Calendar Grid */}
                    <HabitCalendarGrid
                        habit={habit}
                        viewMode="weeks" // Default to last 52 weeks
                    />
                    
                    {/* Habit Details - moved to bottom */}
                    <View className="bg-surface rounded-lg p-4 mb-4 mt-4">
                        <Text className="text-on-surface text-lg font-semibold mb-3">
                            Details
                        </Text>
                        
                        <View className="space-y-2">
                            <View className="flex-row justify-between">
                                <Text className="text-on-surface-variant">Success Rate</Text>
                                <Text className="text-on-surface">{habit.stats.completionRate.toFixed(1)}%</Text>
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
                                    {fromDateString(habit.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            
                            <View className="flex-row justify-between">
                                <Text className="text-on-surface-variant">Total Days</Text>
                                <Text className="text-on-surface">{habit.stats.totalDays}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HabitDetailView;