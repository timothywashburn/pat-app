import "@/global.css"

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import SocketService from '@/src/services/SocketService';
import DeepLinkHandler from "@/src/services/DeepLinkHanlder";
import { ThemeProvider } from "@react-navigation/native";
import { CustomThemeProvider, useTheme } from "@/src/controllers/ThemeManager"; // Updated import
import { ToastProvider } from "@/src/components/toast/ToastContext";
import AppNavigator from "@/src/components/AppNavigator";
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useDataStore } from "@/src/features/settings/controllers/UserDataStore";
import { Logger } from "@/src/features/dev/components/Logger";
import LogViewer from "@/src/features/dev/components/LogViewer";
import { SafeAreaView } from "react-native-safe-area-context";

type BootStage = 'initializing' | 'auth-ready' | 'loading-user-data' | 'ready' | 'error';

// Toggle this to show dev terminal instead of normal boot
const DEV_MODE = true;

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

// Separate component that uses the theme context
const AppContent: React.FC = () => {
    const { theme, colorScheme } = useTheme();
    const { isAuthenticated, userInfo, initializeAuth } = useAuthStore();
    const { isLoaded, loadUserData } = useDataStore();
    const [bootStage, setBootStage] = useState<BootStage>('initializing');
    const [bootError, setBootError] = useState<string | null>(null);
    const [showDevTerminal, setShowDevTerminal] = useState(DEV_MODE);

    useEffect(() => {
        bootApp();
    }, []);

    useEffect(() => {
        const socketService = SocketService.shared;

        if (isAuthenticated) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }

        return () => socketService.disconnect();
    }, [isAuthenticated]);

    const bootApp = async () => {
        try {
            console.log('starting boot sequence');
            Logger.info('startup', 'application starting');

            setBootStage('initializing');
            Logger.info('startup', 'initializing authentication');
            await initializeAuth();
            Logger.info('startup', 'authentication initialized successfully');

            Logger.info('startup', 'initializing deep links');
            DeepLinkHandler.initialize();
            Logger.info('startup', 'deep links initialized successfully');
            setBootStage('auth-ready');

            const currentAuthState = useAuthStore.getState();
            Logger.info('startup', 'checking auth state for user data loading', {
                isAuthenticated: currentAuthState.isAuthenticated,
                isEmailVerified: currentAuthState.userInfo?.isEmailVerified,
                isLoaded
            });

            if (currentAuthState.isAuthenticated && currentAuthState.userInfo?.isEmailVerified && !isLoaded) {
                setBootStage('loading-user-data');
                Logger.info('startup', 'loading user data');
                await loadUserData();
                Logger.info('startup', 'user data loaded successfully');
            } else {
                Logger.info('startup', 'skipping user data load', {
                    reason: !currentAuthState.isAuthenticated ? 'not authenticated' :
                        !currentAuthState.userInfo?.isEmailVerified ? 'email not verified' :
                            isLoaded ? 'already loaded' : 'unknown'
                });
            }

            setBootStage('ready');
            Logger.info('startup', 'boot sequence complete');
            console.log('boot sequence complete');

        } catch (error) {
            console.error('boot sequence failed:', error);
            Logger.error('startup', 'boot sequence failed', error);
            setBootError(error instanceof Error ? error.message : 'unknown error');
            setBootStage('error');
        }
    };

    const hidesplash = useCallback(async () => {
        await SplashScreen.hideAsync();
    }, []);

    const closeDevTerminal = () => {
        setShowDevTerminal(false);
        console.log("dev terminal closed");
    };

    const renderDevTerminal = () => {
        return (
            <SafeAreaView onLayout={hidesplash} className="flex-1 bg-background">
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

                <View className="flex-row justify-between items-center p-4 border-b border-outline-variant/20">
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-on-background">
                            dev terminal
                        </Text>
                        <Text className="text-sm text-on-surface-variant">
                            startup logs and debugging information
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="px-3 py-1.5 rounded-lg bg-primary ml-4"
                        onPress={closeDevTerminal}
                    >
                        <Text className="text-on-primary font-medium">close</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-1 p-4">
                    <LogViewer
                        showControls={true}
                    />
                </View>
            </SafeAreaView>
        );
    };

    if (showDevTerminal) return renderDevTerminal();

    if (bootStage !== 'ready') {
        return (
            <View
                onLayout={hidesplash}
                className="flex-1 justify-center items-center bg-background"
            >
                <ActivityIndicator size="large" />
                {bootError && (
                    <View className="mt-4 px-4">
                        <Text className="text-red-500 text-center">{bootError}</Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <ToastProvider>
            <ThemeProvider value={theme}>
                <AppNavigator onLayout={hidesplash}>
                    <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                    <Stack screenOptions={{ header: () => null }}>
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </AppNavigator>
            </ThemeProvider>
        </ToastProvider>
    );
};

export default function RootLayout() {
    return (
        <CustomThemeProvider>
            <AppContent />
        </CustomThemeProvider>
    );
}