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
                
                const interpolateColor = (color1: string, color2: string, factor: number): string => {
                    const hex1 = color1.replace('#', '');
                    const hex2 = color2.replace('#', '');
                    
                    const r1 = parseInt(hex1.substr(0, 2), 16);
                    const g1 = parseInt(hex1.substr(2, 2), 16);
                    const b1 = parseInt(hex1.substr(4, 2), 16);
                    
                    const r2 = parseInt(hex2.substr(0, 2), 16);
                    const g2 = parseInt(hex2.substr(2, 2), 16);
                    const b2 = parseInt(hex2.substr(4, 2), 16);
                    
                    const r = Math.round(r1 + (r2 - r1) * factor);
                    const g = Math.round(g1 + (g2 - g1) * factor);
                    const b = Math.round(b1 + (b2 - b1) * factor);
                    
                    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                };
                
                const getBarStyle = () => {
                    const percentage = timeRemaining.percentage;
                    const primaryColor = getColor('primary');
                    const errorColor = getColor('error');
                    
                    if (timeRemaining.isOverdue || percentage >= 80) {
                        return { backgroundColor: errorColor };
                    } else if (percentage <= 70) {
                        return { backgroundColor: primaryColor };
                    } else {
                        const gradientFactor = (percentage - 70) / 10;
                        const blendedColor = interpolateColor(primaryColor, errorColor, gradientFactor);
                        return { backgroundColor: blendedColor };
                    }
                };
                
                return (
                    <View className="flex-row items-center">
                        <View className="flex-1 bg-outline-variant rounded-full h-2 mr-3">
                            <View 
                                className="rounded-full h-2"
                                style={{ 
                                    width: `${timeRemaining.percentage}%`,
                                    ...getBarStyle()
                                }}
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