import "@/global.css"

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from "react";
import { useAuthStore, setAuthState } from "@/src/features/auth/controllers/AuthState";
import SocketService from '@/src/services/SocketService';
import DeepLinkHandler from "@/src/services/DeepLinkHanlder";
import { ThemeProvider } from "@react-navigation/native";
import { useTheme } from "@/src/controllers/ThemeManager";
import { ToastProvider } from "@/src/components/toast/ToastContext";
import AppNavigator from "@/src/components/AppNavigator";
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View } from "react-native";
import { useDataStore } from "@/src/features/settings/controllers/DataStore";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

export default function RootLayout() {
    const { theme, colorScheme, getColor, setTheme } = useTheme();
    const initializeAuth = useAuthStore(state => state.initializeAuth);
    const { isAuthenticated, isLoading, userInfo } = useAuthStore();
    const { isLoaded, loadConfig } = useDataStore();

    // setTheme('light');

    useEffect(() => {
        // TODO: handle case where use effect is called twice; figure out a better way to do this
        async function initialize() {
            try {
                await initializeAuth();
                DeepLinkHandler.initialize();
                // await new Promise(resolve => setTimeout(resolve, 1000));
                setAuthState({ isLoading: false });
            } catch (error) {
                console.error('initialization error:', error);
            }
        }

        initialize();
    }, []);

    useEffect(() => {
        if (isAuthenticated && userInfo?.isEmailVerified && !isLoaded) {
            const load = async () => {
                try {
                    loadConfig();
                } catch (error) {
                    console.error('settings load error:', error);
                    useAuthStore.getState().signOut();
                }
            };

            load();
        }
    }, [isAuthenticated, userInfo?.isEmailVerified, isLoaded]);

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

    if (isAuthenticated && userInfo?.isEmailVerified && !isLoaded) {
        return (
            <View onLayout={onLayoutRootView} className="flex-1 justify-center items-center p-5">
                <ActivityIndicator size="large" color={getColor("primary")} />
            </View>
        );
    }

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