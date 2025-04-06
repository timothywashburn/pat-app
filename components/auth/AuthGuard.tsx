import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import {useAuth} from "@/contexts/AuthProvider";

export default function AuthGuard({ children }: { children: JSX.Element }) {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!isAuthenticated && !inAuthGroup) {
            // Redirect to the sign-in page if not authenticated and not in auth group
            router.replace('/auth/login');
        } else if (isAuthenticated && inAuthGroup) {
            // Redirect to the home page if authenticated and in auth group
            router.replace('/');
        }
    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        // Return loading screen while auth state is loading
        return <Stack />;
    }

    return children;
}