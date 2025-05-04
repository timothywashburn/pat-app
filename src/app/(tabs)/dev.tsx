import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import PushNotificationSection from "@/src/features/dev/components/PushNotificationSection";
import DeepLinkSection from "@/src/features/dev/components/DeepLinksSection";

export default function DevPanel() {
    const { colorScheme } = useTheme();

    return (
        <SafeAreaView className="bg-background flex-1">
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <CustomHeader
                title="Dev"
                showAddButton
                onAddTapped={() => {
                    console.log('add task tapped')
                }}
            />

            <View className="flex-1 p-5">
                <View className="items-center mb-10">
                    <Text className="text-on-background text-2xl font-bold mb-5">Dev Panel</Text>
                    <Text className="text-on-background-variant">For various development things</Text>
                </View>

                <PushNotificationSection />
                <DeepLinkSection />
            </View>
        </SafeAreaView>
    );
}