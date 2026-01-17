import "@/global.css"

import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from "react";
import { AuthStoreStatus, useAuthStore } from "@/src/stores/useAuthStore";
import { Platform } from 'react-native';
import SocketService from '@/src/services/SocketService';
import { NavigationContainer, ThemeProvider } from "@react-navigation/native";
import { CustomThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { ToastProvider } from "@/src/components/toast/ToastContext";
import { AlertProvider } from "@/src/components/alert";
import RootNavigator from "@/src/navigation/RootNavigator";
import { navigationRef } from "@/src/navigation/navigationRef";
import { linking } from "@/src/navigation/linking";
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { UserDataStoreStatus, useUserDataStore } from "@/src/stores/useUserDataStore";
import { Logger } from "@/src/features/dev/components/Logger";
import LogViewer from "@/src/features/dev/components/LogViewer";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ModuleProvider } from "@/src/components/ModuleContext";
import * as Application from 'expo-application';
import { useNavigationStore } from "@/src/stores/useNavigationStore";
import { HeaderControlsProvider } from '@/src/context/HeaderControlsContext';
import { ModalProvider } from '@/src/context/ModalContext';
import { useAppFocus } from "@/src/hooks/useAppFocus";
import { processWidgetActionQueue } from "@/src/utils/widgetSync";
import { useHabitsStore } from "@/src/stores/useHabitsStore";
import { HabitEntryStatus } from "@timothyw/pat-common";
import { registerRootComponent } from "expo";
import Constants, { ExecutionEnvironment } from 'expo-constants';

const DEV_BOOT = false;

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

// TODO: temp widget debugging
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let ExtensionStorage: any = null;
let AppleLiveActivityModule: any = null;
let widgetStorage: any = null;

if (!isExpoGo && Platform.OS === 'ios') {
    ExtensionStorage = require("@bacons/apple-targets").ExtensionStorage;
    AppleLiveActivityModule = require("@/modules/apple-live-activity").default;
    widgetStorage = new ExtensionStorage('group.dev.timothyw.patapp');
}

