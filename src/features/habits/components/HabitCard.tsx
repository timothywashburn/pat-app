import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    getTimeRemainingUntilRollover,
    formatTimeRemaining,
    getActiveHabitDate
} from '@/src/features/habits/models';
import HabitActionButtons from './HabitActionButtons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import { HabitEntryStatus } from "@timothyw/pat-common/src/types/models/habit-data";
import { fromDateString, Habit } from "@timothyw/pat-common";

interface HabitCardProps {
    habit: Habit;
    onPress: (habit: Habit) => void;
    onEditPress: (habit: Habit) => void;
    onHabitUpdated?: () => void;
    isLast?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onPress, onEditPress, onHabitUpdated, isLast }) => {
    const { getColor } = useTheme();
    const habitManager = HabitManager.getInstance();

    const formatCompletionRate = (rate: number): string => {
        return rate.toFixed(1);
    };

    const getCompletionsInfo = (): string => {
        const { completedDays, totalDays, excusedDays } = habit.stats;
        const adjustedTotal = totalDays - excusedDays;
        return `${completedDays}/${adjustedTotal} Completions`;
    };

    return (
        <TouchableOpacity
            className={`bg-surface rounded-lg p-4 ${!isLast ? 'mb-4' : ''} border border-surface-variant`}
            onPress={() => onPress(habit)}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-3">
                    <Text className="text-on-surface text-lg font-semibold mb-1">
                        {habit.name}
                    </Text>
                    
                    {habit.description && (
                        <Text className="text-on-surface-variant text-sm mb-2">
                            {habit.description}
                        </Text>
                    )}
                </View>
                
                <TouchableOpacity
                    onPress={() => onEditPress(habit)}
                    className="p-2 -m-2"
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color={getColor('on-surface-variant')}
                    />
                </TouchableOpacity>
            </View>
            
            <View className="flex-row justify-between items-center mb-3">
                <View>
                    <Text className="text-on-surface-variant text-xs">
                        Rollover: {habit.rolloverTime}
                    </Text>
                    <Text className="text-on-surface-variant text-xs">
                        Frequency: {habit.frequency}
                    </Text>
                </View>
                
                <View className="items-end">
                    <Text className="text-primary text-lg font-bold">
                        {getCompletionsInfo()}
                    </Text>
                </View>
            </View>

            {/* Time remaining indicator */}
            {(() => {
                const timeRemaining = getTimeRemainingUntilRollover(habit.rolloverTime);
                const getBarColor = () => {
                    if (timeRemaining.isOverdue) return 'bg-error';
                    if (timeRemaining.percentage >= 80) return 'bg-error';
                    return 'bg-primary';
                };
                return (
                    <View className="flex-row items-center">
                        <View className="flex-1 bg-outline-variant rounded-full h-2 mr-3">
                            <View 
                                className={`rounded-full h-2 ${getBarColor()}`}
                                style={{ width: `${timeRemaining.percentage}%` }}
                            />
                        </View>
                        <Text className={`text-xs ${timeRemaining.isOverdue ? 'text-error' : timeRemaining.totalMinutes < 60 ? 'text-warning' : 'text-on-surface-variant'}`}>
                            {formatTimeRemaining(timeRemaining)}
                        </Text>
                    </View>
                );
            })()}

            {/* Quick mark buttons */}
            <View className="mt-3 pt-3 border-t border-surface-variant">
                <HabitActionButtons
                    habit={habit}
                    targetDate={getActiveHabitDate(habit)}
                    onHabitUpdated={onHabitUpdated}
                    showDateInfo={true}
                />
            </View>
            
        </TouchableOpacity>
    );
};

export default HabitCard;