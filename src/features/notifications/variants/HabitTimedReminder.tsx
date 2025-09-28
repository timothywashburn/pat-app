import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import TimeSlider from '@/src/components/common/TimeSlider';
import {
    NotificationVariantType,
    NotificationSchedulerType
} from '@timothyw/pat-common';
import { NotificationVariantInformation, SchedulerFormProps, DisplayComponentProps } from "@/src/features/notifications/variants/index";

// Helper functions to convert between time strings and offsetMinutes
const timeStringToOffsetMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

const offsetMinutesToTimeString = (offsetMinutes: number): string => {
    const hours = Math.floor(offsetMinutes / 60);
    const minutes = offsetMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const HabitTimedReminderDataForm: React.FC<SchedulerFormProps> = ({
    schedulerData,
    onSchedulerDataChange
}) => {
    const { getColor } = useTheme();

    if (schedulerData.type !== NotificationSchedulerType.DAY_TIME) return null;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const updateDays = (days: number[]) => {
        onSchedulerDataChange({
            ...schedulerData,
            days
        });
    };

    const updateTime = (offsetMinutes: number) => {
        onSchedulerDataChange({
            ...schedulerData,
            offsetMinutes
        });
    };

    const toggleDay = (dayIndex: number) => {
        const currentDays = schedulerData.days || [];
        if (currentDays.includes(dayIndex)) {
            // Remove day if selected
            updateDays(currentDays.filter(d => d !== dayIndex));
        } else {
            // Add day if not selected
            updateDays([...currentDays, dayIndex].sort());
        }
    };

    const formatTimeDisplay = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <View className="space-y-4">
            <View className="mb-4">
                <Text className="text-on-surface text-sm font-medium mb-1.5">Days of Week</Text>
                <View className="flex-row flex-wrap gap-2">
                    {dayNames.map((day, index) => {
                        const isSelected = schedulerData.days?.includes(index) || false;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleDay(index)}
                                className={`px-3 py-2 rounded-md border ${
                                    isSelected 
                                        ? 'bg-primary/20 border-primary' 
                                        : 'bg-surface border-divider'
                                }`}
                            >
                                <Text className={`text-xs font-medium ${
                                    isSelected ? 'text-primary' : 'text-on-surface-variant'
                                }`}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-on-surface text-sm font-medium mb-1.5">Time</Text>
                <TimeSlider
                    offsetMinutes={schedulerData.offsetMinutes}
                    onOffsetChange={updateTime}
                />
            </View>
            
            <View className="flex-row items-center mb-4">
                <Ionicons name="time" size={16} color={getColor('primary')} />
                <Text className="text-primary text-sm font-medium ml-2">
                    {schedulerData.days?.length || 0} day{(schedulerData.days?.length || 0) !== 1 ? 's' : ''} at {formatTimeDisplay(offsetMinutesToTimeString(schedulerData.offsetMinutes))}
                </Text>
            </View>
        </View>
    );
};

export const habitTimedReminderVariant: NotificationVariantInformation = {
    type: NotificationVariantType.HABIT_TIMED_REMINDER,
    displayName: 'Timed Reminder',
    description: 'Get reminded at specific times on selected days',
    icon: 'alarm',
    defaultSchedulerData: {
        type: NotificationSchedulerType.DAY_TIME,
        days: [1, 2, 3, 4, 5], // Monday through Friday by default
        offsetMinutes: 540 // 09:00 AM (9 * 60 = 540 minutes)
    },
    defaultVariantData: {
        type: NotificationVariantType.HABIT_TIMED_REMINDER,
    },
    displayComponent: ({ schedulerData, variantData }) => {
        const formatTime = (offsetMinutes: number): string => {
            const hours = Math.floor(offsetMinutes / 60);
            const minutes = offsetMinutes % 60;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours % 12 || 12;
            return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        };

        const formatDays = (days: number[]): string => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            if (!days || days.length === 0) return 'No days selected';
            return days.map(d => dayNames[d]).join(', ');
        };

        const getTimeDisplay = () => {
            if (schedulerData.type === NotificationSchedulerType.DAY_TIME) {
                return formatTime(schedulerData.offsetMinutes);
            }
            return 'N/A';
        };

        const getDaysDisplay = () => {
            if (schedulerData.type === NotificationSchedulerType.DAY_TIME) {
                return formatDays(schedulerData.days);
            }
            return 'N/A';
        };

        return (
            <View>
                <Text className="text-on-surface font-medium text-sm mb-1">Timed Reminder</Text>
                <Text className="text-on-surface-variant text-xs mb-0.5">
                    Days: {getDaysDisplay()}
                </Text>
                <Text className="text-on-surface-variant text-xs">
                    Time: {getTimeDisplay()}
                </Text>
            </View>
        );
    },
    dataForm: HabitTimedReminderDataForm
};