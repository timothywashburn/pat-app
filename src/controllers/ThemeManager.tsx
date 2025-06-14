import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { Appearance, Platform } from "react-native";
import themeData from '@/colors.json';

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
    "error": string;
    "on-error": string;
    "error-container": string;
    "on-error-container": string;
    "warning": string;
    "on-warning": string;
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

interface ThemeContextType {
    theme: CustomTheme;
    colorScheme: ThemeMode;
    getColor: (colorName: keyof ThemeColors) => string;
    setTheme: (theme: ThemeMode) => void;
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

    const [themeOverride, setThemeOverride] = useState<ThemeMode | undefined>();

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
            if (!themeOverride && newScheme) {
                setColorScheme(newScheme as ThemeMode);
            }
        });

        return () => subscription?.remove();
    }, [themeOverride]);

    const currentScheme = themeOverride || colorScheme;
    const theme = currentScheme === 'dark' ? darkTheme : lightTheme;

    const getColor = (colorName: keyof ThemeColors): string => {
        return theme.colors[colorName];
    };

    const setTheme = (newTheme: ThemeMode) => {
        setThemeOverride(newTheme);
        setColorScheme(newTheme);

        if (Platform.OS === 'web') {
            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('dark-mode', newTheme === 'dark');
                document.documentElement.classList.toggle('light-mode', newTheme === 'light');
            }
        } else {
            Appearance.setColorScheme(newTheme);
        }
    };

    const value: ThemeContextType = {
        theme,
        colorScheme: currentScheme,
        getColor,
        setTheme,
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