import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Platform, Text, View } from 'react-native';
import { moduleInfo, useDataStore } from "@/src/features/settings/controllers/UserDataStore";
import WebHeader from '@/src/components/WebHeader';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ModuleType } from "@timothyw/pat-common";

const Tab = createMaterialTopTabNavigator();

export default function TabsLayout() {
    const { getColor } = useTheme();
    const { canRenderTabs } = useDataStore();
    const { data } = useDataStore();
    const isWeb = Platform.OS === 'web';
    const [navigationKey, setNavigationKey] = useState("initial");

    useEffect(() => {
        setNavigationKey(`nav-key-${Date.now()}`);
    }, [data]);

    if (!canRenderTabs()) return;

    if (data.config.modules.length === 0) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('background') }}>
                <Text style={{ color: getColor('on-background') }}>No modules enabled</Text>
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