const AppContent: React.FC = () => {
    const { theme, colorScheme, getColor } = useTheme();
    const { authStoreStatus, initializeAuth, refreshAuth, versionInfo } = useAuthStore();
    const { userDataStoreStatus, loadUserData } = useUserDataStore();
    const [showDevTerminal, setShowDevTerminal] = useState(DEV_BOOT);
    const [isRetryingRefresh, setIsRetryingRefresh] = useState(false);

    const navigationStore = useNavigationStore();

    const { markHabitEntry, syncToWidget } = useHabitsStore();

    // TODO: temp widget debugging
    useEffect(() => {
        // if (isExpoGo) {
        //     console.log('[Native Modules] Running in Expo Go - native modules disabled');
        //     return;
        // }
        //
        // if (!widgetStorage || !AppleLiveActivityModule) {
        //     console.log('[Native Modules] Native modules not available');
        //     return;
        // }
        //
        // widgetStorage.set('test', 'Hello World!');
        // ExtensionStorage.reloadWidget();
        //
        // // Start Live Activity for testing
        // if (Platform.OS === 'ios') {
        //     console.log('[Live Activity] Starting Live Activity with emoji: 🎉');
        //     try {
        //         AppleLiveActivityModule.startLiveActivity("🎉");
        //         console.log('[Live Activity] ✅ Live Activity started!');
        //     } catch (error: any) {
        //         console.error('[Live Activity] ❌ Failed to start Live Activity:', error);
        //         console.error('[Live Activity] Error details:', error.message);
        //     }
        // }
    }, []);

    const processWidgetActions = useCallback(async () => {
        if (authStoreStatus === AuthStoreStatus.AUTHENTICATED_NO_EMAIL ||
            authStoreStatus === AuthStoreStatus.FULLY_AUTHENTICATED) {
            try {
                const action = await processWidgetActionQueue();
                if (action) {
                    Logger.debug('unclassified', 'processing widget action', action);
                    try {
                        await markHabitEntry(action.habitId, action.date as any, HabitEntryStatus.COMPLETED);
                        await syncToWidget();
                        Logger.debug('unclassified', 'widget action processed successfully');
                    } catch (error) {
                        Logger.error('unclassified', 'failed to process widget action', error);
                    }
                }
            } catch (error) {
                Logger.error('unclassified', 'failed to read widget action queue', error);
            }
        }
    }, [authStoreStatus, markHabitEntry, syncToWidget]);

    useEffect(() => {
        if (Platform.OS !== 'ios') return;

        // TODO: whole feature needs fixing
        // const interval = setInterval(() => {
        //     processWidgetActions();
        // }, 500);
        //
        // return () => clearInterval(interval);
    }, [processWidgetActions]);

    useAppFocus(useCallback(() => {
        if (authStoreStatus === AuthStoreStatus.AUTHENTICATED_NO_EMAIL ||
            authStoreStatus === AuthStoreStatus.FULLY_AUTHENTICATED) {
            Logger.debug('auth', 'app refocused, refreshing token');
            refreshAuth().catch((error) => {
                Logger.error('auth', 'failed to refresh token on app refocus', error);
            });

            // Process widget actions immediately on focus
            processWidgetActions();
        }
    }, [authStoreStatus, refreshAuth, processWidgetActions]));

    // prevent tab scrolling in forms
    // useEffect(() => {
    //     if (pathname.toLowerCase().includes("form")) {
    //         navigationStore.setEnabled(false);
    //     } else {
    //         navigationStore.setEnabled(true);
    //     }
    // }, [pathname]);

    // Listen for actual URL changes and prevent detail screen URLs
    // useEffect(() => {
    //     if (Platform.OS !== 'web') return;
    //
    //     const handleUrlChange = () => {
    //         const pathname = window.location.pathname;
    //         const search = window.location.search;
    //
    //         // remove everything after and including the first capital letter
    //         const newPathname = pathname.replace(/\/[A-Z][^\/]*/g, '');
    //         if (newPathname !== pathname || search) {
    //             console.log(`overriding url change, changing ${pathname + search} to ${newPathname}`);
    //             window.history.replaceState(null, '', newPathname);
    //         }
    //     };
    //
    //     // Listen for popstate events (back/forward)
    //     window.addEventListener('popstate', handleUrlChange);
    //
    //     // Listen for pushState/replaceState calls
    //     const originalPushState = window.history.pushState;
    //     const originalReplaceState = window.history.replaceState;
    //
    //     window.history.pushState = function(...args) {
    //         originalPushState.apply(this, args);
    //         setTimeout(handleUrlChange, 0);
    //     };
    //
    //     window.history.replaceState = function(...args) {
    //         originalReplaceState.apply(this, args);
    //         setTimeout(handleUrlChange, 0);
    //     };
    //
    //     return () => {
    //         window.removeEventListener('popstate', handleUrlChange);
    //         window.history.pushState = originalPushState;
    //         window.history.replaceState = originalReplaceState;
    //     };
    // }, []);

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
            // const cleanup = DeepLinkHandler.initialize();
            Logger.debug('startup', 'deep links initialized successfully');

            // return cleanup;
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
        <SafeAreaProvider>
            <ModuleProvider>
                <HeaderControlsProvider>
                    <ModalProvider>
                        <ToastProvider>
                            <AlertProvider>
                                <ThemeProvider value={theme}>
                                    <NavigationContainer theme={theme} ref={navigationRef} linking={linking}>
                                        <View style={{ flex: 1 }} onLayout={hidesplash}>
                                            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                                            <RootNavigator />
                                        </View>
                                    </NavigationContainer>
                                </ThemeProvider>
                            </AlertProvider>
                        </ToastProvider>
                    </ModalProvider>
                </HeaderControlsProvider>
            </ModuleProvider>
        </SafeAreaProvider>
    );
};

export default function RootLayout() {
    return (
        <CustomThemeProvider>
            <AppContent />
        </CustomThemeProvider>
    );
}

registerRootComponent(RootLayout);