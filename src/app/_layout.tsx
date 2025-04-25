import "@/global.css"

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import SocketService from '@/src/services/SocketService';
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';
import DeepLinkHandler from "@/src/services/DeepLinkHanlder";
import { ActivityIndicator, Text, View } from "react-native";
import { ThemeProvider } from "@react-navigation/native";
import { useTheme } from "@/src/controllers/ThemeManager";
import { ToastProvider } from "@/src/components/toast/ToastContext";

export default function RootLayout() {
    const initialize = useAuthStore(state => state.initialize);
    const { isAuthenticated, isEmailVerified, isLoading } = useAuthStore();
    const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(false);
    const settingsManager = SettingsManager.shared;

    const { theme, colorScheme } = useTheme();

    useEffect(() => {
        initialize();
        DeepLinkHandler.initialize();
    }, []);

    useEffect(() => {
        if (isAuthenticated && isEmailVerified && !isSettingsLoaded) {
            const loadSettings = async () => {
                try {
                    await settingsManager.loadSettings();
                    setIsSettingsLoaded(true);
                } catch (error) {
                    console.error('settings load error:', error);
                    useAuthStore.getState().logout();
                }
            };

            loadSettings();
        } else if (!isAuthenticated) {
            setIsSettingsLoaded(false);
        }
    }, [isAuthenticated, isEmailVerified, isSettingsLoaded]);

    useEffect(() => {
        const socketService = SocketService.shared;

        if (isAuthenticated && isEmailVerified && isSettingsLoaded) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }

        return () => socketService.disconnect();
    }, [isAuthenticated, isEmailVerified, isSettingsLoaded]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 10, color: theme.colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <ToastProvider>
            <ThemeProvider value={theme}>
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                <Stack screenOptions={{
                    header: () => null
                }}>
                    <Stack.Screen name="(auth)"/>
                    <Stack.Screen name="(tabs)"/>
                </Stack>
            </ThemeProvider>
        </ToastProvider>
    );
}