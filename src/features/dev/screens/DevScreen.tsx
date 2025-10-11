import React, { useState, useCallback } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import PushNotificationSection from "@/src/features/dev/components/PushNotificationSection";
import DeepLinkSection from "@/src/features/dev/components/DeepLinksSection";
import DevicesSection from "@/src/features/dev/components/DevicesSection";
import LogViewerSection from "@/src/features/dev/components/LogViewerSection";
import { ModuleType } from "@timothyw/pat-common";
import { MainStackParamList } from '@/src/navigation/MainStack';
import HabitResetTimeSlider from "@/src/components/common/HabitResetTimeSlider";
import { useHeaderControls } from '@/src/context/HeaderControlsContext';

interface DevPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Dev'>;
    route: RouteProp<MainStackParamList, 'Dev'>;
}

export const DevPanel: React.FC<DevPanelProps> = ({
    navigation,
    route
}) => {
    const [logViewerPanelVisible, setLogViewerPanelVisible] = useState(false);
    const { setHeaderControls } = useHeaderControls();

    const handleAddTapped = () => {
        console.log('dev tapped');
    };

    useFocusEffect(
        useCallback(() => {
            setHeaderControls({
                showAddButton: true,
                onAddTapped: handleAddTapped,
            });

            return () => {
                setHeaderControls({});
            };
        }, [])
    );

    return (
        <>
            <MainViewHeader
                moduleType={ModuleType.DEV}
                title="Dev"
            />

            <ScrollView className="flex-1 p-5">
                <View className="items-center mb-10">
                    <Text className="text-on-background text-2xl font-bold mb-5">Dev Panel</Text>
                    <Text className="text-on-background-variant">For various development things</Text>
                </View>

                <LogViewerSection
                    onOpenPanel={() => setLogViewerPanelVisible(true)}
                />
                <PushNotificationSection />
                <DevicesSection />
                <DeepLinkSection />

                <View className="h-10" />
            </ScrollView>

            <LogViewerSection
                panelVisible={logViewerPanelVisible}
                onClosePanel={() => setLogViewerPanelVisible(false)}
            />
        </>
    );
}

export default DevPanel;