import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

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
    const [currentView, setCurrentView] = useState<'date' | 'time'>('date');

    // Handle date selection from DatePicker
    const handleDateSelected = (newDate: Date) => {
        setSelectedDate(newDate);
    };

    // Handle time selection from TimePicker
    const handleTimeSelected = (newDate: Date) => {
        setSelectedDate(newDate);
    };

    // Apply the selected date and time
    const handleDone = () => {
        onDateChange(selectedDate);
        onDismiss();
    };

    return (
        <View className="bg-surface rounded-lg shadow-lg w-80 max-w-full">
            {/* Header tabs */}
            <View className="flex-row border-b border-outline">
                <TouchableOpacity
                    onPress={() => setCurrentView('date')}
                    className={`flex-1 py-3 items-center ${currentView === 'date' ? 'border-b-2 border-primary' : ''}`}
                >
                    <Text className={`font-medium ${currentView === 'date' ? 'text-primary' : 'text-on-background-variant'}`}>
                        Date
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setCurrentView('time')}
                    className={`flex-1 py-3 items-center ${currentView === 'time' ? 'border-b-2 border-primary' : ''}`}
                >
                    <Text className={`font-medium ${currentView === 'time' ? 'text-primary' : 'text-on-background-variant'}`}>
                        Time
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Main content */}
            {currentView === 'date'
                ? <DatePicker selectedDate={selectedDate} onDateSelected={handleDateSelected} />
                : <TimePicker selectedDate={selectedDate} onTimeSelected={handleTimeSelected} />
            }

            {/* Footer buttons */}
            <View className="flex-row justify-between p-4 border-t border-outline">
                <TouchableOpacity
                    onPress={onDismiss}
                    className="bg-error rounded-lg px-4 py-2"
                >
                    <Text className="text-on-error">Cancel</Text>
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