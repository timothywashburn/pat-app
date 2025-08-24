import React, { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { AuthStoreStatus, useAuthStore } from '@/src/stores/useAuthStore';
import { View } from 'react-native';
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { Logger } from "@/src/features/dev/components/Logger";

function AppNavigator({ children, onLayout }: { children: React.ReactNode, onLayout?: () => void }) {
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();
    const { authStoreStatus } = useAuthStore();
    const { getFirstModule } = useUserDataStore();

    useEffect(() => {
        Logger.debug('unclassified', 'navigation state changed', {
            authStoreStatus,
            segments,
            pathname,
        });

        const isInAuthGroup = segments[0] === '(auth)';
        const isInPublicGroup = segments[0] === '(public)';
        const isVerifyPage = pathname === '/verify';

        if (isInPublicGroup) return;

        if (authStoreStatus == AuthStoreStatus.FULLY_AUTHENTICATED) {
            if (isInAuthGroup) router.replace(`/(tabs)/${getFirstModule()}`);
        } else if (authStoreStatus == AuthStoreStatus.AUTHENTICATED_NO_EMAIL) {
            if (!isVerifyPage) router.replace('/(auth)/verify');
        } else if (authStoreStatus == AuthStoreStatus.NOT_AUTHENTICATED) {
            if (!isInAuthGroup) router.replace('/(auth)/sign-in');
        }

    }, [authStoreStatus, segments, router, getFirstModule]);

    return (
        <View style={{ flex: 1 }} onLayout={onLayout}>
            {children}
        </View>
    );
}

export default AppNavigator;