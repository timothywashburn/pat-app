export interface UserInfo {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export enum AuthError {
    INVALID_CREDENTIALS = 'Invalid email or password',
    NETWORK_ERROR = 'Network error occurred',
    INVALID_RESPONSE = 'Invalid response from server',
    REFRESH_FAILED = 'Failed to refresh authentication',
    SERVER_ERROR = 'Server error occurred',
}