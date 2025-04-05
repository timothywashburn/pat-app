import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../services/AuthState';

export const AuthContext = createContext<{
    isAuthenticated: boolean;
    isLoading: boolean;
    userInfo: any;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    registerAccount: (name: string, email: string, password: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
}>({
    isAuthenticated: false,
    isLoading: true,
    userInfo: null,
    signIn: async () => {},
    signOut: () => {},
    registerAccount: async () => {},
    resendVerificationEmail: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authStore = useAuthStore();

    useEffect(() => {
        // Initialize auth when component mounts
        authStore.initialize();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: authStore.isAuthenticated,
                isLoading: authStore.isLoading,
                userInfo: authStore.userInfo,
                signIn: authStore.signIn,
                signOut: authStore.signOut,
                registerAccount: authStore.registerAccount,
                resendVerificationEmail: authStore.resendVerificationEmail,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};