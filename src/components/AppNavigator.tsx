import React, { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/AuthState';

function AppNavigator({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();
    const { isAuthenticated, isLoading, userInfo } = useAuthStore();

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
                    router.replace('/(tabs)/agenda');
                }
            } else {
                if (!isVerifyPage) {
                    router.replace('/(auth)/verify');
                }
            }
        } else {
            if (!isInAuthGroup || isVerifyPage) {
                router.replace('/(auth)/login');
            }
        }

    }, [isAuthenticated, isLoading, userInfo?.isEmailVerified, segments, router]);

    return <>{children}</>;
}

export default AppNavigator;