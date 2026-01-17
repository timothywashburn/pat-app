import { create } from 'zustand';
import { AuthError } from '@/src/features/auth/models/auth';
import SecureStorage from '../services/SecureStorage';
import {
    AuthTokens,
    SignInRequest,
    SignInResponse,
    RefreshAuthRequest,
    RefreshAuthResponse,
    CreateAccountRequest,
    CreateAccountResponse,
    ResendVerificationResponse, PublicAuthData, VersionResponse
} from "@timothyw/pat-common";
import { Logger } from "@/src/features/dev/components/Logger";
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import Constants from "expo-constants";
import { HTTPMethod } from "@/src/hooks/useNetworkRequestTypes";
import { performAuthenticatedRequest, performUnauthenticatedRequest } from "@/src/utils/networkUtils";

export class NetworkError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export enum AuthStoreStatus {
    NOT_INITIALIZED = 'not_initialized',
    VERSION_MISMATCH = 'version_mismatch',
    SERVER_ERROR = 'server_error',
    NOT_AUTHENTICATED = 'not_authenticated',
    AUTHENTICATED_NO_EMAIL = 'authenticated_no_email',
    FULLY_AUTHENTICATED = 'fully_authenticated'
}

interface UseAuthStore {
    authStoreStatus: AuthStoreStatus;

    authTokens: AuthTokens | null;
    authData: PublicAuthData | null;
    versionInfo: VersionResponse | null;

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
    versionInfo: null,

    initializeAuth: async () => {
        const authTokens = await SecureStorage.shared.getTokens();
        if (!authTokens?.refreshToken) {
            Logger.debug('auth', 'no tokens found in storage');
            get().signOut();
            // TODO: shouldn't it be setting the status to NOT_AUTHENTICATED?
            return;
        }

        set({ authTokens });

        if (__DEV__) {
            Logger.debug('auth', 'running in development mode, skipping version check');
        } else if (Constants.expoConfig?.extra?.APP_VARIANT === 'preview') {
            Logger.debug('auth', 'running in preview mode, skipping version check');
        } else if (Platform.OS === 'web') {
            Logger.debug('auth', 'running on web, skipping version check');
        } else {
            try {
                const buildVersion = Application.nativeBuildVersion;
                const platformParam = Platform.OS === 'ios' ? 'iOSBuildVersion' : 'androidBuildVersion';
                const response = await performUnauthenticatedRequest<undefined, VersionResponse>({
                    endpoint: `/api/version?${platformParam}=${buildVersion}`,
                    method: HTTPMethod.GET,
                });

                if (!response.success) throw new Error('Failed to fetch version info');

                set({ versionInfo: response });

                if (response.updateRequired) {
                    set({
                        authStoreStatus: AuthStoreStatus.VERSION_MISMATCH
                    });
                    return;
                }

                Logger.info('auth', 'version check successful');
            } catch (error) {
                Logger.error('auth', 'version check failed', error);
                if (error instanceof NetworkError && error.status >= 500) {
                    set({ authStoreStatus: AuthStoreStatus.SERVER_ERROR });
                    throw new Error(AuthError.SERVER_ERROR);
                }

                throw error;
            }
        }

        try {
            Logger.debug('auth', 'attempting to refresh auth');
            await get().refreshAuth();
            Logger.debug('auth', 'auth refresh successful');
        } catch (error) {
            if (error instanceof NetworkError && error.status == 401) {
                Logger.debug('auth', 'refresh failed (401 unauthorized), signing out');
                get().signOut();
                return;
            }
            Logger.error('auth', 'auth refresh failed', error);
        }
    },

    signIn: async (email: string, password: string) => {
        Logger.info('auth', 'signing in with email', email);

        try {
            const response = await performUnauthenticatedRequest<SignInRequest, SignInResponse>({
                endpoint: '/api/auth/sign-in',
                method: HTTPMethod.POST,
                body: { email, password },
            });

            if (!response.success) throw new Error('Sign in failed');

            await SecureStorage.shared.saveTokens(response.tokenData);

            set({
                authStoreStatus: response.authData.emailVerified ? AuthStoreStatus.FULLY_AUTHENTICATED : AuthStoreStatus.AUTHENTICATED_NO_EMAIL,
                authTokens: response.tokenData,
                authData: response.authData,
            });

            Logger.info('auth', 'sign in successful');
        } catch (error) {
            Logger.error('auth', 'sign in failed', error);
            if (error instanceof NetworkError && error.status >= 500) {
                throw new Error(AuthError.SERVER_ERROR);
            }
            throw error;
        }
    },

    createAccount: async (name: string, email: string, password: string) => {
        await performUnauthenticatedRequest<CreateAccountRequest, CreateAccountResponse>({
            endpoint: '/api/auth/create-account',
            method: HTTPMethod.POST,
            body: { name, email, password },
        });

        await get().signIn(email, password);
    },

    resendVerificationEmail: async () => {
        const tokens = get().authTokens;
        if (!tokens) throw new Error('No auth tokens available');
        
        await performAuthenticatedRequest<undefined, ResendVerificationResponse>({
            endpoint: '/api/auth/resend-verification',
            method: HTTPMethod.POST,
        });
    },

    refreshAuth: async () => {
        const tokens = await SecureStorage.shared.getTokens();
        if (!tokens?.refreshToken) {
            throw new Error(AuthError.REFRESH_FAILED);
        }

        try {
            const response = await performUnauthenticatedRequest<RefreshAuthRequest, RefreshAuthResponse>({
                endpoint: '/api/auth/refresh',
                method: HTTPMethod.POST,
                body: { refreshToken: tokens.refreshToken },
            });

            if (!response.success) throw new Error('Failed to refresh auth');

            await SecureStorage.shared.saveTokens(response.tokenData);

            set({
                authStoreStatus: response.authData.emailVerified ? AuthStoreStatus.FULLY_AUTHENTICATED : AuthStoreStatus.AUTHENTICATED_NO_EMAIL,
                authTokens: response.tokenData,
                authData: response.authData,
            });

            Logger.info('auth', 'auth refresh successful');
        } catch (error) {
            Logger.error('auth', 'auth refresh failed', error);
            if (error instanceof NetworkError && error.status >= 500) {
                set({ authStoreStatus: AuthStoreStatus.SERVER_ERROR });
                throw new Error(AuthError.SERVER_ERROR);
            } else if (error instanceof NetworkError) {
                throw error;
            }
            throw new Error(AuthError.REFRESH_FAILED);
        }
    },

    signOut: () => {
        SecureStorage.shared.clearStoredAuth();
        set({
            authStoreStatus: AuthStoreStatus.NOT_AUTHENTICATED,
            authTokens: null,
            authData: null,
            versionInfo: null,
        });
    },

    updateAuthData: (update) => {
        const { authData } = get();
        if (!authData) return;

        const updatedUserInfo = { ...authData };
        update(updatedUserInfo);

        // TODO: this is terrible code
        if (!authData.emailVerified && updatedUserInfo.emailVerified) {
            set({ authStoreStatus: AuthStoreStatus.FULLY_AUTHENTICATED });
        }

        set({ authData: updatedUserInfo });
    },
}));