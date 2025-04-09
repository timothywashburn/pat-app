import { create } from 'zustand';
import { AuthError, AuthTokens, UserInfo } from '@/src/features/auth/models/auth';
import NetworkManager, { HTTPMethod, NetworkRequest } from '../../../services/NetworkManager';
import SecureStorage from '../../../services/SecureStorage';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    userInfo: UserInfo | null;
    authToken: string | null;

    // Derived state
    isEmailVerified: boolean;

    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    registerAccount: (name: string, email: string, password: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    signOut: () => void;
    updateUserInfo: (update: (userInfo: UserInfo) => void) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
    const handleAuthResponse = async (response: any) => {
        if (!response.token || !response.refreshToken || !response.user) {
            throw new Error(AuthError.INVALID_RESPONSE);
        }

        const tokens: AuthTokens = {
            accessToken: response.token,
            refreshToken: response.refreshToken,
        };

        const userInfo: UserInfo = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            isEmailVerified: response.user.isEmailVerified,
        };

        await SecureStorage.shared.saveTokens(tokens);
        await SecureStorage.shared.saveUserInfo(userInfo);

        set({
            userInfo,
            authToken: tokens.accessToken,
            isAuthenticated: true,
        });

        return { tokens, userInfo };
    };

    return {
        isAuthenticated: false,
        isLoading: true,
        userInfo: null,
        authToken: null,

        get isEmailVerified() {
            return get().userInfo?.isEmailVerified ?? false;
        },

        initialize: async () => {
            try {
                const userInfo = await SecureStorage.shared.getUserInfo();
                if (userInfo) {
                    set({ userInfo });
                }

                const tokens = await SecureStorage.shared.getTokens();
                if (tokens) {
                    set({ authToken: tokens.accessToken });

                    // Try to refresh auth using the refresh token
                    try {
                        await get().refreshAuth();
                        set({ isAuthenticated: true });
                    } catch (error) {
                        console.log('auth refresh failed, signing out', error);
                        get().signOut();
                    }
                }
            } catch (error) {
                console.error('failed to initialize auth state:', error);
            } finally {
                set({ isLoading: false });
            }
        },

        signIn: async (email: string, password: string) => {
            console.log('signing in with email:', email);

            try {
                const request: NetworkRequest = {
                    endpoint: '/api/auth/login',
                    method: HTTPMethod.POST,
                    body: { email, password },
                };

                const response = await NetworkManager.shared.perform(request);
                await handleAuthResponse(response);
            } catch (error) {
                console.error('sign in failed:', error);
                throw error;
            }
        },

        registerAccount: async (name: string, email: string, password: string) => {
            try {
                const request: NetworkRequest = {
                    endpoint: '/api/auth/register',
                    method: HTTPMethod.POST,
                    body: { name, email, password },
                };

                await NetworkManager.shared.perform(request);

                await get().signIn(email, password);
            } catch (error) {
                console.error('account registration failed:', error);
                throw error;
            }
        },

        resendVerificationEmail: async () => {
            const { authToken } = get();

            if (!authToken) {
                return;
            }

            try {
                const request: NetworkRequest = {
                    endpoint: '/api/auth/resend-verification',
                    method: HTTPMethod.POST,
                    token: authToken,
                };

                await NetworkManager.shared.perform(request);
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
                const request: NetworkRequest = {
                    endpoint: '/api/auth/refresh',
                    method: HTTPMethod.POST,
                    body: { refreshToken: tokens.refreshToken },
                };

                const response = await NetworkManager.shared.perform(request);
                await handleAuthResponse(response);
            } catch (error) {
                console.error('auth refresh failed:', error);
                throw error;
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
            const { userInfo } = get();

            if (!userInfo) {
                return;
            }

            const updatedUserInfo = { ...userInfo };
            update(updatedUserInfo);

            set({ userInfo: updatedUserInfo });
            SecureStorage.shared.saveUserInfo(updatedUserInfo);
        },
    };
});

export const AuthState = useAuthStore;