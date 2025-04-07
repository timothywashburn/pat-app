import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/AuthState';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({children}) => {
    const {isAuthenticated, isLoading} = useAuthStore();

    if (isLoading) return null;
    if (!isAuthenticated) return <Redirect href="/(auth)/login"/>;
    return <>{children}</>;
};

export default AuthGuard;