import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import { HabitEntryStatus } from "@timothyw/pat-common/src/types/models/habit-data";
import { Habit } from "@timothyw/pat-common";
import { isToday, isYesterday, toDateOnlyString } from '@/src/features/habits/models';
import { useToast } from "@/src/components/toast/ToastContext";

interface HabitActionButtonsProps {
    habit: Habit;
    targetDate: Date;
    onHabitUpdated?: () => void;
    showDateInfo?: boolean;
}

const HabitActionButtons: React.FC<HabitActionButtonsProps> = ({
    habit,
    targetDate,
    onHabitUpdated,
    showDateInfo = true
}) => {
    const { errorToast } = useToast();
    const { getColor } = useTheme();
    const { markHabitEntry, deleteHabitEntry } = useHabitsStore();

    const targetDateOnlyString = toDateOnlyString(targetDate);
    const currentEntry = habit.entries.find(entry => entry.date === targetDateOnlyString);

    const getDateInfo = (date: Date) => {
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
        
        // For dates that are 2+ days ago
        const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo >= 2) {
            return { dateStr, dayLabel: `${daysAgo} Days Ago`, dayColorClass: 'text-unknown' };
        }
        
        return { dateStr, dayLabel: null, dayColorClass: null };
    };

    const handleMarkHabit = async (status: HabitEntryStatus) => {
        try {
            if (currentEntry?.status === status) {
                await deleteHabitEntry(habit._id, targetDateOnlyString);
            } else {
                await markHabitEntry(habit._id, targetDateOnlyString, status);
            }
            onHabitUpdated?.();
        } catch (error) {
            if (error instanceof Error) errorToast(error.message);
            console.error('Failed to mark habit:', error);
        }
    };

    return (
        <View>
            {showDateInfo && (
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
                            </View>
                        );
                    })()}
                </View>
            )}
            
            <View className="flex-row">
                {/* Missed button */}
                <TouchableOpacity
                    className={`flex-1 rounded-lg py-3 mr-1 ${
                        currentEntry?.status === HabitEntryStatus.MISSED 
                            ? 'bg-secondary' 
                            : !currentEntry ? 'bg-transparent border border-secondary' : 'bg-transparent border border-outline'
                    }`}
                    onPress={() => handleMarkHabit(HabitEntryStatus.MISSED)}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons
                            name={currentEntry?.status === HabitEntryStatus.MISSED ? "close-circle" : "close-circle-outline"}
                            size={16}
                            color={currentEntry?.status === HabitEntryStatus.MISSED 
                                ? getColor('on-secondary')
                                : !currentEntry ? getColor('secondary') : getColor('outline')
                            }
                        />
                        <Text className={`text-sm font-medium ml-1 ${
                            currentEntry?.status === HabitEntryStatus.MISSED 
                                ? 'text-on-secondary' 
                                : !currentEntry ? 'text-secondary' : 'text-outline'
                        }`}>
                            {currentEntry?.status === HabitEntryStatus.MISSED ? 'Missed' : 'Miss'}
                        </Text>
                    </View>
                </TouchableOpacity>
                
                {/* Excuse button */}
                <TouchableOpacity
                    className={`flex-1 rounded-lg py-3 mx-1 ${
                        currentEntry?.status === HabitEntryStatus.EXCUSED 
                            ? 'bg-warning' 
                            : !currentEntry ? 'bg-transparent border border-warning' : 'bg-transparent border border-outline'
                    }`}
                    onPress={() => handleMarkHabit(HabitEntryStatus.EXCUSED)}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons
                            name={currentEntry?.status === HabitEntryStatus.EXCUSED ? "remove-circle" : "remove-circle-outline"}
                            size={16}
                            color={currentEntry?.status === HabitEntryStatus.EXCUSED 
                                ? getColor('on-warning')
                                : !currentEntry ? getColor('warning') : getColor('outline')
                            }
                        />
                        <Text className={`text-sm font-medium ml-1 ${
                            currentEntry?.status === HabitEntryStatus.EXCUSED 
                                ? 'text-on-warning' 
                                : !currentEntry ? 'text-warning' : 'text-outline'
                        }`}>
                            {currentEntry?.status === HabitEntryStatus.EXCUSED ? 'Excused' : 'Excuse'}
                        </Text>
                    </View>
                </TouchableOpacity>
                
                {/* Complete button */}
                <TouchableOpacity
                    className={`flex-1 rounded-lg py-3 ml-1 ${
                        currentEntry?.status === HabitEntryStatus.COMPLETED 
                            ? 'bg-primary' 
                            : !currentEntry ? 'bg-transparent border border-primary' : 'bg-transparent border border-outline'
                    }`}
                    onPress={() => handleMarkHabit(HabitEntryStatus.COMPLETED)}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons
                            name={currentEntry?.status === HabitEntryStatus.COMPLETED ? "checkmark-circle" : "checkmark-circle-outline"}
                            size={16}
                            color={currentEntry?.status === HabitEntryStatus.COMPLETED 
                                ? getColor('on-primary') 
                                : !currentEntry ? getColor('primary') : getColor('outline')
                            }
                        />
                        <Text className={`text-sm font-medium ml-1 ${
                            currentEntry?.status === HabitEntryStatus.COMPLETED 
                                ? 'text-on-primary' 
                                : !currentEntry ? 'text-primary' : 'text-outline'
                        }`}>
                            {currentEntry?.status === HabitEntryStatus.COMPLETED ? 'Completed' : 'Complete'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HabitActionButtons;