import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    getTimeRemainingUntilRollover,
    formatTimeRemaining,
    getActiveHabitDate,
    isToday, isYesterday
} from '@/src/features/habits/models';
import { useTheme } from '@/src/controllers/ThemeManager';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import { HabitWithEntries } from '@timothyw/pat-common/dist/types/models/habit-data';
import { HabitEntryStatus } from "@timothyw/pat-common/src/types/models/habit-data";

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
            {(() => {
                const activeDate = getActiveHabitDate(habit);
                const currentEntry = habit.entries.find(entry => entry.date === activeDate);
                
                const getDateInfo = (date: Date) => {
                    const dateStr = date.toLocaleDateString('en-US', {
                        month: 'numeric', 
                        day: 'numeric' 
                    });
                    
                    if (isToday(date)) {
                        return { dateStr, dayLabel: 'Today', dayColorClass: 'text-primary' };
                    }
                    if (isYesterday(date)) {
                        return { dateStr, dayLabel: 'Yesterday', dayColorClass: 'text-warning' };
                    }
                    return { dateStr, dayLabel: null, dayColorClass: null };
                };
                
                const handleMarkHabit = async (status: HabitEntryStatus) => {
                    try {
                        if (currentEntry?.status === status) {
                            await habitManager.deleteHabitEntry(habit._id, activeDate);
                        } else {
                            await habitManager.markHabitEntry(habit._id, activeDate, status);
                        }
                        onHabitUpdated?.();
                    } catch (error) {
                        console.error('Failed to mark habit:', error);
                    }
                };
                
                return (
                    <View className="mt-3 pt-3 border-t border-surface-variant">
                        <View className="flex-row items-center justify-center mb-2">
                            {(() => {
                                const dateInfo = getDateInfo(activeDate);
                                return (
                                    <View className="flex-row items-center">
                                        <Text className="text-xs text-on-surface-variant">
                                            For {dateInfo.dateStr}
                                            {dateInfo.dayLabel && (
                                                <Text> (</Text>
                                            )}
                                        </Text>
                                        {dateInfo.dayLabel && (
                                            <Text className={`text-xs ${dateInfo.dayColorClass}`}>
                                                {dateInfo.dayLabel}
                                            </Text>
                                        )}
                                        {dateInfo.dayLabel && (
                                            <Text className="text-xs text-on-surface-variant">)</Text>
                                        )}
                                        {currentEntry && (
                                            <Text className="text-on-surface text-xs"> • Currently: {
                                                currentEntry.status === HabitEntryStatus.COMPLETED ? 'Completed' :
                                                currentEntry.status === HabitEntryStatus.EXCUSED ? 'Excused' : 'Missed'
                                            }</Text>
                                        )}
                                    </View>
                                );
                            })()}
                        </View>
                        
                        <View className="flex-row">
                            {/* Excuse button - moved first */}
                            <TouchableOpacity
                                className={`flex-1 rounded-md py-2 mr-2 ${
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
                            
                            {/* Complete button - moved second */}
                            <TouchableOpacity
                                className={`flex-1 rounded-md py-2 ${
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
                        </View>
                    </View>
                );
            })()}
            
        </TouchableOpacity>
    );
};

export default HabitCard;