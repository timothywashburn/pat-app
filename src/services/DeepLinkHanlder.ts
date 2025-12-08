import { Linking } from 'react-native';
import { router } from 'expo-router';
import { DataState } from "@/src/stores/useUserDataStore";
import { Logger } from "@/src/features/dev/components/Logger";

export default class DeepLinkHandler {
    static handleURL(url: string): void {
        try {
            Logger.debug('linking', 'handling url', { url });

            let path = '';
            if (url.includes('://')) {
                // For URL scheme format like "dev.timothyw.patapp://redirect"
                const parts = url.split('://');
                if (parts.length > 1) path = '/' + parts[1];
            } else {
                Logger.debug('linking', 'handling full url', { url });
                const urlObject = new URL(url);
                path = urlObject.pathname;
            }

            Logger.debug('linking', 'extracted path', { path });

            switch (path) {
                case '/':
                    router.replace(`/(tabs)/${DataState.getState().getFirstModule()}`);
                    break;
                case '/redirect':
                    router.replace(`/(public)/verify-success`);
                    break;
                default:
                    console.log(`[deeplink] unhandled path: ${path}`);
                    Logger.debug('linking', 'unhandled path', { path });
                    return;
            }

            Logger.debug('linking', 'handled redirect', { path });
        } catch (error) {
            Logger.error('linking', 'error handling URL', { error });
        }
    }

    static initialize() {
        // Handle deep links when the app is already open
        const subscription = Linking.addEventListener('url', ({ url }) => {
            if (url) {
                console.log('[deeplink] received url event:', url);
                Logger.debug('linking', 'received url event', { url });
                DeepLinkHandler.handleURL(url);
            }
        });

        // Handle deep links when the app is opened from a link
        Linking.getInitialURL().then((url) => {
            if (url) {
                Logger.debug('linking', 'received initial url', { url });
                DeepLinkHandler.handleURL(url);
            } else {
                Logger.debug('linking', 'no initial url');
            }
        }).catch(error => {
            Logger.error('linking', 'error getting initial url', { error });
        });

        return () => {
            subscription.remove();
        };
    }
}