import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { ActivityIndicator, Platform, Text, View, TouchableOpacity, TextComponent } from 'react-native';
import {
    UserDataStoreStatus,
    useUserDataStore
} from "@/src/stores/useUserDataStore";
import WebHeader from '@/src/components/WebHeader';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ItemId, ModuleType } from "@timothyw/pat-common";
import { AuthStoreStatus, useAuthStore } from "@/src/stores/useAuthStore";
import { useModuleContext } from "@/src/components/ModuleContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { moduleInfo } from "@/src/components/ModuleInfo";
import MainStack, { MainStackParamList } from "@/src/navigation/MainStack";
import { useNavigationStore } from "@/src/stores/useNavigationStore";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type ModuleProps = {
    isModuleView: boolean;
};

const Tab = createMaterialTopTabNavigator();

export default function TabsLayout() {
    const { getColor } = useTheme();
    const { authStoreStatus } = useAuthStore();
    const { userDataStoreStatus } = useUserDataStore();
    const { data } = useUserDataStore();
    const { activeHiddenModule, hideActiveModule } = useModuleContext();
    const isWeb = Platform.OS === 'web';
    const [navigationKey, setNavigationKey] = useState("initial");

    const navigationStore = useNavigationStore();

    const params = useLocalSearchParams();
    // const initialRouteName = params.agendaItemId ? ModuleType.SETTINGS : undefined;
    // const initialRouteName = ModuleType.SETTINGS;
    // console.log('TabsLayout params:', params);
    // console.log('TabsLayout params:', params);
    // console.log('init:', initialRouteName);

    useEffect(() => {
        setNavigationKey(`nav-key-${Date.now()}`);
    }, [data]);

    if (authStoreStatus != AuthStoreStatus.FULLY_AUTHENTICATED) return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('background') }}>
            <ActivityIndicator size="large" color={getColor('primary')} />
            <Text style={{ color: getColor('on-background') }}>Loading Auth...</Text>
        </View>
    );

    if (userDataStoreStatus != UserDataStoreStatus.LOADED) return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('background') }}>
            <ActivityIndicator size="large" color={getColor('primary')} />
            <Text style={{ color: getColor('on-background') }}>Loading User Data...</Text>
        </View>
    );

    if (data.config.modules.length === 0) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('background') }}>
                <Text style={{ color: getColor('on-background') }}>No modules enabled</Text>
            </View>
        );
    }

    if (activeHiddenModule) {
        const moduleConfig = moduleInfo[activeHiddenModule.type];
        if (!moduleConfig) return null;
        const Component = moduleConfig.Component;

        return (
            <SafeAreaView
                className="bg-background flex-1" edges={['top', 'left', 'right', 'bottom']}
            >
                <Component />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-background flex-1" edges={['top', 'left', 'right', 'bottom']}>
            {isWeb && <WebHeader modules={data?.config.modules} />}
            <Tab.Navigator
                key={navigationKey} // TODO: temporary patch
                initialRouteName={'lists'}
                tabBarPosition="bottom"
                screenOptions={{
                    tabBarActiveTintColor: getColor("primary"),
                    tabBarInactiveTintColor: getColor("on-surface"),
                    tabBarStyle: {
                        backgroundColor: getColor("surface"),
                        display: isWeb ? 'none' : 'flex',
                        // height: 60
                    },
                    tabBarIndicatorStyle: {
                        top: 0,
                        bottom: undefined,
                    },
                    tabBarItemStyle: {
                        // height: 60,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        marginLeft: 0,
                        marginRight: 0,
                    },
                    tabBarPressColor: 'transparent',
                    swipeEnabled: navigationStore.enabled && !isWeb,
                }}
            >
                {data.config.modules.map((module) => {
                    if (!module.visible && module.type != ModuleType.SETTINGS) return;
                    const moduleType = module.type;
                    const moduleConfig = moduleInfo[moduleType];

                    if (!moduleConfig) return null;
                    
                    const { Component, icon, title } = moduleConfig;

                    return (
                        <Tab.Screen
                            key={moduleType}
                            name={moduleType}
                            // component={() => <MainStack initialRouteName={moduleConfig.initialRouteName} />}
                            listeners={{
                                tabPress: (e) => {
                                    if (!navigationStore.enabled) e.preventDefault();
                                }
                            }}
                            options={{
                                title: title,
                                tabBarIcon: ({ color }) => (
                                    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color={color} />
                                ),
                            }}
                        >
                            {() => <MainStack initialRouteName={moduleConfig.initialRouteName} />}
                        </Tab.Screen>
                    );
                })}
            </Tab.Navigator>
        </SafeAreaView>
    );
}