import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { Appearance, Platform } from "react-native";
import themeData from '@/colors.json';
import LocalStorage from '@/src/services/LocalStorage';

export const lightColors = themeData.light;
export const darkColors = themeData.dark;

type ThemeColors = {
    "primary": string;
    "on-primary": string;
    "primary-container": string;
    "on-primary-container": string;
    "secondary": string;
    "on-secondary": string;
    "secondary-container": string;
    "on-secondary-container": string;
    "success": string,
    "on-success": string,
    "success-container": string,
    "on-success-container": string,
    "warning": string;
    "on-warning": string;
    "error": string;
    "on-error": string;
    "error-container": string;
    "on-error-container": string;
    "error-on-bg": string;
    "background": string;
    "on-background": string;
    "on-background-variant": string;
    "surface": string;
    "on-surface": string;
    "on-surface-variant": string;
    "outline": string;
    "outline-variant": string;
    "divider": string;
    "unknown": string;
}

interface CustomTheme extends Theme {
    colors: Theme['colors'] & ThemeColors;
}

type ThemeMode = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: CustomTheme;
    colorScheme: ThemeMode;
    themePreference: ThemePreference;
    getColor: (colorName: keyof ThemeColors) => string;
    setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const lightTheme: CustomTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        ...lightColors,
    },
};

const darkTheme: CustomTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        ...darkColors,
    },
};

interface CustomThemeProviderProps {
    children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
    const [colorScheme, setColorScheme] = useState<ThemeMode>(() => {
        const systemScheme = Appearance.getColorScheme();
        return (systemScheme as ThemeMode) || 'light';
    });

    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const loadThemePreference = async () => {
            const savedPreference = await LocalStorage.shared.getThemePreference();
            setThemePreferenceState(savedPreference);

            if (savedPreference !== 'system') {
                setColorScheme(savedPreference as ThemeMode);

                if (Platform.OS === 'web') {
                    if (typeof document !== 'undefined') {
                        document.documentElement.classList.toggle('dark-mode', savedPreference === 'dark');
                        document.documentElement.classList.toggle('light-mode', savedPreference === 'light');
                    }
                } else {
                    Appearance.setColorScheme(savedPreference as ThemeMode);
                }
            }

            setIsInitialized(true);
        };

        loadThemePreference();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
            if (themePreference === 'system' && newScheme) setColorScheme(newScheme as ThemeMode);
        });

        return () => subscription?.remove();
    }, [themePreference, isInitialized]);

    const currentScheme = themePreference === 'system' ? colorScheme : (themePreference as ThemeMode);
    const theme = currentScheme === 'dark' ? darkTheme : lightTheme;

    const getColor = (colorName: keyof ThemeColors): string => {
        return theme.colors[colorName];
    };

    const setThemePreference = async (preference: ThemePreference) => {
        setThemePreferenceState(preference);
        await LocalStorage.shared.setThemePreference(preference);

        if (preference === 'system') {
            const systemScheme = Appearance.getColorScheme() as ThemeMode || 'light';
            setColorScheme(systemScheme);

            if (Platform.OS === 'web') {
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.toggle('dark-mode', systemScheme === 'dark');
                    document.documentElement.classList.toggle('light-mode', systemScheme === 'light');
                }
            } else {
                Appearance.setColorScheme(null);
            }
        } else {
            setColorScheme(preference as ThemeMode);

            if (Platform.OS === 'web') {
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.toggle('dark-mode', preference === 'dark');
                    document.documentElement.classList.toggle('light-mode', preference === 'light');
                }
            } else {
                Appearance.setColorScheme(preference as ThemeMode);
            }
        }
    };

    const value: ThemeContextType = {
        theme,
        colorScheme: currentScheme,
        themePreference,
        getColor,
        setThemePreference,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a CustomThemeProvider');
    }
    return context;
};

export default ThemeContext;