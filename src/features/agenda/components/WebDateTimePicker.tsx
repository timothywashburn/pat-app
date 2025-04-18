import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme/ThemeManager';

interface WebDateTimePickerProps {
    date: Date | undefined;
    onDateChange: (date: Date) => void;
    onDismiss: () => void;
}

const WebDateTimePicker: React.FC<WebDateTimePickerProps> = ({
    date,
    onDateChange,
    onDismiss
}) => {
    const { getColor } = useTheme();
    const currentDate = date || new Date();

    // Format date string for web input
    const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    // Format time string for web input
    const formatTimeForInput = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    // Handle web date input changes
    const handleWebDateChange = (e: any) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            // Preserve the time from the existing date
            newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
            onDateChange(newDate);
        }
    };

    // Handle web time input changes
    const handleWebTimeChange = (e: any) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newDate = new Date(currentDate);
        newDate.setHours(hours, minutes);
        onDateChange(newDate);
    };

    return (
        <View className="bg-surface rounded-lg p-4 w-5/6 max-w-md">
            <Text className="text-on-background text-lg font-medium mb-4 text-center">Select Date & Time</Text>

            {/* Date and Time inputs side by side */}
            <View className="flex-row justify-between mb-4">
                <View className="flex-1 mr-2">
                    <Text className="text-on-background text-base font-medium mb-2">Date</Text>
                    <input
                        type="date"
                        value={formatDateForInput(currentDate)}
                        onChange={handleWebDateChange}
                        className="w-full p-3 border border-outline rounded-lg"
                        style={{ color: getColor("on-surface") }}
                    />
                </View>

                <View className="flex-1 ml-2">
                    <Text className="text-on-background text-base font-medium mb-2">Time</Text>
                    <input
                        type="time"
                        value={formatTimeForInput(currentDate)}
                        onChange={handleWebTimeChange}
                        className="w-full p-3 border border-outline rounded-lg"
                        style={{ color: getColor("on-surface") }}
                    />
                </View>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                    onPress={onDismiss}
                    className="bg-error rounded-lg px-4 py-2"
                >
                    <Text className="text-white">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onDismiss}
                    className="bg-primary rounded-lg px-4 py-2"
                >
                    <Text className="text-white">Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WebDateTimePicker;