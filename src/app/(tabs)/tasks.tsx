import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@/src/components/CustomHeader';
import WebDateTimePicker from "@/src/features/agenda/components/WebDateTimePicker";

export default function TasksPanel() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        console.log('date changed to', date.toISOString());
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                title="Tasks"
                showAddButton
                onAddTapped={() => {
                    console.log('add task tapped')
                }}
            />

            <View className="flex-1 items-center justify-center p-5">
                <Text className="text-on-background text-2xl font-bold mb-5">Tasks Module</Text>
                <Text className="text-on-background-variant mb-5">This will be the Tasks module for managing tasks</Text>

                {/* Test button to show date picker */}
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-primary rounded-lg px-4 py-2 mb-4"
                >
                    <Text className="text-on-primary">Select Date & Time</Text>
                </TouchableOpacity>

                <Text className="text-on-background">
                    Selected Date: {selectedDate.toLocaleString()}
                </Text>
            </View>

            {/* Web Date Picker Modal - only shown on web */}
            {Platform.OS === 'web' && showDatePicker && (
                <View className="absolute z-10 w-full h-full bg-black bg-opacity-60 flex items-center justify-center">
                    <WebDateTimePicker
                        date={selectedDate}
                        onDateChange={handleDateChange}
                        onDismiss={() => setShowDatePicker(false)}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}