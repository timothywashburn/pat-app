import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorage {
    private static instance: LocalStorage;
    private prefix = '@pat-app';

    private constructor() {}

    public static get shared(): LocalStorage {
        if (!LocalStorage.instance) {
            LocalStorage.instance = new LocalStorage();
        }
        return LocalStorage.instance;
    }

    private getKey(key: string): string {
        return `${this.prefix}:${key}`;
    }

    async getThemePreference(): Promise<'light' | 'dark' | 'system'> {
        try {
            const themePreference = await AsyncStorage.getItem(this.getKey('themePreference'));
            if (themePreference === 'light' || themePreference === 'dark' || themePreference === 'system') {
                return themePreference;
            }
            return 'system';
        } catch (error) {
            console.error('Failed to get theme preference:', error);
            return 'system';
        }
    }

    async setThemePreference(themePreference: 'light' | 'dark' | 'system'): Promise<void> {
        try {
            await AsyncStorage.setItem(this.getKey('themePreference'), themePreference);
        } catch (error) {
            console.error('Failed to set theme preference:', error);
            throw error;
        }
    }
}

export default LocalStorage;
