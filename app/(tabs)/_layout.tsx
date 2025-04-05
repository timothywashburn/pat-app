import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index" // This will be the agenda panel (default tab)
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="inbox" // This will be the inbox panel
                options={{
                    title: 'Inbox',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mail" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tasks" // This will be the tasks panel
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="people" // This will be the people panel
                options={{
                    title: 'People',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings" // This will be the settings panel
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}