import { Linking } from 'react-native';
import { router } from 'expo-router';
import { DataState } from "@/src/features/settings/controllers/DataStore";

export default class DeepLinkHandler {
    static handleURL(url: string): void {
        try {
            console.log(`[deeplink] handling url: ${url}`);

            let path = '';
            if (url.includes('://')) {
                // For URL scheme format like "dev.timothyw.patapp://redirect"
                const parts = url.split('://');
                if (parts.length > 1) path = '/' + parts[1];
            } else {
                console.log(`[deeplink] Handling full URL: ${url}`);
                const urlObject = new URL(url);
                path = urlObject.pathname;
            }

            console.log(`[deeplink] extracted path: ${path}`);

            switch (path) {
                case '/':
                    router.replace(`/(tabs)/${DataState.getState().getFirstModule()}`);
                    break;
                case '/redirect':
                    router.replace(`/(redirects)/verify-success`);
                    break;
                default:
                    console.log(`[deeplink] unhandled path: ${path}`);
                    return;
            }

            console.log('[deeplink] handled redirect');
        } catch (error) {
            console.error('[deeplink] error handling URL:', error);
        }
    }

    static initialize() {
        // Handle deep links when the app is already open
        const subscription = Linking.addEventListener('url', ({ url }) => {
            if (url) {
                console.log('[deeplink] received url event:', url);
                DeepLinkHandler.handleURL(url);
            }
        });

        // Handle deep links when the app is opened from a link
        Linking.getInitialURL().then((url) => {
            if (url) {
                console.log('[deeplink] received initial url:', url);
                DeepLinkHandler.handleURL(url);
            } else {
                console.log('[deeplink] no initial url');
            }
        }).catch(err => {
            console.error('[deeplink] error getting initial url:', err);
        });

        return () => {
            subscription.remove();
        };
    }
}