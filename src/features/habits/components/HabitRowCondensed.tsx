import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActiveHabitDate } from '@/src/features/habits/models';
import { useTheme } from '@/src/context/ThemeContext';
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import { DateOnlyString, Habit, HabitEntryStatus } from "@timothyw/pat-common";
import { isToday, isYesterday } from '@/src/features/habits/models';
import { useToast } from "@/src/components/toast/ToastContext";
import TimeRemainingIndicator from './TimeRemainingIndicator';

interface HabitRowCondensedProps {
    habit: Habit;
    onPress: (habit: Habit) => void;
    onHabitUpdated?: () => void;
    isEditMode?: boolean;
}

const HabitRowCondensed: React.FC<HabitRowCondensedProps> = ({ habit, onPress, onHabitUpdated, isEditMode }) => {
    const { errorToast } = useToast();
    const { getColor } = useTheme();
    const { markHabitEntry, deleteHabitEntry } = useHabitsStore();
    const activeDate = getActiveHabitDate(habit);

    const currentEntry = activeDate ? habit.entries.find(entry => entry.date === activeDate) : undefined;

    // Get most recent entry when habit is not active
    const mostRecentEntry = !activeDate && habit.entries.length > 0
        ? habit.entries.sort((a, b) => b.date.localeCompare(a.date))[0]
        : null;

    const getDateInfo = (dateString: DateOnlyString) => {
        const date = new Date(dateString + 'T00:00:00');
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric'
        });

        if (isToday(date)) {
            return { dateStr, dayLabel: 'Today', dayColorClass: 'text-primary' };
        }
        if (isYesterday(date)) {
            return { dateStr, dayLabel: 'Yesterday', dayColorClass: 'text-secondary' };
        }

        const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo >= 2) {
            return { dateStr, dayLabel: `${daysAgo} Days Ago`, dayColorClass: 'text-unknown' };
        }

        return { dateStr, dayLabel: null, dayColorClass: null };
    };

    const getStatusInfo = (status: HabitEntryStatus) => {
        switch (status) {
            case HabitEntryStatus.COMPLETED:
                return { label: 'Completed', colorClass: 'text-primary', icon: 'checkmark-circle' as const };
            case HabitEntryStatus.MISSED:
                return { label: 'Missed', colorClass: 'text-error', icon: 'close-circle' as const };
            case HabitEntryStatus.EXCUSED:
                return { label: 'Excused', colorClass: 'text-secondary', icon: 'remove-circle' as const };
            default:
                return { label: 'Unknown', colorClass: 'text-on-surface-variant', icon: 'help-circle' as const };
        }
    };

    const handleMarkHabit = async (status: HabitEntryStatus) => {
        if (!activeDate) return;

        try {
            if (currentEntry?.status === status) {
                await deleteHabitEntry(habit._id, activeDate);
            } else {
                await markHabitEntry(habit._id, activeDate, status);
            }
            onHabitUpdated?.();
        } catch (error) {
            if (error instanceof Error) errorToast(error.message);
            console.error('Failed to mark habit:', error);
        }
    };

    const dateInfo = activeDate ? getDateInfo(activeDate) : null;

    return (
        <>
            <View className="flex-row items-center justify-between">
                {/* Left side: Habit name and date */}
                <TouchableOpacity
                    className="flex-1 pr-3"
                    onPress={() => onPress(habit)}
                    activeOpacity={0.7}
                    disabled={isEditMode}
                >
                    <Text className="text-on-surface text-base font-medium mb-0.5">
                        {habit.name}
                    </Text>
                    {dateInfo ? (
                        // Active habit - show "For xx/xx (day)"
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
                        </View>
                    ) : mostRecentEntry ? (
                        // Inactive habit - show most recent entry status and date
                        (() => {
                            const recentDateInfo = getDateInfo(mostRecentEntry.date);
                            const statusInfo = getStatusInfo(mostRecentEntry.status);
                            return (
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name={statusInfo.icon}
                                        size={12}
                                        color={getColor(statusInfo.colorClass.replace('text-', '') as any)}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text className={`text-xs ${statusInfo.colorClass}`}>
                                        {statusInfo.label}
                                    </Text>
                                    <Text className="text-xs text-on-surface-variant">
                                        {' '}on {recentDateInfo.dateStr}
                                        {recentDateInfo.dayLabel && (
                                            <Text> (</Text>
                                        )}
                                    </Text>
                                    {recentDateInfo.dayLabel && (
                                        <Text className={`text-xs ${recentDateInfo.dayColorClass}`}>
                                            {recentDateInfo.dayLabel}
                                        </Text>
                                    )}
                                    {recentDateInfo.dayLabel && (
                                        <Text className="text-xs text-on-surface-variant">)</Text>
                                    )}
                                </View>
                            );
                        })()
                    ) : null}
                </TouchableOpacity>

                {/* Right side: Action buttons - only show if habit is active */}
                {activeDate && (
                    <View className="flex-row items-center">
                        {/* Missed button */}
                        <TouchableOpacity
                            className={`rounded-lg py-2 px-4 mr-1 ${
                                currentEntry?.status === HabitEntryStatus.MISSED
                                    ? 'bg-error'
                                    : !currentEntry ? 'bg-transparent border border-error' : 'bg-transparent border border-outline'
                            }`}
                            onPress={() => handleMarkHabit(HabitEntryStatus.MISSED)}
                        >
                            <Ionicons
                                name={currentEntry?.status === HabitEntryStatus.MISSED ? "close-circle" : "close-circle-outline"}
                                size={18}
                                color={currentEntry?.status === HabitEntryStatus.MISSED
                                    ? getColor('on-error')
                                    : !currentEntry ? getColor('error') : getColor('outline')
                                }
                            />
                        </TouchableOpacity>

                        {/* Excuse button */}
                        <TouchableOpacity
                            className={`rounded-lg py-2 px-4 mr-1 ${
                                currentEntry?.status === HabitEntryStatus.EXCUSED
                                    ? 'bg-secondary'
                                    : !currentEntry ? 'bg-transparent border border-secondary' : 'bg-transparent border border-outline'
                            }`}
                            onPress={() => handleMarkHabit(HabitEntryStatus.EXCUSED)}
                        >
                            <Ionicons
                                name={currentEntry?.status === HabitEntryStatus.EXCUSED ? "remove-circle" : "remove-circle-outline"}
                                size={18}
                                color={currentEntry?.status === HabitEntryStatus.EXCUSED
                                    ? getColor('on-secondary')
                                    : !currentEntry ? getColor('secondary') : getColor('outline')
                                }
                            />
                        </TouchableOpacity>

                        {/* Complete button */}
                        <TouchableOpacity
                            className={`rounded-lg py-2 px-4 ${
                                currentEntry?.status === HabitEntryStatus.COMPLETED
                                    ? 'bg-primary'
                                    : !currentEntry ? 'bg-transparent border border-primary' : 'bg-transparent border border-outline'
                            }`}
                            onPress={() => handleMarkHabit(HabitEntryStatus.COMPLETED)}
                        >
                            <Ionicons
                                name={currentEntry?.status === HabitEntryStatus.COMPLETED ? "checkmark-circle" : "checkmark-circle-outline"}
                                size={18}
                                color={currentEntry?.status === HabitEntryStatus.COMPLETED
                                    ? getColor('on-primary')
                                    : !currentEntry ? getColor('primary') : getColor('outline')
                                }
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Progress bar - only show if habit is active */}
            {activeDate && (
                <View className="mt-2">
                    <TimeRemainingIndicator habit={habit} />
                </View>
            )}
        </>
    );
};

export default HabitRowCondensed;
