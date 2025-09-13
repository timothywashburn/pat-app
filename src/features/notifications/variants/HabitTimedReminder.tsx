import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { 
    NotificationVariantType, 
    NotificationSchedulerType 
} from '@timothyw/pat-common';
import { NotificationVariantInformation, SchedulerFormProps } from "@/src/features/notifications/variants/index";

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

    const updateTime = (time: string) => {
        // Validate time format (HH:mm)
        if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            onSchedulerDataChange({
                ...schedulerData,
                time
            });
        }
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
                <TextInput
                    value={schedulerData.time}
                    onChangeText={updateTime}
                    placeholder="09:00"
                    className="bg-surface border border-divider rounded-md px-3 py-2 text-sm"
                    style={{ color: getColor('on-surface') }}
                    maxLength={5}
                />
            </View>
            
            <View className="flex-row items-center mb-4">
                <Ionicons name="time" size={16} color={getColor('primary')} />
                <Text className="text-primary text-sm font-medium ml-2">
                    {schedulerData.days?.length || 0} day{(schedulerData.days?.length || 0) !== 1 ? 's' : ''} at {formatTimeDisplay(schedulerData.time)}
                </Text>
            </View>

            <View className="bg-primary-container/20 p-3 rounded-md">
                <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={16} color={getColor('primary')} className="mt-0.5 mr-2" />
                    <Text className="text-on-primary-container text-xs flex-1">
                        Timed reminders will notify you on selected days at the specified time, 
                        regardless of habit completion status.
                    </Text>
                </View>
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
        time: '09:00'
    },
    defaultVariantData: {
        type: NotificationVariantType.HABIT_TIMED_REMINDER,
    },
    dataForm: HabitTimedReminderDataForm
};