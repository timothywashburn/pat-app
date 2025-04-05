import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Define a fallback storage for web environments
class WebStorage {
    private static getLocalStorage(): Storage | null {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
        return null;
    }

    static async setItem(key: string, value: string): Promise<void> {
        const localStorage = WebStorage.getLocalStorage();
        if (localStorage) {
            localStorage.setItem(key, value);
        }
    }

    static async getItem(key: string): Promise<string | null> {
        const localStorage = WebStorage.getLocalStorage();
        if (localStorage) {
            return localStorage.getItem(key);
        }
        return null;
    }

    static async removeItem(key: string): Promise<void> {
        const localStorage = WebStorage.getLocalStorage();
        if (localStorage) {
            localStorage.removeItem(key);
        }
    }
}

/**
 * Wrapper around Expo SecureStore for storing sensitive information
 * with fallback to localStorage for web environments
 */
class SecureStorage {
    private static instance: SecureStorage;
    private tokenService = 'dev.timothyw.pat';

    private constructor() {}

    public static get shared(): SecureStorage {
        if (!SecureStorage.instance) {
            SecureStorage.instance = new SecureStorage();
        }
        return SecureStorage.instance;
    }

    private getKey(key: string): string {
        // Replace colons with dots as they're not supported in some environments
        return `${this.tokenService}.${key}`;
    }

    async saveTokens(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
        try {
            const key = this.getKey('tokens');
            const value = JSON.stringify(tokens);

            if (Platform.OS === 'web') {
                await WebStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.error('Failed to save tokens:', error);
            throw error;
        }
    }

    async getTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
        try {
            const key = this.getKey('tokens');
            let tokens;

            if (Platform.OS === 'web') {
                tokens = await WebStorage.getItem(key);
            } else {
                tokens = await SecureStore.getItemAsync(key);
            }

            return tokens ? JSON.parse(tokens) : null;
        } catch (error) {
            console.error('Failed to get tokens:', error);
            return null;
        }
    }

    async saveUserInfo(userInfo: any): Promise<void> {
        try {
            const key = this.getKey('userInfo');
            const value = JSON.stringify(userInfo);

            if (Platform.OS === 'web') {
                await WebStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.error('Failed to save user info:', error);
            throw error;
        }
    }

    async getUserInfo(): Promise<any | null> {
        try {
            const key = this.getKey('userInfo');
            let userInfo;

            if (Platform.OS === 'web') {
                userInfo = await WebStorage.getItem(key);
            } else {
                userInfo = await SecureStore.getItemAsync(key);
            }

            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Failed to get user info:', error);
            return null;
        }
    }

    async clearStoredAuth(): Promise<void> {
        try {
            const tokenKey = this.getKey('tokens');
            const userInfoKey = this.getKey('userInfo');

            if (Platform.OS === 'web') {
                await WebStorage.removeItem(tokenKey);
                await WebStorage.removeItem(userInfoKey);
            } else {
                await SecureStore.deleteItemAsync(tokenKey);
                await SecureStore.deleteItemAsync(userInfoKey);
            }
        } catch (error) {
            console.error('Failed to clear auth data:', error);
            throw error;
        }
    }
}

export default SecureStorage;