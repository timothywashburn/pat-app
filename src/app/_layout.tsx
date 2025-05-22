import "@/global.css"

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore, setAuthState } from "@/src/features/auth/controllers/AuthState";
import SocketService from '@/src/services/SocketService';
import DeepLinkHandler from "@/src/services/DeepLinkHanlder";
import { ThemeProvider } from "@react-navigation/native";
import { useTheme } from "@/src/controllers/ThemeManager";
import { ToastProvider } from "@/src/components/toast/ToastContext";
import AppNavigator from "@/src/components/AppNavigator";
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useDataStore } from "@/src/features/settings/controllers/DataStore";
import { Logger } from "@/src/features/dev/components/Logger";
import LogViewer from "@/src/features/dev/components/LogViewer";
import { SafeAreaView } from "react-native-safe-area-context";

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
    const [showDebugView, setShowDebugView] = useState(true);

    // setTheme('light');

    useEffect(() => {
        Logger.info('startup', 'application starting');
        Logger.warn('startup', 'application starting');
        Logger.debug('startup', 'application starting');

        // TODO: handle case where use effect is called twice; figure out a better way to do this
        async function initialize() {
            try {
                Logger.info('startup', 'initializing authentication');
                await initializeAuth();
                Logger.info('startup', 'authentication initialized successfully');

                Logger.info('startup', 'initializing deep links');
                DeepLinkHandler.initialize();
                Logger.info('startup', 'deep links initialized successfully');

                // await new Promise(resolve => setTimeout(resolve, 1000));
                setAuthState({ isLoading: false });
            } catch (error) {
                Logger.error('startup', 'authentication initialization failed', error);
            }
        }

        initialize();
    }, []);

    useEffect(() => {
        if (isAuthenticated && userInfo?.isEmailVerified && !isLoaded) {
            const load = async () => {
                try {
                    Logger.info('startup', 'loading app configuration');
                    loadConfig();
                    Logger.info('startup', 'configuration loaded successfully');
                } catch (error) {
                    Logger.error('startup', 'failed to load configuration', error);
                    useAuthStore.getState().signOut();
                }
            };

            load();
        }
    }, [isAuthenticated, userInfo?.isEmailVerified, isLoaded]);

    useEffect(() => {
        const socketService = SocketService.shared;

        if (isAuthenticated) {
            Logger.info('startup', 'connecting to socket service');
            socketService.connect();
        } else {
            Logger.info('startup', 'disconnecting from socket service');
            socketService.disconnect();
        }

        return () => {
            Logger.info('startup', 'cleaning up socket connection');
            socketService.disconnect();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        Logger.info('startup', `authentication state: ${isAuthenticated ? 'authenticated' : 'unauthenticated'}`, {
            isEmailVerified: userInfo?.isEmailVerified
        });
    }, [isAuthenticated, userInfo?.isEmailVerified]);

    const closeDebugView = () => {
        setShowDebugView(false);
        console.log("debug view closed");
    };

    const onLayoutRootView = useCallback(async () => {
        Logger.info('startup', 'hiding splash screen');
        await SplashScreen.hideAsync();
    }, []);

    const renderDebugView = () => {
        return (
            <SafeAreaView onLayout={onLayoutRootView} className="flex-1 bg-background">
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

                {/* Header with close button */}
                <View className="flex-row justify-between items-center p-4 border-b border-outline-variant/20">
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-on-background">
                            App Debug View
                        </Text>
                        <Text className="text-sm text-on-surface-variant">
                            Startup logs and debugging information
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg bg-primary ml-4"
                        onPress={closeDebugView}
                    >
                        <Text className="text-on-primary font-medium">Close</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-1 p-4">
                    <LogViewer
                        category="startup"
                        showControls={true}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // if (showDebugView) return renderDebugView();

    if (isAuthenticated && userInfo?.isEmailVerified && !isLoaded) {
        return (
            <View onLayout={onLayoutRootView} className="flex-1 justify-center items-center p-5">
                <ActivityIndicator size="large" color={getColor("primary")} />
            </View>
        );
    }

    Logger.info('startup', 'rendering root layout', {
        isAuthenticated,
        colorScheme,
        isEmailVerified: userInfo?.isEmailVerified,
        isLoaded
    });

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