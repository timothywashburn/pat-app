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
                            <View className="bg-surface-variant rounded-full h-3">
                                <View 
                                    className={`rounded-full h-3 ${timeRemaining.isOverdue ? 'bg-error' : timeRemaining.totalMinutes < 60 ? 'bg-warning' : 'bg-on-surface-variant'}`}
                                    style={{ width: `${timeRemaining.percentage}%` }}
                                />
                            </View>
                        </View>

                        {/* Stats Grid */}
                        <View className="flex-row justify-between">
                            <View className="items-center">
                                <Text className="text-primary text-xl font-bold">
                                    {habit.stats.completionRate.toFixed(1)}%
                                </Text>
                                <Text className="text-on-surface-variant text-xs">
                                    Success Rate
                                </Text>
                            </View>
                            
                            <View className="items-center">
                                <Text className="text-primary text-xl font-bold">
                                    {habit.stats.completedDays}
                                </Text>
                                <Text className="text-on-surface-variant text-xs">
                                    Completed
                                </Text>
                            </View>
                            
                            <View className="items-center">
                                <Text className="text-warning text-xl font-bold">
                                    {habit.stats.excusedDays}
                                </Text>
                                <Text className="text-on-surface-variant text-xs">
                                    Excused
                                </Text>
                            </View>
                            
                            <View className="items-center">
                                <Text className="text-error text-xl font-bold">
                                    {habit.stats.missedDays}
                                </Text>
                                <Text className="text-on-surface-variant text-xs">
                                    Missed
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Habit Details */}
                    <View className="bg-surface rounded-lg p-4 mb-4">
                        <Text className="text-on-surface text-lg font-semibold mb-3">
                            Details
                        </Text>
                        
                        <View className="space-y-2">
                            <View className="flex-row justify-between">
                                <Text className="text-on-surface-variant">Frequency</Text>
                                <Text className="text-on-surface">{habit.frequency}</Text>
                            </View>
                            
                            <View className="flex-row justify-between">
                                <Text className="text-on-surface-variant">Day Rollover</Text>
                                <Text className="text-on-surface">{habit.rolloverTime}</Text>
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

                    {/* Quick mark section */}
                    {(() => {
                        const todayDate = getTodayDate();
                        const yesterdayDate = getYesterdayDate();
                        const targetDate = selectedDay === 'today' ? todayDate : yesterdayDate;
                        const currentEntry = habit.entries.find(entry => entry.date === targetDate);
                        
                        const handleMarkHabit = async (status: HabitEntryStatus) => {
                            try {
                                // If clicking the currently selected status, deselect it (mark as missed)
                                const targetStatus = currentEntry?.status === status ? HabitEntryStatus.MISSED : status;
                                await habitManager.markHabitEntry(habit.id, targetDate, targetStatus);
                                onHabitUpdated?.();
                            } catch (error) {
                                console.error('Failed to mark habit:', error);
                            }
                        };
                        
                        return (
                            <View className="bg-surface rounded-lg p-4 mb-4">
                                <Text className="text-on-surface text-lg font-semibold mb-3">
                                    Quick Mark
                                </Text>
                                
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
                                
                                {/* Current status */}
                                {currentEntry && (
                                    <View className="flex-row items-center mb-3">
                                        <Text className="text-on-surface-variant text-sm mr-2">
                                            Current status:
                                        </Text>
                                        <View className="flex-row items-center">
                                            <View 
                                                className="w-3 h-3 rounded mr-2"
                                                style={{ 
                                                    backgroundColor: currentEntry.status === HabitEntryStatus.COMPLETED 
                                                        ? getColor('primary')
                                                        : currentEntry.status === HabitEntryStatus.EXCUSED
                                                        ? getColor('warning')
                                                        : getColor('unknown') // was surface variant
                                                }}
                                            />
                                            <Text className="text-on-surface text-sm font-medium">
                                                {currentEntry.status === HabitEntryStatus.COMPLETED && 'Completed'}
                                                {currentEntry.status === HabitEntryStatus.EXCUSED && 'Excused'}
                                                {currentEntry.status === HabitEntryStatus.MISSED && 'Missed'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                
                                {!currentEntry && (
                                    <Text className="text-on-surface-variant text-sm mb-3">
                                        No entry recorded yet
                                    </Text>
                                )}
                                
                                {/* Action buttons */}
                                <View className="flex-row">
                                    {/* Complete button */}
                                    <TouchableOpacity
                                        className={`flex-1 rounded-md py-3 mr-2 ${
                                            currentEntry?.status === HabitEntryStatus.COMPLETED 
                                                ? 'bg-primary' 
                                                : 'bg-surface-variant border border-primary'
                                        }`}
                                        onPress={() => handleMarkHabit(HabitEntryStatus.COMPLETED)}
                                    >
                                        <View className="flex-row items-center justify-center">
                                            <Ionicons
                                                name={currentEntry?.status === HabitEntryStatus.COMPLETED ? "checkmark-circle" : "checkmark-circle-outline"}
                                                size={20}
                                                color={currentEntry?.status === HabitEntryStatus.COMPLETED 
                                                    ? getColor('on-primary') 
                                                    : getColor('primary')
                                                }
                                            />
                                            <Text className={`text-sm font-medium ml-2 ${
                                                currentEntry?.status === HabitEntryStatus.COMPLETED 
                                                    ? 'text-on-primary' 
                                                    : 'text-primary'
                                            }`}>
                                                {currentEntry?.status === HabitEntryStatus.COMPLETED ? 'Completed' : 'Mark Complete'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    
                                    {/* Excuse button */}
                                    <TouchableOpacity
                                        className={`flex-1 rounded-md py-3 ${
                                            currentEntry?.status === HabitEntryStatus.EXCUSED 
                                                ? 'bg-warning' 
                                                : 'bg-surface-variant border border-warning'
                                        }`}
                                        onPress={() => handleMarkHabit(HabitEntryStatus.EXCUSED)}
                                    >
                                        <View className="flex-row items-center justify-center">
                                            <Ionicons
                                                name={currentEntry?.status === HabitEntryStatus.EXCUSED ? "remove-circle" : "remove-circle-outline"}
                                                size={20}
                                                color={currentEntry?.status === HabitEntryStatus.EXCUSED 
                                                    ? getColor('on-warning') 
                                                    : getColor('warning')
                                                }
                                            />
                                            <Text className={`text-sm font-medium ml-2 ${
                                                currentEntry?.status === HabitEntryStatus.EXCUSED 
                                                    ? 'text-on-warning' 
                                                    : 'text-warning'
                                            }`}>
                                                {currentEntry?.status === HabitEntryStatus.EXCUSED ? 'Excused' : 'Mark Excused'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })()}
                    
                    {/* Calendar Grid */}
                    <HabitCalendarGrid
                        habit={habit}
                        viewMode="weeks" // Default to last 52 weeks
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default HabitDetailView;