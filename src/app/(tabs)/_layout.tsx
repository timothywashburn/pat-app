import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthGuard from "@/src/features/auth/components/AuthGuard";
import { useTheme } from '@/src/theme/ThemeManager';

type TabBarIconProps = {
    color: string;
    size: number;
};

export default function TabsLayout() {
    const { colors } = useTheme();

    return (
        <AuthGuard>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.secondary,
                    tabBarStyle: {
                        backgroundColor: colors.surface,
                    }
                }}
            >
                <Tabs.Screen
                    name="agenda"
                    options={{
                        title: 'Agenda',
                        tabBarIcon: ({ color, size }: TabBarIconProps) => (
                            <Ionicons name="calendar" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="inbox"
                    options={{
                        title: 'Inbox',
                        tabBarIcon: ({ color, size }: TabBarIconProps) => (
                            <Ionicons name="mail" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tasks"
                    options={{
                        title: 'Tasks',
                        tabBarIcon: ({ color, size }: TabBarIconProps) => (
                            <Ionicons name="list" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="people"
                    options={{
                        title: 'People',
                        tabBarIcon: ({ color, size }: TabBarIconProps) => (
                            <Ionicons name="people" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({ color, size }: TabBarIconProps) => (
                            <Ionicons name="settings" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </AuthGuard>
    );
}