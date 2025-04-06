import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthGuard from "@/components/auth/AuthGuard";
import {useEffect} from "react";
import {useAuthStore} from "@/services/AuthState";

// Root layout with auth provider
export default function RootLayout() {
    const initialize = useAuthStore(state => state.initialize);

    useEffect(() => {
        initialize();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
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
        </SafeAreaProvider>
    );
}