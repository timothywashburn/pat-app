import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/theme/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';

export default function TasksPanel() {
    const { colorScheme } = useTheme();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <CustomHeader
                title="Tasks"
                showAddButton
                onAddTapped={() => {
                    console.log('add task tapped');
                }}
            />

            <View className="flex-1 items-center justify-center p-5">
                <Text className="text-2xl font-bold text-primary mb-5">Tasks Panel</Text>
                <Text className="text-secondary">This will be the Tasks panel for managing tasks</Text>
            </View>
        </SafeAreaView>
    );
}