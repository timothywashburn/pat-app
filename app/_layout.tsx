import { useEffect } from 'react';
import { Tabs, Stack, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, AuthProvider } from '../contexts/AuthProvider';

// Auth guard component
function AuthGuard({ children }: { children: JSX.Element }) {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!isAuthenticated && !inAuthGroup) {
            // Redirect to the sign-in page if not authenticated and not in auth group
            router.replace('/auth/login');
        } else if (isAuthenticated && inAuthGroup) {
            // Redirect to the home page if authenticated and in auth group
            router.replace('/');
        }
    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        // Return loading screen while auth state is loading
        return <Stack />;
    }

    return children;
}

// Root layout with auth provider
export default function RootLayout() {
    return (
        <AuthProvider>
            <AuthGuard>
                <RootLayoutNav />
            </AuthGuard>
        </AuthProvider>
    );
}

// Navigation layout based on authentication
function RootLayoutNav() {
    const { isAuthenticated } = useAuth();

    // If not authenticated, show auth screens
    if (!isAuthenticated) {
        return (
            <Stack>
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            </Stack>
        );
    }

    // If authenticated, show main app tabs
    return (
        <Tabs>
            <Tabs.Screen
                name="index" // Agenda panel
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="inbox" // Inbox panel
                options={{
                    title: 'Inbox',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="mail" size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="tasks" // Tasks panel
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="people" // People panel
                options={{
                    title: 'People',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="settings" // Settings panel
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}