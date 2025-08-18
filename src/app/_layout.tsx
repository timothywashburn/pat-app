import "@/global.css"

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from "react";
import { AuthStoreStatus, useAuthStore } from "@/src/stores/useAuthStore";
import { VersionResponse } from "@timothyw/pat-common";
import { Platform } from 'react-native';
import SocketService from '@/src/services/SocketService';
import DeepLinkHandler from "@/src/services/DeepLinkHanlder";
import { ThemeProvider } from "@react-navigation/native";
import { CustomThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { ToastProvider } from "@/src/components/toast/ToastContext";
import { AlertProvider } from "@/src/components/alert";
import AppNavigator from "@/src/components/AppNavigator";
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { UserDataStoreStatus, useUserDataStore } from "@/src/stores/useUserDataStore";
import { Logger } from "@/src/features/dev/components/Logger";
import LogViewer from "@/src/features/dev/components/LogViewer";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ModuleProvider } from "@/src/components/ModuleContext";
import * as Application from 'expo-application';

const DEV_BOOT = false;

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

const AppContent: React.FC = () => {
    const { theme, colorScheme, getColor } = useTheme();
    const { authStoreStatus, initializeAuth, versionInfo } = useAuthStore();
    const { userDataStoreStatus, loadUserData } = useUserDataStore();
    const [showDevTerminal, setShowDevTerminal] = useState(DEV_BOOT);
    const [isRetryingRefresh, setIsRetryingRefresh] = useState(false);

    useEffect(() => {
        Logger.debug('startup', 'deciding whether to initialize auth', {
            authStoreStatus,
        });

        if (authStoreStatus === AuthStoreStatus.NOT_INITIALIZED) {
            Logger.debug('startup', 'initializing auth');
            initializeAuth().then(() => {
                Logger.debug('startup', 'auth initialized successfully');
            }).catch((error) => {
                Logger.error('startup', 'failed to initialize auth', error);
            });
        }

    }, [authStoreStatus]);

    useEffect(() => {
        Logger.debug('startup', 'deciding whether to load user data', {
            authStoreStatus,
            userDataStoreStatus,
        });

        if ((authStoreStatus === AuthStoreStatus.AUTHENTICATED_NO_EMAIL || authStoreStatus === AuthStoreStatus.FULLY_AUTHENTICATED) &&
            userDataStoreStatus === UserDataStoreStatus.NOT_LOADED) {
            Logger.debug('startup', 'loading user data');
            loadUserData().then();
        }
    }, [authStoreStatus, userDataStoreStatus]);

    useEffect(() => {
        const socketService = SocketService.shared;

        if (authStoreStatus === AuthStoreStatus.AUTHENTICATED_NO_EMAIL || authStoreStatus === AuthStoreStatus.FULLY_AUTHENTICATED) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }

        return () => socketService.disconnect();
    }, [authStoreStatus]);

    useEffect(() => {
        Logger.debug('startup', 'deciding whether to initialize deep links', {
            authStoreStatus,
        });

        if (authStoreStatus !== AuthStoreStatus.NOT_INITIALIZED) {
            Logger.debug('startup', 'initializing deep links');
            DeepLinkHandler.initialize();
            Logger.debug('startup', 'deep links initialized successfully');
        }
    }, [authStoreStatus]);

    const hidesplash = useCallback(async () => {
        await SplashScreen.hideAsync();
    }, []);

    const closeDevTerminal = () => {
        setShowDevTerminal(false);
        console.log("dev terminal closed");
    };

    const handleRefresh = async () => {
        if (isRetryingRefresh) return;

        setIsRetryingRefresh(true);
        console.log("retrying authentication initialization");

        try {
            await initializeAuth();
            console.log("authentication retry successful");
        } catch (error) {
            console.log("authentication retry failed");
            Logger.error('startup', 'failed to retry auth initialization', error);
        } finally {
            setIsRetryingRefresh(false);
        }
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

    if (authStoreStatus === AuthStoreStatus.NOT_INITIALIZED) {
        return (
            <View
                onLayout={hidesplash}
                className="flex-1 justify-center items-center bg-background"
            >
                <ActivityIndicator size="large" />
                <Text className="mt-4 text-on-background">
                    {authStoreStatus === AuthStoreStatus.NOT_INITIALIZED
                        ? "Initializing authentication..."
                        : "Loading user data..."}
                </Text>
            </View>
        );
    } else if (authStoreStatus === AuthStoreStatus.SERVER_ERROR) {
        return (
            <View
                onLayout={hidesplash}
                className="flex-1 justify-center items-center bg-background px-8"
            >
                <Ionicons name="close-circle-outline" size={64} color={getColor("error")} />
                <Text className="mt-4 text-on-background text-center text-lg">
                    A server error occurred
                </Text>
                <Text className="mt-2 text-on-surface-variant text-center">
                    Unable to connect to the server. Please check your internet connection and try again (or the server could just be down).
                </Text>
                <TouchableOpacity
                    className="mt-6 px-6 py-3 rounded-lg bg-primary flex-row items-center"
                    onPress={handleRefresh}
                    disabled={isRetryingRefresh}
                >
                    {isRetryingRefresh ? (
                        <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                    ) : (
                        <Ionicons name="refresh-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    )}
                    <Text className="text-on-primary font-medium">
                        {isRetryingRefresh ? "Retrying..." : "Try Again"}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    } else if (authStoreStatus === AuthStoreStatus.VERSION_MISMATCH) {
        const requiredVersion = Platform.OS === 'ios'
            ? versionInfo?.minIOSBuildVersion 
            : versionInfo?.minAndroidBuildVersion;
        return (
            <View
                onLayout={hidesplash}
                className="flex-1 justify-center items-center bg-background px-8"
            >
                <Ionicons name="close-circle-outline" size={64} color={getColor("error")} />
                <Text className="mt-4 text-on-background text-center text-lg">
                    Client update required
                </Text>
                <Text className="mt-2 text-on-surface-variant text-center">
                    Current Version: {Application.nativeApplicationVersion}
                </Text>
                <Text className="mt-2 text-on-surface-variant text-center">
                    Current Build: {Application.nativeBuildVersion}
                </Text>
                {requiredVersion && (
                    <Text className="mt-1 text-on-surface-variant text-center">
                        Required Build: {requiredVersion}+
                    </Text>
                )}
            </View>
        );
    }

    return (
        <ModuleProvider>
            <ToastProvider>
                <AlertProvider>
                    <ThemeProvider value={theme}>
                        <AppNavigator onLayout={hidesplash}>
                            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                            <Stack screenOptions={{ header: () => null }}>
                                <Stack.Screen name="(auth)" />
                                <Stack.Screen name="(tabs)" />
                            </Stack>
                        </AppNavigator>
                    </ThemeProvider>
                </AlertProvider>
            </ToastProvider>
        </ModuleProvider>
    );
};

export default function RootLayout() {
    return (
        <CustomThemeProvider>
            <AppContent />
        </CustomThemeProvider>
    );
}