import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';

export default function DevPanel() {
    const { colorScheme } = useTheme();

    return (
        <SafeAreaView className="bg-background flex-1">
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <CustomHeader
                title="Tasks"
                showAddButton
                onAddTapped={() => {
                    console.log('add task tapped');
                }}
            />

            <View className="flex-1 items-center justify-center p-5">
                <Text className="text-on-background text-2xl font-bold mb-5">Dev Panel</Text>
                <Text className="text-on-background-variant">For various development things</Text>
            </View>
        </SafeAreaView>
    );
}