import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import WebDatePicker from './WebDatePicker';
import WebTimePicker from './WebTimePicker';

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
    const currentDate = date || new Date();
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const { width } = useWindowDimensions();

    const useHorizontalLayout = width >= 640;

    const handleDateSelected = (newDate: Date) => {
        const updatedDate = new Date(selectedDate);
        updatedDate.setFullYear(newDate.getFullYear());
        updatedDate.setMonth(newDate.getMonth());
        updatedDate.setDate(newDate.getDate());
        setSelectedDate(updatedDate);
    };

    const handleTimeSelected = (newDate: Date) => {
        const updatedDate = new Date(selectedDate);
        updatedDate.setHours(newDate.getHours());
        updatedDate.setMinutes(newDate.getMinutes());
        updatedDate.setSeconds(newDate.getSeconds());
        setSelectedDate(updatedDate);
    };

    const handleDone = () => {
        onDateChange(selectedDate);
        onDismiss();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <View className={`bg-surface rounded-lg ${useHorizontalLayout ? 'w-auto' : 'w-80'} max-w-full`}>
            {/* Header */}
            <View className="bg-primary-container p-4 rounded-t-lg">
                <Text className="text-on-primary-container text-center text-lg font-medium">
                    {formatDate(selectedDate)}
                </Text>
                <Text className="text-on-primary-container text-center text-xl font-bold">
                    {formatTime(selectedDate)}
                </Text>
            </View>

            {/* Main content */}
            <View className={`flex ${useHorizontalLayout ? 'flex-row' : 'flex-col'}`}>
                <View className={`${useHorizontalLayout ? 'border-r' : 'border-b'} border-outline`}>
                    <Text className="font-medium text-on-background-variant px-4 pt-3 pb-1">Date</Text>
                    <WebDatePicker selectedDate={selectedDate} onDateSelected={handleDateSelected} />
                </View>

                <View>
                    <Text className="font-medium text-on-background-variant px-4 pt-3 pb-1">Time</Text>
                    <WebTimePicker selectedDate={selectedDate} onTimeSelected={handleTimeSelected} />
                </View>
            </View>

            {/* Footer buttons */}
            <View className="flex-row justify-end p-4 border-t border-outline">
                <TouchableOpacity
                    onPress={onDismiss}
                    className="bg-surface border border-outline rounded-lg px-4 py-2 mr-2"
                >
                    <Text className="text-on-background">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDone}
                    className="bg-primary rounded-lg px-4 py-2"
                >
                    <Text className="text-on-primary">Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WebDateTimePicker;