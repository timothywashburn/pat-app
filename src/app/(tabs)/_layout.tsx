import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { ActivityIndicator, Platform, Text, View, TouchableOpacity } from 'react-native';
import {
    UserDataStoreStatus,
    useUserDataStore
} from "@/src/features/settings/controllers/useUserDataStore";
import WebHeader from '@/src/components/WebHeader';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ModuleType } from "@timothyw/pat-common";
import { AuthStoreStatus, useAuthStore } from "@/src/features/auth/controllers/useAuthStore";
import { useModuleContext } from "@/src/components/ModuleContext";
import { moduleInfo } from "@/src/components/ModuleInfo";

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
        const { getComponent } = moduleInfo[activeHiddenModule.type];
        const ModuleComponent = getComponent;

        return (
            <View
                className="flex-1"
                style={{ backgroundColor: getColor("background") }}
            >
                <ModuleComponent />
            </View>
        );
    }

    return (
        <View className="flex-1">
            {isWeb && <WebHeader modules={data?.config.modules} />}
            <Tab.Navigator
                key={navigationKey} // TODO: temporary patch
                tabBarPosition="bottom"
                screenOptions={{
                    tabBarActiveTintColor: getColor("primary"),
                    tabBarInactiveTintColor: getColor("on-surface"),
                    tabBarStyle: {
                        backgroundColor: getColor("surface"),
                        display: isWeb ? 'none' : 'flex',
                        height: 80
                    },
                    tabBarIndicatorStyle: {
                        top: 0,
                        bottom: undefined,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        marginLeft: 0,
                        marginRight: 0,
                        paddingBottom: 20
                    },
                    tabBarPressColor: 'transparent',
                }}
            >
                {data.config.modules.map((module) => {
                    if (!module.visible && module.type != ModuleType.SETTINGS) return;
                    const moduleType = module.type;
                    const { getComponent, icon, title } = moduleInfo[moduleType];
                    return (
                        <Tab.Screen
                            key={moduleType}
                            name={moduleType}
                            component={getComponent}
                            options={{
                                title: title,
                                tabBarIcon: ({ color }) => (
                                    <Ionicons name={icon} size={24} color={color} />
                                ),
                            }}
                        />
                    );
                })}
            </Tab.Navigator>
        </View>
    );
}