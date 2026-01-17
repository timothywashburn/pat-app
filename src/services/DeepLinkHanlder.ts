import { Linking } from 'react-native';
import { navigationRef } from '@/src/navigation/navigationRef';
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

            if (!navigationRef.isReady()) {
                Logger.debug('linking', 'navigation not ready, skipping', { path });
                return;
            }

            switch (path) {
                case '/':
                    // Navigate to the first module in the app
                    navigationRef.current?.navigate('AppNavigator' as any);
                    break;
                case '/redirect':
                    // TODO: Handle verify-success route (needs to be added to navigation structure)
                    Logger.debug('linking', 'verify-success redirect not yet implemented', { path });
                    break;
                case '/habits':
                    router.replace('/(tabs)/habits');
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