import React, { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/AuthState';
import { View } from 'react-native';
import { useDataStore } from "@/src/features/settings/controllers/DataStore";

function AppNavigator({ children, onLayout }: { children: React.ReactNode, onLayout?: () => void }) {
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();
    const { isAuthenticated, isLoading, userInfo } = useAuthStore();
    const { getFirstModule } = useDataStore();

    const isInAuthGroup = segments[0] === '(auth)';
    const isVerifyPage = pathname === '/verify';

    useEffect(() => {
        console.log('navigation state changed', {
            isAuthenticated,
            isLoading,
            isEmailVerified: userInfo?.isEmailVerified,
            currentSegment: segments[0]
        });

        if (isLoading) {
            return;
        }

        const isEmailVerified = userInfo?.isEmailVerified === true;

        if (isAuthenticated) {
            if (isEmailVerified) {
                if (isInAuthGroup) {
                    router.replace(`/(tabs)/${getFirstModule()}`);
                }
            } else {
                if (!isVerifyPage) {
                    router.replace('/(auth)/verify');
                }
            }
        } else {
            if (!isInAuthGroup || isVerifyPage) {
                router.replace('/(auth)/sign-in');
            }
        }

    }, [isAuthenticated, isLoading, userInfo?.isEmailVerified, segments, router, getFirstModule]);

    return (
        <View style={{ flex: 1 }} onLayout={onLayout}>
            {children}
        </View>
    );
}

export default AppNavigator;