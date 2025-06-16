import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import { HabitEntryStatus } from "@timothyw/pat-common/src/types/models/habit-data";
import { fromDateString, Habit } from "@timothyw/pat-common";
import { isSameDay, isToday, isYesterday } from '@/src/features/habits/models';

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
    const { getColor } = useTheme();
    const habitManager = HabitManager.getInstance();

    const currentEntry = habit.entries.find(entry => isSameDay(fromDateString(entry.date), targetDate));

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
                await habitManager.deleteHabitEntry(habit._id, targetDate);
            } else {
                await habitManager.markHabitEntry(habit._id, targetDate, status);
            }
            onHabitUpdated?.();
        } catch (error) {
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
                {/* Excuse button */}
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
                
                {/* Complete button */}
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
};

export default HabitActionButtons;