import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { 
    NotificationVariantType, 
    NotificationSchedulerType 
} from '@timothyw/pat-common';
import { NotificationVariantInformation } from "@/src/features/notifications/variants/index";

export const agendaItemUpcomingDeadlineVariant: NotificationVariantInformation = {
    type: NotificationVariantType.AGENDA_ITEM_UPCOMING_DEADLINE,
    displayName: 'Upcoming Deadline',
    description: 'Get notified before an agenda item\'s deadline',
    icon: 'alarm',
    defaultSchedulerData: {
        type: NotificationSchedulerType.RELATIVE_DATE,
        offsetMinutes: -60
    },
    defaultVariantData: {
        type: NotificationVariantType.AGENDA_ITEM_UPCOMING_DEADLINE,
    },
    dataForm: ({
        schedulerData,
        onSchedulerDataChange
    }) => {
        const { getColor } = useTheme();

        if (schedulerData.type !== NotificationSchedulerType.RELATIVE_DATE) return null;

        const updateOffsetMinutes = (offsetMinutes: number) => {
            onSchedulerDataChange({
                ...schedulerData,
                offsetMinutes
            });
        };


        const formatTimeDisplay = (offsetMinutes: number): string => {
            if (offsetMinutes === 0) return 'At deadline';

            const absMinutes = Math.abs(offsetMinutes);
            const hours = Math.floor(absMinutes / 60);
            const minutes = absMinutes % 60;

            let timeStr = '';
            if (hours > 0) {
                timeStr += `${hours} hour${hours > 1 ? 's' : ''}`;
                if (minutes > 0) timeStr += ` ${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else {
                timeStr = `${minutes} minute${minutes > 1 ? 's' : ''}`;
            }

            return `${timeStr} before deadline`;
        };

        const handleTextInput = (text: string) => {
            const value = parseInt(text) || 0;
            const clampedValue = Math.max(-1440, Math.min(0, -Math.abs(value)));
            updateOffsetMinutes(clampedValue);
        };

        return (
            <View className="space-y-4">
                <View className="mb-4">
                    <Text className="text-on-surface text-sm font-medium mb-1.5">Minutes Before Deadline</Text>
                    <TextInput
                        value={Math.abs(schedulerData.offsetMinutes).toString()}
                        onChangeText={handleTextInput}
                        keyboardType="numeric"
                        placeholder="60"
                        className="border border-outline rounded-md px-3 py-2 text-sm"
                        style={{ color: getColor('on-surface') }}
                        maxLength={4}
                    />
                </View>

                <View className="flex-row items-center mb-4">
                    <Ionicons name="time" size={16} color={getColor('primary')} />
                    <Text className="text-primary text-sm font-medium ml-2">
                        {formatTimeDisplay(schedulerData.offsetMinutes)}
                    </Text>
                </View>
            </View>
        );
    }
};