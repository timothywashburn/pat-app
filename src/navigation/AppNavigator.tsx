import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { UserDataStoreStatus, useUserDataStore } from "@/src/stores/useUserDataStore";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ModuleType } from "@timothyw/pat-common";
import { AuthStoreStatus, useAuthStore } from "@/src/stores/useAuthStore";
import { useModuleContext } from "@/src/components/ModuleContext";
import { moduleInfo } from "@/src/components/ModuleInfo";
import { useNavigationStore } from "@/src/stores/useNavigationStore";
import { FocusAwareWrapper } from '@/src/components/FocusAwareWrapper';

export type TabNavigatorParamList = {
    [ModuleType.AGENDA]: undefined;
    [ModuleType.INBOX]: {
        thoughtProcessed?: boolean;
        thoughtId?: string;
    } | undefined;
    [ModuleType.LISTS]: undefined;
    [ModuleType.PEOPLE]: undefined;
    [ModuleType.HABITS]: undefined;
    [ModuleType.SETTINGS]: undefined;
    [ModuleType.DEV]: undefined;
};

const Tab = createMaterialTopTabNavigator();

export default function AppNavigator() {
    const { getColor } = useTheme();
    const { authStoreStatus } = useAuthStore();
    const { userDataStoreStatus, data, getFirstModule } = useUserDataStore();
    const { activeHiddenModule } = useModuleContext();
    const isWeb = Platform.OS === 'web';
    const [navigationKey, setNavigationKey] = useState("initial");

    const navigationStore = useNavigationStore();

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

        return <Component />;
    }

    return (
        <>
            <Tab.Navigator
                key={navigationKey}
                initialRouteName={getFirstModule()}
                tabBarPosition="bottom"
                screenOptions={{
                    tabBarActiveTintColor: getColor("primary"),
                    tabBarInactiveTintColor: getColor("on-surface"),
                    tabBarStyle: {
                        backgroundColor: getColor("surface"),
                        display: isWeb ? 'none' : 'flex',
                    },
                    tabBarIndicatorStyle: {
                        top: 0,
                        bottom: undefined,
                    },
                    tabBarItemStyle: {
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
                            {(props) => (
                                <FocusAwareWrapper>
                                    <Component {...props} />
                                </FocusAwareWrapper>
                            )}
                        </Tab.Screen>
                    );
                })}
            </Tab.Navigator>
        </>
    );
}
