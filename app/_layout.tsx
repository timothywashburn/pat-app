import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth, AuthProvider } from '@/contexts/AuthProvider';
import AuthGuard from "@/components/auth/AuthGuard";

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