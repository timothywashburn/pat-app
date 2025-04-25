import "@/global.css"

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import SocketService from '@/src/services/SocketService';
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';
import DeepLinkHandler from "@/src/services/DeepLinkHanlder";
import { ThemeProvider } from "@react-navigation/native";
import { useTheme } from "@/src/controllers/ThemeManager";
import { ToastProvider } from "@/src/components/toast/ToastContext";
import AppNavigator from "@/src/components/AppNavigator";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

export default function RootLayout() {
    const initialize = useAuthStore(state => state.initialize);
    const { isAuthenticated, isLoading, userInfo } = useAuthStore();
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
    const settingsManager = SettingsManager.shared;

    const { theme, colorScheme } = useTheme();

    useEffect(() => {
        async function prepare() {
            try {
                await initialize();
                DeepLinkHandler.initialize();
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (error) {
                console.error('initialization error:', error);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (isAuthenticated && userInfo?.isEmailVerified && !isSettingsLoaded) {
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
    }, [isAuthenticated, userInfo?.isEmailVerified, isSettingsLoaded]);

    useEffect(() => {
        const socketService = SocketService.shared;

        if (isAuthenticated) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }

        return () => socketService.disconnect();
    }, [isAuthenticated]);

    const onLayoutRootView = useCallback(async () => {
        if (!isLoading) {
            await SplashScreen.hideAsync();
        }
    }, [isLoading]);

    if (isLoading) return null;

    return (
        <ToastProvider>
            <ThemeProvider value={theme}>
                <AppNavigator onLayout={onLayoutRootView}>
                    <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                    <Stack screenOptions={{
                        header: () => null
                    }}>
                        <Stack.Screen name="(auth)"/>
                        <Stack.Screen name="(tabs)"/>
                    </Stack>
                </AppNavigator>
            </ThemeProvider>
        </ToastProvider>
    );
}