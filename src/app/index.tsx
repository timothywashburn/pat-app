import { Redirect } from 'expo-router';
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { ExtensionStorage } from "@bacons/apple-targets";
import { useEffect } from "react";
import { Platform } from "react-native";
import AppleLiveActivityModule from "@/modules/apple-live-activity";

const widgetStorage = new ExtensionStorage('group.dev.timothyw.patapp')

export default function Index() {
    const { getFirstModule } = useUserDataStore();

    useEffect(() => {
        widgetStorage.set('test', 'Hello World!');
        ExtensionStorage.reloadWidget();

        // Start Live Activity for testing
        if (Platform.OS === 'ios') {
            console.log('[Live Activity] Starting Live Activity with emoji: 🎉');
            try {
                console.log(AppleLiveActivityModule.hello());
                AppleLiveActivityModule.startLiveActivity("🎉");
                console.log('[Live Activity] ✅ Live Activity start command sent!');
            } catch (error: any) {
                console.error('[Live Activity] ❌ Failed to start Live Activity:', error);
                console.error('[Live Activity] Error details:', error.message);
            }
        }
    }, []);

    return <Redirect href={`/(tabs)/${getFirstModule()}`} />;
}