import React, { useState } from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import { 
    HabitWithEntries, 
    HabitEntry, 
    HabitEntryStatus, 
    getTodayDate, 
    getYesterdayDate,
    getActiveHabitDate,
    formatTimeRemaining,
    getTimeRemainingUntilRollover
} from '@/src/features/habits/models';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';

interface DayEntryModalProps {
    isPresented: boolean;
    onDismiss: () => void;
    habit: HabitWithEntries | null;
    selectedDate?: string; // If provided, edit this specific date
    onHabitUpdated?: () => void;
}

const DayEntryModal: React.FC<DayEntryModalProps> = ({
    isPresented,
    onDismiss,
    habit,
    selectedDate,
    onHabitUpdated,
}) => {
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const habitManager = HabitManager.getInstance();

    if (!isPresented || !habit) {
        return null;
    }

    // Determine which dates are available for editing
    const todayDate = getTodayDate();
    const yesterdayDate = getYesterdayDate();
    const activeDate = getActiveHabitDate(habit); // Based on rollover time
    const timeRemaining = getTimeRemainingUntilRollover(habit.rolloverTime);

    // If a specific date was selected, use that; otherwise default to active date
    const targetDate = selectedDate || activeDate;
    
    // Get current entry for target date
    const currentEntry = habit.entries.find(entry => entry.date === targetDate);

    // Helper function to format date display
    const formatDateDisplay = (date: string): string => {
        const dateObj = new Date(date + 'T00:00:00');
        if (date === todayDate) {
            return `Today (${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
        } else if (date === yesterdayDate) {
            return `Yesterday (${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
        } else {
            return dateObj.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            });
        }
    };

    // Handle marking habit with specific status
    const handleMarkHabit = async (status: HabitEntryStatus) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await habitManager.markHabitEntry(habit.id, targetDate, status);
            onHabitUpdated?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update habit');
        } finally {
            setIsLoading(false);
        }
    };

    // Determine available actions based on date
    const isToday = targetDate === todayDate;
    const isYesterday = targetDate === yesterdayDate;
    const isFutureDate = new Date(targetDate) > new Date(todayDate);
    const canEdit = !isFutureDate; // Can't edit future dates

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
                <TouchableOpacity onPress={onDismiss} disabled={isLoading}>
                    <Ionicons
                        name="close"
                        size={24}
                        color={getColor('on-surface')}
                    />
                </TouchableOpacity>

                <Text className="text-on-surface text-lg font-bold flex-1 text-center">
                    {habit.name}
                </Text>

                <View style={{ width: 24 }} />
            </View>

            {errorMessage && (
                <View className="bg-error-container p-4">
                    <Text className="text-on-error-container text-center">{errorMessage}</Text>
                </View>
            )}

            <View className="flex-1 p-4">
                {/* Date Display */}
                <View className="bg-surface rounded-lg p-4 mb-4">
                    <Text className="text-on-surface text-lg font-semibold mb-2">
                        Mark Habit for {formatDateDisplay(targetDate)}
                    </Text>
                    
                    {isToday && (
                        <View className="flex-row items-center mb-2">
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color={timeRemaining.isOverdue ? getColor('error') : getColor('on-surface-variant')}
                            />
                            <Text className={`ml-2 text-sm ${timeRemaining.isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>
                                {formatTimeRemaining(timeRemaining)} until rollover
                            </Text>
                        </View>
                    )}

                    {/* Current Status */}
                    {currentEntry && (
                        <View className="flex-row items-center">
                            <Text className="text-on-surface-variant text-sm mr-2">Current status:</Text>
                            <View className="flex-row items-center">
                                <View 
                                    className="w-3 h-3 rounded mr-2"
                                    style={{ 
                                        backgroundColor: currentEntry.status === HabitEntryStatus.COMPLETED 
                                            ? getColor('primary')
                                            : currentEntry.status === HabitEntryStatus.EXCUSED
                                            ? getColor('warning')
                                            : getColor('surface-variant')
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
                        <Text className="text-on-surface-variant text-sm">
                            No entry recorded yet
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                {canEdit ? (
                    <View className="space-y-3">
                        {/* Mark as Done */}
                        <TouchableOpacity
                            className="bg-primary flex-row items-center justify-center rounded-lg p-4"
                            onPress={() => handleMarkHabit(HabitEntryStatus.COMPLETED)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={getColor("on-primary")} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={24}
                                        color={getColor("on-primary")}
                                    />
                                    <Text className="text-on-primary text-lg font-semibold ml-3">
                                        Mark as Completed
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Mark as Excused */}
                        <TouchableOpacity
                            className="bg-warning flex-row items-center justify-center rounded-lg p-4"
                            onPress={() => handleMarkHabit(HabitEntryStatus.EXCUSED)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={getColor("on-warning")} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="remove-circle"
                                        size={24}
                                        color={getColor("on-warning")}
                                    />
                                    <Text className="text-on-warning text-lg font-semibold ml-3">
                                        Mark as Excused
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Mark as Missed (only if currently completed or excused) */}
                        {currentEntry && currentEntry.status !== HabitEntryStatus.MISSED && (
                            <TouchableOpacity
                                className="bg-error flex-row items-center justify-center rounded-lg p-4"
                                onPress={() => handleMarkHabit(HabitEntryStatus.MISSED)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={getColor("on-error")} />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="close-circle"
                                            size={24}
                                            color={getColor("on-error")}
                                        />
                                        <Text className="text-on-error text-lg font-semibold ml-3">
                                            Mark as Missed
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Quick select today/yesterday if editing specific date */}
                        {selectedDate && selectedDate !== activeDate && (
                            <View className="mt-6 pt-4 border-t border-surface-variant">
                                <Text className="text-on-surface text-base font-medium mb-3">
                                    Or mark for:
                                </Text>
                                
                                <TouchableOpacity
                                    className="bg-surface border border-outline rounded-lg p-3"
                                    onPress={() => {
                                        // Close this modal and reopen for active date
                                        onDismiss();
                                        // This would trigger reopening with activeDate
                                        // Implementation depends on parent component
                                    }}
                                >
                                    <Text className="text-on-surface text-center">
                                        {formatDateDisplay(activeDate)} (Active Date)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="bg-surface-variant rounded-lg p-4">
                        <Text className="text-on-surface-variant text-center">
                            Can't edit future dates
                        </Text>
                    </View>
                )}

                {/* Helper Text */}
                <View className="mt-6 p-4 bg-surface-variant rounded-lg">
                    <Text className="text-on-surface-variant text-sm">
                        💡 Tip: Your habit day resets at {habit.rolloverTime} based on your preferences.
                        {isYesterday && " You can still mark yesterday's habit if you completed it late!"}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default DayEntryModal;