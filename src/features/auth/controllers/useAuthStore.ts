import { create } from 'zustand';
import { AuthError } from '@/src/features/auth/models/auth';
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
    ResendVerificationResponse, PublicAuthData
} from "@timothyw/pat-common";
import { Logger } from "@/src/features/dev/components/Logger";

export enum AuthStoreStatus {
    NOT_INITIALIZED = 'not_initialized',
    NOT_AUTHENTICATED = 'not_authenticated',
    AUTHENTICATED_NO_EMAIL = 'authenticated_no_email',
    FULLY_AUTHENTICATED = 'fully_authenticated'
}

interface UseAuthStore {
    authStoreStatus: AuthStoreStatus;

    authTokens: AuthTokens | null;
    authData: PublicAuthData | null;

    initializeAuth: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    createAccount: (name: string, email: string, password: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    signOut: () => void;
    updateAuthData: (update: (authData: PublicAuthData) => void) => void;
}

export const useAuthStore = create<UseAuthStore>((set, get) => ({
    authStoreStatus: AuthStoreStatus.NOT_INITIALIZED,

    authTokens: null,
    authData: null,

    initializeAuth: async () => {
        const authTokens = await SecureStorage.shared.getTokens();
        if (!authTokens?.refreshToken) {
            Logger.debug('auth', 'no tokens found in storage');
            get().signOut();
            return;
        }

        set({ authTokens });

        try {
            Logger.debug('auth', 'attempting to refresh auth');
            await get().refreshAuth();
            Logger.debug('auth', 'auth refresh successful');
        } catch (error) {
            Logger.error('auth', 'auth refresh failed', error);
            get().signOut();
        }
    },

    signIn: async (email: string, password: string) => {
        Logger.info('auth', 'signing in with email', email);

        const response = await NetworkManager.shared.performUnauthenticated<SignInRequest, SignInResponse>({
            endpoint: '/api/auth/sign-in',
            method: HTTPMethod.POST,
            body: { email, password },
        });

        await SecureStorage.shared.saveTokens(response.tokenData);

        set({
            authStoreStatus: response.authData.emailVerified ? AuthStoreStatus.FULLY_AUTHENTICATED : AuthStoreStatus.AUTHENTICATED_NO_EMAIL,
            authTokens: response.tokenData,
            authData: response.authData,
        });

        Logger.info('auth', 'sign in successful');
    },

    createAccount: async (name: string, email: string, password: string) => {
        await NetworkManager.shared.performUnauthenticated<CreateAccountRequest, CreateAccountResponse>({
            endpoint: '/api/auth/create-account',
            method: HTTPMethod.POST,
            body: { name, email, password },
        });

        await get().signIn(email, password);
    },

    resendVerificationEmail: async () => {
        await NetworkManager.shared.performAuthenticated<undefined, ResendVerificationResponse>({
            endpoint: '/api/auth/resend-verification',
            method: HTTPMethod.POST,
        });
    },

    refreshAuth: async () => {
        const tokens = await SecureStorage.shared.getTokens();
        if (!tokens?.refreshToken) {
            throw new Error(AuthError.REFRESH_FAILED);
        }

        const response = await NetworkManager.shared.performUnauthenticated<RefreshAuthRequest, RefreshAuthResponse>({
            endpoint: '/api/auth/refresh',
            method: HTTPMethod.POST,
            body: { refreshToken: tokens.refreshToken },
        });

        await SecureStorage.shared.saveTokens(response.tokenData);

        set({
            authStoreStatus: response.authData.emailVerified ? AuthStoreStatus.FULLY_AUTHENTICATED : AuthStoreStatus.AUTHENTICATED_NO_EMAIL,
            authTokens: response.tokenData,
            authData: response.authData,
        });

        Logger.info('auth', 'auth refresh successful');
    },

    signOut: () => {
        SecureStorage.shared.clearStoredAuth();
        set({
            authStoreStatus: AuthStoreStatus.NOT_AUTHENTICATED,
            authTokens: null,
            authData: null,
        });
    },

    updateAuthData: (update) => {
        const { authData } = get();
        if (!authData) return;

        const updatedUserInfo = { ...authData };
        update(updatedUserInfo);

        set({ authData: updatedUserInfo });
    },
}));