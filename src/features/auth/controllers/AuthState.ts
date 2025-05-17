import { create } from 'zustand';
import { AuthError, UserInfo } from '@/src/features/auth/models/auth';
import NetworkManager, { HTTPMethod } from '../../../services/NetworkManager';
import SecureStorage from '../../../services/SecureStorage';
import {
    AuthTokens,
    SignInRequest,
    SignInResponse, RefreshAuthRequest,
    RefreshAuthResponse,
    CreateAccountRequest,
    CreateAccountResponse, ResendVerificationResponse
} from "@timothyw/pat-common";

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    userInfo: UserInfo | null;
    authToken: string | null;

    initializeAuth: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    createAccount: (name: string, email: string, password: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    signOut: () => void;
    updateUserInfo: (update: (userInfo: UserInfo) => void) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    isLoading: true,
    userInfo: null,
    authToken: null,

    initializeAuth: async () => {
        try {
            const userInfo = await SecureStorage.shared.getUserInfo();
            if (userInfo) {
                set({userInfo});
            }

            const tokens = await SecureStorage.shared.getTokens();
            if (tokens) {
                set({authToken: tokens.accessToken});

                try {
                    await get().refreshAuth();
                    set({isAuthenticated: true});
                } catch (error) {
                    console.log('auth refresh failed, signing out', error);
                    get().signOut();
                }
            }
        } catch (error) {
            console.error('failed to initialize auth state:', error);
        }
    },

    signIn: async (email: string, password: string) => {
        console.log(`signing in with email (${process.env.EXPO_PUBLIC_API_URL}): ${email}`);

        try {
            const request = {
                endpoint: '/api/auth/sign-in',
                method: HTTPMethod.POST,
                body: {
                    email,
                    password
                },
            };

            const response = await NetworkManager.shared.perform<SignInRequest, SignInResponse>(request);

            if (!response.tokenData ||!response.authData || !response.user) {
                throw new Error(AuthError.INVALID_RESPONSE);
            }

            const tokens: AuthTokens = {
                accessToken: response.tokenData.accessToken,
                refreshToken: response.tokenData.refreshToken,
            };

            const userInfo: UserInfo = {
                id: response.user._id,
                email: response.authData.email,
                name: response.user.name,
                isEmailVerified: response.authData.emailVerified,
            };

            await SecureStorage.shared.saveTokens(tokens);
            await SecureStorage.shared.saveUserInfo(userInfo);

            set({
                userInfo,
                authToken: tokens.accessToken,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error('sign in failed:', error);
            throw error;
        }
    },

    createAccount: async (name: string, email: string, password: string) => {
        try {
            const request = {
                endpoint: '/api/auth/create-account',
                method: HTTPMethod.POST,
                body: {name, email, password},
            };

            await NetworkManager.shared.perform<CreateAccountRequest, CreateAccountResponse>(request);

            await get().signIn(email, password);
        } catch (error) {
            console.error('account registration failed:', error);
            throw error;
        }
    },

    resendVerificationEmail: async () => {
        const {authToken} = get();

        if (!authToken) {
            return;
        }

        try {
            const request = {
                endpoint: '/api/auth/resend-verification',
                method: HTTPMethod.POST,
                token: authToken,
            };

            await NetworkManager.shared.perform<undefined, ResendVerificationResponse>(request);
        } catch (error) {
            console.error('failed to resend verification email:', error);
            throw error;
        }
    },

    refreshAuth: async () => {
        const tokens = await SecureStorage.shared.getTokens();

        if (!tokens?.refreshToken) {
            throw new Error(AuthError.REFRESH_FAILED);
        }

        try {
            const request = {
                endpoint: '/api/auth/refresh',
                method: HTTPMethod.POST,
                body: {refreshToken: tokens.refreshToken},
            };

            const response = await NetworkManager.shared.perform<RefreshAuthRequest, RefreshAuthResponse>(request);

            if (!response.tokenData || !response.authData) {
                throw new Error(AuthError.INVALID_RESPONSE);
            }

            const newTokens: AuthTokens = {
                accessToken: response.tokenData.accessToken,
                refreshToken: response.tokenData.refreshToken,
            };

            await SecureStorage.shared.saveTokens(newTokens);

            set({
                authToken: newTokens.accessToken,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error('auth refresh failed:', error);
            get().signOut();
        }
    },

    signOut: () => {
        SecureStorage.shared.clearStoredAuth();

        set({
            userInfo: null,
            authToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    updateUserInfo: (update) => {
        const {userInfo} = get();

        if (!userInfo) {
            return;
        }

        const updatedUserInfo = {...userInfo};
        update(updatedUserInfo);

        set({userInfo: updatedUserInfo});
        SecureStorage.shared.saveUserInfo(updatedUserInfo);
    },
}));

export const setAuthState = useAuthStore.setState;
export const AuthState = useAuthStore;