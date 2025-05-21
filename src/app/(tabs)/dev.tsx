import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@/src/components/CustomHeader';
import PushNotificationSection from "@/src/features/dev/components/PushNotificationSection";
import DeepLinkSection from "@/src/features/dev/components/DeepLinksSection";
import DevicesSection from "@/src/features/dev/components/DevicesSection";
import LogViewerSection from "@/src/features/dev/components/LogViewerSection";

export default function DevPanel() {
    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                title="Dev"
                showAddButton
                onAddTapped={() => {
                    console.log('add task tapped')
                }}
            />

            <ScrollView className="flex-1 p-5">
                <View className="items-center mb-10">
                    <Text className="text-on-background text-2xl font-bold mb-5">Dev Panel</Text>
                    <Text className="text-on-background-variant">For various development things</Text>
                </View>

                <LogViewerSection />
                <PushNotificationSection />
                <DevicesSection />
                <DeepLinkSection />

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}