import { create } from 'zustand';
import { AuthError, UserInfo } from '@/src/features/auth/models/auth';
import NetworkManager, { HTTPMethod } from '../../../services/NetworkManager';
import SecureStorage from '../../../services/SecureStorage';
import {
    AuthTokens,
    SignInRequest,
    SignInResponse,
    RefreshAuthRequest,
    RefreshAuthResponse,
    CreateAccountRequest,
    CreateAccountResponse,
    ResendVerificationResponse
} from "@timothyw/pat-common";

interface AuthState {
    isAuthenticated: boolean;
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
    userInfo: null,
    authToken: null,

    initializeAuth: async () => {
        const userInfo = await SecureStorage.shared.getUserInfo();
        if (userInfo) {
            set({ userInfo });
        }

        const tokens = await SecureStorage.shared.getTokens();
        if (!tokens?.refreshToken) {
            return;
        }

        set({ authToken: tokens.accessToken });

        try {
            await get().refreshAuth();
            set({ isAuthenticated: true });
            console.log('auth restored from storage');
        } catch (error) {
            console.log('stored auth invalid, clearing');
            get().signOut();
        }
    },

    signIn: async (email: string, password: string) => {
        console.log(`attempting sign in: ${email}`);

        const response = await NetworkManager.shared.perform<SignInRequest, SignInResponse>({
            endpoint: '/api/auth/sign-in',
            method: HTTPMethod.POST,
            body: { email, password },
        });

        if (!response.tokenData || !response.authData || !response.user) {
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

        console.log('sign in successful');
    },

    createAccount: async (name: string, email: string, password: string) => {
        await NetworkManager.shared.perform<CreateAccountRequest, CreateAccountResponse>({
            endpoint: '/api/auth/create-account',
            method: HTTPMethod.POST,
            body: { name, email, password },
        });

        await get().signIn(email, password);
    },

    resendVerificationEmail: async () => {
        const { authToken } = get();
        if (!authToken) return;

        await NetworkManager.shared.perform<undefined, ResendVerificationResponse>({
            endpoint: '/api/auth/resend-verification',
            method: HTTPMethod.POST,
            token: authToken,
        });
    },

    refreshAuth: async () => {
        const tokens = await SecureStorage.shared.getTokens();
        if (!tokens?.refreshToken) {
            throw new Error(AuthError.REFRESH_FAILED);
        }

        const response = await NetworkManager.shared.perform<RefreshAuthRequest, RefreshAuthResponse>({
            endpoint: '/api/auth/refresh',
            method: HTTPMethod.POST,
            body: { refreshToken: tokens.refreshToken },
        });

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
            isAuthenticated: true
        });
    },

    signOut: () => {
        SecureStorage.shared.clearStoredAuth();
        set({
            userInfo: null,
            authToken: null,
            isAuthenticated: false,
        });
    },

    updateUserInfo: (update) => {
        const { userInfo } = get();
        if (!userInfo) return;

        const updatedUserInfo = { ...userInfo };
        update(updatedUserInfo);

        set({ userInfo: updatedUserInfo });
        SecureStorage.shared.saveUserInfo(updatedUserInfo);
    },
}));

export const setAuthState = useAuthStore.setState;
export const AuthState = useAuthStore;