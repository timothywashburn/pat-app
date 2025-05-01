import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { View, Text, Platform } from 'react-native';
import { panelInfo, useConfigStore } from "@/src/features/settings/controllers/DataStore";
import WebHeader from '@/src/components/WebHeader';

type TabBarIconProps = {
    color: string;
    size: number;
};

export default function TabsLayout() {
    const { getColor } = useTheme();
    const { data } = useConfigStore();
    const isWeb = Platform.OS === 'web';

    if (data?.config.panels.length === 0) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('background') }}>
                <Text style={{ color: getColor('on-background') }}>No panels configured</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {isWeb && <WebHeader panels={data?.config.panels} />}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: getColor("primary"),
                    tabBarInactiveTintColor: getColor("on-surface"),
                    tabBarStyle: {
                        backgroundColor: getColor("surface"),
                        display: isWeb ? 'none' : 'flex',
                    }
                }}
            >
                {data?.config.panels.map((panel) => {
                    const panelType = panel.type;
                    const { icon, title } = panelInfo[panelType];
                    return (
                        <Tabs.Screen
                            key={panelType}
                            name={panelType}
                            options={{
                                title: title,
                                href: panel.visible || panel.type == "settings" ? undefined : null,
                                tabBarIcon: ({ color, size }: TabBarIconProps) => (
                                    <Ionicons name={icon} size={size} color={color} />
                                ),
                            }}
                        />
                    );
                })}
            </Tabs>
        </View>
    );
}