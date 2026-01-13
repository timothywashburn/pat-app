import React, { useState, useCallback } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, CompositeNavigationProp } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import WebHeader from '@/src/components/WebHeader';
import PushNotificationSection from "@/src/features/dev/components/PushNotificationSection";
import DeepLinkSection from "@/src/features/dev/components/DeepLinksSection";
import DevicesSection from "@/src/features/dev/components/DevicesSection";
import LogViewerSection from "@/src/features/dev/components/LogViewerSection";
import DraggableListSection from "@/src/features/dev/components/DraggableListSection";
import { ModuleType } from "@timothyw/pat-common";
import { MainStackParamList } from '@/src/navigation/MainStack';
import { TabNavigatorParamList } from '@/src/navigation/AppNavigator';
import HabitResetTimeSlider from "@/src/components/common/HabitResetTimeSlider";
import DetailViewHeader from "@/src/components/headers/DetailViewHeader";
import LogViewer from "@/src/features/dev/components/LogViewer";
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';

interface DevPanelProps {
    navigation: CompositeNavigationProp<
        MaterialTopTabNavigationProp<TabNavigatorParamList, ModuleType.DEV>,
        StackNavigationProp<MainStackParamList>
    >;
    route: RouteProp<TabNavigatorParamList, ModuleType.DEV>;
}

export const DevPanel: React.FC<DevPanelProps> = ({
    navigation,
    route
}) => {
    console.log('[DevPanel] Component re-rendering');
    const [logViewerPanelVisible, setLogViewerPanelVisible] = useState(false);
    const scrollViewRef = React.useRef<ScrollView>(null);
    const scrollYRef = React.useRef(0);

    const handleAddTapped = () => {
        console.log('dev tapped');
    };

    const headerProps = {
        showAddButton: true,
        onAddTapped: handleAddTapped,
    };

    return (
        <>
            <WebHeader {...headerProps} />
            <MainViewHeader
                moduleType={ModuleType.DEV}
                title="Dev"
                {...headerProps}
            />

            <ScrollView
                ref={scrollViewRef}
                className="flex-1 p-5"
                onScroll={(event) => {
                    scrollYRef.current = event.nativeEvent.contentOffset.y;
                }}
                scrollEventThrottle={16}
            >
                <View className="items-center mb-10">
                    <Text className="text-on-background text-2xl font-bold mb-5">Dev Panel</Text>
                    <Text className="text-on-background-variant">For various development things</Text>
                </View>

                <LogViewerSection
                    setPanelVisible={setLogViewerPanelVisible}
                />
                <DraggableListSection scrollViewRef={scrollViewRef} scrollYRef={scrollYRef} />
                <PushNotificationSection />
                <DevicesSection />
                <DeepLinkSection />

                <View className="h-10" />
            </ScrollView>

            {logViewerPanelVisible &&
                <View className="bg-background absolute inset-0 z-50">
                    <DetailViewHeader
                        title="Application Logs"
                        onBack={() => setLogViewerPanelVisible(false)}
                        onEdit={() => {}}
                        showEdit={false}
                    />
                    <LogViewer maxHeight={undefined} fullScreen={true} />
                </View>
            }
        </>
    );
}

export default DevPanel;