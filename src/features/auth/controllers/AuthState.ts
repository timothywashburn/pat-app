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
import { Logger } from "@/src/features/dev/components/Logger";

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
        Logger.debug('auth', 'call to SecureStorage.shared.getUserInfo()');
        const userInfo = await SecureStorage.shared.getUserInfo();
        if (userInfo) {
            Logger.debug('auth', 'userInfo found in storage', userInfo);
            set({ userInfo });
        }

        Logger.debug('auth', 'call to SecureStorage.shared.getTokens()');
        const tokens = await SecureStorage.shared.getTokens();
        if (!tokens?.refreshToken) {
            Logger.debug('auth', 'no tokens found in storage');
            return;
        }

        Logger.debug('auth', 'tokens found in storage', tokens);
        set({ authToken: tokens.accessToken });

        try {
            Logger.debug('auth', 'attempting to refresh auth');
            await get().refreshAuth();
            Logger.debug('auth', 'auth refresh successful');
            set({ isAuthenticated: true });
            console.log('auth restored from storage');
        } catch (error) {
            Logger.error('auth', 'auth refresh failed', error);
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
        Logger.debug('auth', 'refreshing auth token');
        const tokens = await SecureStorage.shared.getTokens();
        if (!tokens?.refreshToken) {
            Logger.error('auth', 'no refresh token found, cannot refresh auth');
            throw new Error(AuthError.REFRESH_FAILED);
        }

        Logger.debug('auth', 'refresh token found, proceeding with refresh');
        const response = await NetworkManager.shared.perform<RefreshAuthRequest, RefreshAuthResponse>({
            endpoint: '/api/auth/refresh',
            method: HTTPMethod.POST,
            body: { refreshToken: tokens.refreshToken },
        });

        Logger.debug('auth', 'refresh response received', response);

        if (!response.tokenData || !response.authData) {
            throw new Error(AuthError.INVALID_RESPONSE);
        }

        const newTokens: AuthTokens = {
            accessToken: response.tokenData.accessToken,
            refreshToken: response.tokenData.refreshToken,
        };

        Logger.debug('auth', 'updating tokens and user info in storage');
        await SecureStorage.shared.saveTokens(newTokens);
        Logger.debug('auth', 'tokens saved successfully');
        set({
            authToken: newTokens.accessToken,
            isAuthenticated: true
        });
        Logger.debug('auth', 'auth refresh completed successfully');
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