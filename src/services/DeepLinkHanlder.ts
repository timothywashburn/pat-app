import { Linking } from 'react-native';
import { router } from 'expo-router';

class DeepLinkHandler {
    static handleURL(url: URL): void {
        try {
            const components = url.pathname;
            console.log(`[deeplink] handling url: ${url.toString()}`);

            switch (components) {
                case '/redirect':
                    console.log('[deeplink] handling redirect');
                    // Implement redirect handling
                    break;
                default:
                    console.log(`[deeplink] unhandled path: ${components}`);
                    break;
            }
        } catch (error) {
            console.error('[deeplink] error handling URL:', error);
        }
    }

    static initialize(): void {
        // Handle deep links when the app is already open
        Linking.addEventListener('url', ({ url }) => {
            if (url) {
                DeepLinkHandler.handleURL(new URL(url));
            }
        });

        // Handle deep links when the app is opened from a link
        Linking.getInitialURL().then((url) => {
            if (url) {
                DeepLinkHandler.handleURL(new URL(url));
            }
        });
    }
}

export default DeepLinkHandler;