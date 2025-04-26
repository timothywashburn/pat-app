import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { useState, useEffect } from 'react';
import { Panel, PanelType } from '@timothyw/pat-common';
import { View, Text, ActivityIndicator } from 'react-native';
import { panelInfo, useConfigStore } from "@/src/features/settings/controllers/ConfigStore";

type TabBarIconProps = {
    color: string;
    size: number;
};

export default function TabsLayout() {
    const { getColor } = useTheme();
    const { config } = useConfigStore();

    if (config?.iosApp.panels.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: getColor('background') }}>
                <Text style={{ color: getColor('on-background') }}>No panels configured</Text>
            </View>
        );
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: getColor("primary"),
                tabBarInactiveTintColor: getColor("on-surface"),
                tabBarStyle: {
                    backgroundColor: getColor("surface"),
                }
            }}
        >
            {config?.iosApp.panels.map((panel) => {
                const panelType = panel.type;
                const { icon, title } = panelInfo[panelType];

                return (
                    <Tabs.Screen
                        key={panelType}
                        name={panelType}
                        options={{
                            title: title,
                            tabBarIcon: ({ color, size }: TabBarIconProps) => (
                                <Ionicons name={icon} size={size} color={color} />
                            ),
                        }}
                    />
                );
            })}
        </Tabs>
    );
}