import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { View, Text, Platform } from 'react-native';
import { moduleInfo, useDataStore } from "@/src/features/settings/controllers/DataStore";
import WebHeader from '@/src/components/WebHeader';

type TabBarIconProps = {
    color: string;
    size: number;
};

export default function TabsLayout() {
    const { getColor } = useTheme();
    const { data } = useDataStore();
    const isWeb = Platform.OS === 'web';

    if (data?.config.modules.length === 0) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('background') }}>
                <Text style={{ color: getColor('on-background') }}>No modules enabled</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {isWeb && <WebHeader modules={data?.config.modules} />}
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
                {data?.config.modules.map((module) => {
                    const moduleType = module.type;
                    const { icon, title } = moduleInfo[moduleType];
                    return (
                        <Tabs.Screen
                            key={moduleType}
                            name={moduleType}
                            options={{
                                title: title,
                                href: module.visible || module.type == "settings" ? undefined : null,
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