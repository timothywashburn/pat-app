import { Redirect } from 'expo-router';
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { useEffect } from "react";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Only import native modules if NOT running in Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let ExtensionStorage: any = null;
let AppleLiveActivityModule: any = null;
let widgetStorage: any = null;

if (!isExpoGo && Platform.OS === 'ios') {
    ExtensionStorage = require("@bacons/apple-targets").ExtensionStorage;
    AppleLiveActivityModule = require("@/modules/apple-live-activity").default;
    widgetStorage = new ExtensionStorage('group.dev.timothyw.patapp');
}

export default function Index() {
    const { getFirstModule } = useUserDataStore();

    useEffect(() => {
        if (isExpoGo) {
            console.log('[Native Modules] Running in Expo Go - native modules disabled');
            return;
        }

        if (!widgetStorage || !AppleLiveActivityModule) {
            console.log('[Native Modules] Native modules not available');
            return;
        }

        widgetStorage.set('test', 'Hello World!');
        ExtensionStorage.reloadWidget();

        // Start Live Activity for testing
        if (Platform.OS === 'ios') {
            console.log('[Live Activity] Starting Live Activity with emoji: 🎉');
            try {
                AppleLiveActivityModule.startLiveActivity("🎉");
                console.log('[Live Activity] ✅ Live Activity started!');
            } catch (error: any) {
                console.error('[Live Activity] ❌ Failed to start Live Activity:', error);
                console.error('[Live Activity] Error details:', error.message);
            }
        }
    }, []);

    return <Redirect href={`/(tabs)/${getFirstModule()}`} />;
}