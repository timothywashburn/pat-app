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
import { HabitWithEntries, formatTimeRemaining, getTimeRemainingUntilRollover, HabitEntryStatus, getTodayDate, getYesterdayDate } from '@/src/features/habits/models';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import HabitCalendarGrid from './HabitCalendarGrid';

interface HabitDetailViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    habit: HabitWithEntries | null;
    onEditPress?: (habit: HabitWithEntries) => void;
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
    const [selectedDay, setSelectedDay] = useState<'today' | 'yesterday'>('today');
    const habitManager = HabitManager.getInstance();

    if (!isPresented || !habit) {
        return null;
    }

    const timeRemaining = getTimeRemainingUntilRollover(habit.rolloverTime);

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
                <TouchableOpacity onPress={onDismiss}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={getColor('on-surface')}
                    />
                </TouchableOpacity>

                <Text className="text-on-surface text-lg font-bold flex-1 text-center">
                    {habit.name}
                </Text>

                <TouchableOpacity onPress={() => onEditPress?.(habit)}>
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color={getColor('on-surface')}
                    />
                </TouchableOpacity>
            </View>

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

                        {/* Quick mark buttons */}
                        {(() => {
                            const todayDate = getTodayDate();
                            const yesterdayDate = getYesterdayDate();
                            const targetDate = selectedDay === 'today' ? todayDate : yesterdayDate;
                            const currentEntry = habit.entries.find(entry => entry.date === targetDate);
                            
                            const handleMarkHabit = async (status: HabitEntryStatus) => {
                                try {
                                    const targetStatus = currentEntry?.status === status ? HabitEntryStatus.MISSED : status;
                                    await habitManager.markHabitEntry(habit.id, targetDate, targetStatus);
                                    onHabitUpdated?.();
                                } catch (error) {
                                    console.error('Failed to mark habit:', error);
                                }
                            };
                            
                            const getDateInfo = (date: Date) => {
                                const dateStr = date.toLocaleDateString('en-US', {
                                    month: 'numeric', 
                                    day: 'numeric' 
                                });
                                
                                if (date.toDateString() === todayDate.toDateString()) {
                                    return { dateStr, dayLabel: 'Today', dayColorClass: 'text-primary' };
                                }
                                if (date.toDateString() === yesterdayDate.toDateString()) {
                                    return { dateStr, dayLabel: 'Yesterday', dayColorClass: 'text-warning' };
                                }
                                return { dateStr, dayLabel: null, dayColorClass: null };
                            };
                            
                            return (
                                <View className="mt-4">
                                    {/* Day toggle */}
                                    <View className="flex-row bg-surface-variant rounded-lg p-1 mb-4">
                                        <TouchableOpacity
                                            className={`flex-1 py-2 px-3 rounded-md ${
                                                selectedDay === 'today' ? 'bg-primary' : 'bg-transparent'
                                            }`}
                                            onPress={() => setSelectedDay('today')}
                                        >
                                            <Text className={`text-center text-sm font-medium ${
                                                selectedDay === 'today' ? 'text-on-primary' : 'text-on-surface-variant'
                                            }`}>
                                                Today
                                            </Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            className={`flex-1 py-2 px-3 rounded-md ${
                                                selectedDay === 'yesterday' ? 'bg-primary' : 'bg-transparent'
                                            }`}
                                            onPress={() => setSelectedDay('yesterday')}
                                        >
                                            <Text className={`text-center text-sm font-medium ${
                                                selectedDay === 'yesterday' ? 'text-on-primary' : 'text-on-surface-variant'
                                            }`}>
                                                Yesterday
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View className="flex-row items-center justify-center mb-2">
                                        {(() => {
                                            const dateInfo = getDateInfo(targetDate);
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
                                    
                                    {/* Action buttons */}
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
                                                    {currentEntry?.status === HabitEntryStatus.EXCUSED ? 'Excused' : 'Excuse'}
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
                                                    {currentEntry?.status === HabitEntryStatus.COMPLETED ? 'Completed' : 'Complete'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
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
                                    {habit.createdAt.toLocaleDateString()}
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