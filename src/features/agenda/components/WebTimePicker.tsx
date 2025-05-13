import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';

interface TimePickerProps {
    selectedDate: Date;
    onTimeSelected: (date: Date) => void;
}

interface TimeInputProps {
    value: string;
    maxValue: number;
    onChangeText: (text: string) => void;
    onComplete?: () => void;
    placeholder?: string;
    inputRef?: React.RefObject<any>;
}

const TimeInput: React.FC<TimeInputProps> = ({
    value,
    maxValue,
    onChangeText,
    onComplete,
    placeholder = "00",
    inputRef
}) => {
    const handleChange = (text: string) => {
        if (!/^\d*$/.test(text)) return;
        if (text.length > 2) return;

        const numValue = parseInt(text || "0", 10);
        if (numValue > maxValue) return;

        onChangeText(text);

        if (text.length === 2 && onComplete) onComplete();
    };

    const handleFocus = (event: any) => {
        if (event && event.target) {
            setTimeout(() => {
                event.target.select();
            }, 10);
        }
    };

    return (
        <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            onFocus={handleFocus}
            keyboardType="number-pad"
            maxLength={2}
            placeholder={placeholder}
            className="bg-surface text-on-background w-12 h-12 text-center text-xl border-b-2 border-primary-container focus:border-primary mx-1"
            selectTextOnFocus={true}
        />
    );
};

const WebTimePicker: React.FC<TimePickerProps> = ({
    selectedDate,
    onTimeSelected
}) => {
    // Convert 24h time to 12h format for display
    const to12HourFormat = (hours24: number) => {
        if (hours24 === 0) return 12;
        if (hours24 > 12) return hours24 - 12;
        return hours24;
    };

    // State for input fields as strings for better control
    const [hoursStr, setHoursStr] = useState(to12HourFormat(selectedDate.getHours()).toString());
    const [minutesStr, setMinutesStr] = useState(selectedDate.getMinutes().toString().padStart(2, '0'));
    const [ampm, setAmpm] = useState(selectedDate.getHours() >= 12 ? 'PM' : 'AM');

    // Refs for auto-focusing
    const hoursInputRef = useRef<any>(null);
    const minutesInputRef = useRef<any>(null);

    // Convert string inputs to numbers
    const hours = parseInt(hoursStr || "0", 10);

    // Determine if we should disable AM/PM toggle (for 24h time)
    const is24HourFormat = hours === 0 || hours > 12;

    // Focus minutes input when hours are complete
    const focusMinutes = () => {
        if (minutesInputRef.current) {
            minutesInputRef.current.focus();
        }
    };

    // Toggle AM/PM
    const toggleAmPm = (value: 'AM' | 'PM') => {
        if (is24HourFormat) return; // Do nothing if in 24h format
        setAmpm(value);
    };

    // Update time whenever hours, minutes, or ampm changes
    useEffect(() => {
        const newDate = new Date(selectedDate);

        // Safely parse inputs
        const h = parseInt(hoursStr || "0", 10);
        const m = parseInt(minutesStr || "0", 10);

        let hour24 = h;
        // Only apply AM/PM logic if we're in 12-hour format
        if (h <= 12 && h > 0) { // 12-hour format with AM/PM
            if (ampm === 'PM' && h < 12) hour24 = h + 12;
            if (ampm === 'AM' && h === 12) hour24 = 0;
        }

        newDate.setHours(hour24, m);
        onTimeSelected(newDate);
    }, [hoursStr, minutesStr, ampm]);

    return (
        <View className="p-6 items-center">
            <View className="flex-row items-center justify-center py-4">
                <View className="flex-row items-center">
                    <TimeInput
                        value={hoursStr}
                        maxValue={23}
                        onChangeText={setHoursStr}
                        onComplete={focusMinutes}
                        inputRef={hoursInputRef}
                    />

                    <Text className="text-on-background text-2xl">:</Text>

                    <TimeInput
                        value={minutesStr}
                        maxValue={59}
                        onChangeText={setMinutesStr}
                        inputRef={minutesInputRef}
                    />
                </View>

                <View className="flex-row ml-4">
                    <TouchableOpacity
                        onPress={() => toggleAmPm('AM')}
                        disabled={is24HourFormat}
                        className={`px-3 py-2 rounded-l-md 
                            ${ampm === 'AM' ? 'bg-primary' : 'bg-surface border border-outline'}
                            ${is24HourFormat ? 'opacity-40' : ''}`}
                    >
                        <Text className={ampm === 'AM' ? 'text-on-primary' : 'text-on-background'}>AM</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => toggleAmPm('PM')}
                        disabled={is24HourFormat}
                        className={`px-3 py-2 rounded-r-md 
                            ${ampm === 'PM' ? 'bg-primary' : 'bg-surface border border-outline'}
                            ${is24HourFormat ? 'opacity-40' : ''}`}
                    >
                        <Text className={ampm === 'PM' ? 'text-on-primary' : 'text-on-background'}>PM</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default WebTimePicker;