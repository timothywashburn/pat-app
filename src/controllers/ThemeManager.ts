import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import themeData from '@/colors.json';
import { Appearance, Platform } from "react-native";
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
    "unknown": string;
}

interface CustomTheme extends Theme {
    colors: Theme['colors'] & ThemeColors;
}

type ThemeMode = 'light' | 'dark';

class ThemeManager {
    static shared = new ThemeManager();

    private lightTheme: CustomTheme;
    private darkTheme: CustomTheme;

    public override: ThemeMode | undefined;

    constructor() {
        this.lightTheme = {
            ...DefaultTheme,
            colors: {
                ...DefaultTheme.colors,
                ...lightColors,
            },
        };

        this.darkTheme = {
            ...DarkTheme,
            colors: {
                ...DarkTheme.colors,
                ...darkColors,
            },
        };
    }

    getTheme(colorScheme: ThemeMode): CustomTheme {
        return colorScheme === 'dark' ? this.darkTheme : this.lightTheme;
    }

    setTheme = (theme: ThemeMode) => {
        this.override = theme;
        if (Platform.OS === 'web') {
            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('dark-mode', theme === 'dark');
                document.documentElement.classList.toggle('light-mode', theme === 'light');
            }
        } else {
            Appearance.setColorScheme(theme);
        }
    }
}

export const useTheme = () => {
    let { colorScheme } = useColorScheme();
    const themeManager = ThemeManager.shared;
    if (themeManager.override) colorScheme = themeManager.override;
    const theme = themeManager.getTheme(colorScheme as ThemeMode);

    return {
        theme,
        getColor: (colorName: keyof ThemeColors) => {
            return theme.colors[colorName];
        },
        setTheme: themeManager.setTheme,
        colorScheme,
    };
};

export default ThemeManager;