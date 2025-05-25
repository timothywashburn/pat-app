import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthTokens } from "@timothyw/pat-common";

/**
 * Wrapper around Expo SecureStore for storing sensitive information
 * with fallback to localStorage for web environments
 */
class SecureStorage {
    private static instance: SecureStorage;
    private tokenService = 'dev.timothyw.patapp';

    private constructor() {
    }

    public static get shared(): SecureStorage {
        if (!SecureStorage.instance) {
            SecureStorage.instance = new SecureStorage();
        }
        return SecureStorage.instance;
    }

    private getKey(key: string): string {
        return `${this.tokenService}.${key}`;
    }

    async getTokens(): Promise<AuthTokens | null> {
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

    async saveTokens(authTokens: AuthTokens): Promise<void> {
        try {
            const key = this.getKey('tokens');
            const value = JSON.stringify(authTokens);

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

    async clearStoredAuth(): Promise<void> {
        try {
            const tokenKey = this.getKey('tokens');

            if (Platform.OS === 'web') {
                await WebStorage.removeItem(tokenKey);
            } else {
                await SecureStore.deleteItemAsync(tokenKey);
            }
        } catch (error) {
            console.error('Failed to clear auth data:', error);
            throw error;
        }
    }
}

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

export default SecureStorage;