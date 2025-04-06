// src/app/_layout.tsx

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthGuard from "@/src/features/auth/components/AuthGuard";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import SocketService from '@/src/services/SocketService';
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';

// Root layout with auth provider
export default function RootLayout() {
    const initialize = useAuthStore(state => state.initialize);
    const { isAuthenticated, isEmailVerified } = useAuthStore();
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
    const settingsManager = SettingsManager.shared;

    useEffect(() => {
        initialize();
    }, []);

    // Load settings when user is authenticated and email is verified
    useEffect(() => {
        if (isAuthenticated && isEmailVerified && !isSettingsLoaded) {
            const loadSettings = async () => {
                try {
                    await settingsManager.loadSettings();
                    setIsSettingsLoaded(true);
                } catch (error) {
                    console.error('settings load error:', error);
                    // Sign out on settings load error
                    useAuthStore.getState().signOut();
                }
            };

            loadSettings();
        } else if (!isAuthenticated) {
            // Reset settings loaded state when user signs out
            setIsSettingsLoaded(false);
        }
    }, [isAuthenticated, isEmailVerified, isSettingsLoaded]);

    // Handle socket connection based on auth state
    useEffect(() => {
        const socketService = SocketService.shared;

        if (isAuthenticated && isEmailVerified && isSettingsLoaded) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }

        return () => {
            // Disconnect socket when component unmounts
            socketService.disconnect();
        };
    }, [isAuthenticated, isEmailVerified, isSettingsLoaded]);

    return (
        <SafeAreaProvider>
            <StatusBar style="dark"/>
            <AuthGuard>
                <Stack screenOptions={{
                    header: () => null
                }}>
                    {/* Auth group won't appear in tab bar */}
                    <Stack.Screen name="auth"/>
                    {/* (tabs) group will contain all tab screens */}
                    <Stack.Screen name="(tabs)"/>
                </Stack>
            </AuthGuard>
        </SafeAreaProvider>
    );
}