import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitWithEntries, getTimeRemainingUntilRollover, formatTimeRemaining, getActiveHabitDate, HabitEntryStatus } from '@/src/features/habits/models';
import { useTheme } from '@/src/controllers/ThemeManager';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';

interface HabitCardProps {
    habit: HabitWithEntries;
    onPress: (habit: HabitWithEntries) => void;
    onEditPress: (habit: HabitWithEntries) => void;
    onHabitUpdated?: () => void;
    isLast?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onPress, onEditPress, onHabitUpdated, isLast }) => {
    const { getColor } = useTheme();
    const habitManager = HabitManager.getInstance();

    const formatCompletionRate = (rate: number): string => {
        return rate.toFixed(1);
    };

    const getStreakInfo = (): string => {
        // For now, just show basic stats
        const { completedDays, totalDays } = habit.stats;
        return `${completedDays}/${totalDays} days`;
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
                        {formatCompletionRate(habit.stats.completionRate)}%
                    </Text>
                    <Text className="text-on-surface-variant text-xs">
                        {getStreakInfo()}
                    </Text>
                </View>
            </View>

            {/* Time remaining indicator */}
            {(() => {
                const timeRemaining = getTimeRemainingUntilRollover(habit.rolloverTime);
                return (
                    <View className="flex-row items-center">
                        <View className="flex-1 bg-surface-variant rounded-full h-2 mr-3">
                            <View 
                                className={`rounded-full h-2 ${timeRemaining.isOverdue ? 'bg-error' : timeRemaining.totalMinutes < 60 ? 'bg-warning' : 'bg-on-surface-variant'}`}
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
            {(() => {
                const activeDate = getActiveHabitDate(habit);
                const currentEntry = habit.entries.find(entry => entry.date === activeDate);
                const today = new Date().toISOString().split('T')[0];
                const isToday = activeDate === today;
                
                const formatDateDisplay = (date: string): string => {
                    const dateObj = new Date(date + 'T00:00:00');
                    if (date === today) {
                        return 'Today';
                    }
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (date === yesterday.toISOString().split('T')[0]) {
                        return 'Yesterday';
                    }
                    return dateObj.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                };
                
                const handleMarkHabit = async (status: HabitEntryStatus) => {
                    try {
                        // If clicking the currently selected status, deselect it (mark as missed)
                        const targetStatus = currentEntry?.status === status ? HabitEntryStatus.MISSED : status;
                        await habitManager.markHabitEntry(habit.id, activeDate, targetStatus);
                        onHabitUpdated?.();
                    } catch (error) {
                        console.error('Failed to mark habit:', error);
                    }
                };
                
                return (
                    <View className="mt-3 pt-3 border-t border-surface-variant">
                        <Text className="text-on-surface-variant text-xs text-center mb-2">
                            Mark for {formatDateDisplay(activeDate)}
                            {currentEntry && (
                                <Text className="text-on-surface"> • Currently: {
                                    currentEntry.status === HabitEntryStatus.COMPLETED ? 'Completed' :
                                    currentEntry.status === HabitEntryStatus.EXCUSED ? 'Excused' : 'Missed'
                                }</Text>
                            )}
                        </Text>
                        
                        <View className="flex-row">
                            {/* Complete button */}
                            <TouchableOpacity
                                className={`flex-1 rounded-md py-2 mr-2 ${
                                    currentEntry?.status === HabitEntryStatus.COMPLETED 
                                        ? 'bg-primary' 
                                        : 'bg-surface-variant border border-primary'
                                }`}
                                onPress={() => handleMarkHabit(HabitEntryStatus.COMPLETED)}
                            >
                                <View className="flex-row items-center justify-center">
                                    <Ionicons
                                        name={currentEntry?.status === HabitEntryStatus.COMPLETED ? "checkmark-circle" : "checkmark-circle-outline"}
                                        size={16}
                                        color={currentEntry?.status === HabitEntryStatus.COMPLETED 
                                            ? getColor('on-primary') 
                                            : getColor('primary')
                                        }
                                    />
                                    <Text className={`text-sm font-medium ml-1 ${
                                        currentEntry?.status === HabitEntryStatus.COMPLETED 
                                            ? 'text-on-primary' 
                                            : 'text-primary'
                                    }`}>
                                        Complete
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            
                            {/* Excuse button */}
                            <TouchableOpacity
                                className={`flex-1 rounded-md py-2 ${
                                    currentEntry?.status === HabitEntryStatus.EXCUSED 
                                        ? 'bg-warning' 
                                        : 'bg-surface-variant border border-warning'
                                }`}
                                onPress={() => handleMarkHabit(HabitEntryStatus.EXCUSED)}
                            >
                                <View className="flex-row items-center justify-center">
                                    <Ionicons
                                        name={currentEntry?.status === HabitEntryStatus.EXCUSED ? "remove-circle" : "remove-circle-outline"}
                                        size={16}
                                        color={currentEntry?.status === HabitEntryStatus.EXCUSED 
                                            ? getColor('on-warning') 
                                            : getColor('warning')
                                        }
                                    />
                                    <Text className={`text-sm font-medium ml-1 ${
                                        currentEntry?.status === HabitEntryStatus.EXCUSED 
                                            ? 'text-on-warning' 
                                            : 'text-warning'
                                    }`}>
                                        Excuse
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })()}
            
            {/* Quick stats */}
            <View className="flex-row justify-between mt-3 pt-3 border-t border-surface-variant">
                <View className="items-center">
                    <Text className="text-primary text-sm font-semibold">
                        {habit.stats.completedDays}
                    </Text>
                    <Text className="text-on-surface-variant text-xs">
                        Completed
                    </Text>
                </View>
                
                <View className="items-center">
                    <Text className="text-warning text-sm font-semibold">
                        {habit.stats.excusedDays}
                    </Text>
                    <Text className="text-on-surface-variant text-xs">
                        Excused
                    </Text>
                </View>
                
                <View className="items-center">
                    <Text className="text-error text-sm font-semibold">
                        {habit.stats.missedDays}
                    </Text>
                    <Text className="text-on-surface-variant text-xs">
                        Missed
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default HabitCard;