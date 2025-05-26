import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Logger } from "@/src/features/dev/components/Logger";

const VerifySuccess: React.FC = () => {
    const { getColor } = useTheme();

    const handleReturnToApp = () => {
        const deepLinkUrl = 'dev.timothyw.patapp://';
        const appStoreUrl = 'https://apps.apple.com/app/your-app'; // Replace with actual
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=your.package.name'; // Replace with actual

        if (Platform.OS === 'web') {
            console.log("attempting deep link from web browser");

            // Detect mobile browser
            Logger.debug('unclassified', 'navigator.userAgent', navigator.userAgent);
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);

            if (isMobile) {
                // Create a hidden iframe to attempt the deep link
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = deepLinkUrl;
                document.body.appendChild(iframe);

                // Set a timeout to redirect to app store if deep link fails
                const timeout = setTimeout(() => {
                    console.log("deep link failed, redirecting to app store");
                    document.body.removeChild(iframe);

                    if (isIOS) {
                        window.location.href = appStoreUrl;
                    } else if (isAndroid) {
                        // For Android, try intent URL first
                        const intentUrl = `intent://open#Intent;scheme=dev.timothyw.patapp;package=com.yourpackage.name;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`;
                        window.location.href = intentUrl;
                    } else {
                        window.location.href = playStoreUrl;
                    }
                }, 2500);

                // Clear timeout if page loses focus (app likely opened)
                const handleVisibilityChange = () => {
                    if (document.hidden) {
                        console.log("page hidden, deep link likely succeeded");
                        clearTimeout(timeout);
                        document.removeEventListener('visibilitychange', handleVisibilityChange);
                    }
                };

                document.addEventListener('visibilitychange', handleVisibilityChange);

                // Also clear on page blur
                const handleBlur = () => {
                    console.log("page blurred, deep link likely succeeded");
                    clearTimeout(timeout);
                    window.removeEventListener('blur', handleBlur);
                };

                window.addEventListener('blur', handleBlur);

            } else {
                // Desktop browser - show instructions or redirect to web app
                console.log("desktop browser detected");
                alert('Please open this on your mobile device or download our app from the app store.');
            }
        }
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <View className="flex-1 items-center justify-center p-4">
                <View className="bg-surface rounded-lg shadow p-8 w-full max-w-md items-center">
                    <View className="mb-6">
                        <View className="rounded-full bg-success-container p-3">
                            <Ionicons
                                name="checkmark-circle"
                                size={48}
                                color={getColor("on-success-container")}
                            />
                        </View>
                    </View>

                    <Text className="text-on-surface text-2xl font-bold mb-4 text-center">
                        Email Verified!
                    </Text>

                    <Text className="text-on-surface-variant mb-8 text-center">
                        Your email has been successfully verified.
                    </Text>

                    <TouchableOpacity
                        onPress={handleReturnToApp}
                        className="bg-primary h-[50px] rounded-lg justify-center items-center w-full"
                        activeOpacity={0.8}
                    >
                        <Text className="text-on-primary text-base font-semibold">
                            Return to App
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default VerifySuccess;