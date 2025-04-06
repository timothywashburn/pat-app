import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <AuthProvider>
                <AuthGuard>
                    <Stack screenOptions={{
                        // Using header: null instead of headerShown: false
                        // helps with safe area calculations
                        header: () => null
                    }}>
                        {/* Auth group won't appear in tab bar */}
                        <Stack.Screen name="auth" />
                        {/* (tabs) group will contain all tab screens */}
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </AuthGuard>
            </AuthProvider>
        </SafeAreaProvider>
    );
}