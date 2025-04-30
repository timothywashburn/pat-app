import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

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
    "unknown": string;
    "test": string;
}

interface CustomTheme extends Theme {
    colors: Theme['colors'] & ThemeColors;
}

type ColorSchemeType = 'light' | 'dark';

class ThemeManager {
    static shared = new ThemeManager();

    private lightTheme: CustomTheme;
    private darkTheme: CustomTheme;

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

    getTheme(colorScheme: ColorSchemeType): CustomTheme {
        return colorScheme === 'dark' ? this.darkTheme : this.lightTheme;
    }

    // getColor(colorName: keyof ThemeColors, colorScheme: ColorSchemeType): string {
    //     const theme = this.getTheme(colorScheme);
    //     return theme.colors[colorName];
    // }
}

export const useTheme = () => {
    const { colorScheme } = useColorScheme();
    const themeManager = ThemeManager.shared;
    const currentColorScheme = (colorScheme || 'light') as ColorSchemeType;
    const theme = themeManager.getTheme(currentColorScheme);

    return {
        theme,
        getColor: (colorName: keyof ThemeColors) => {
            return theme.colors[colorName];
        },
        colorScheme: currentColorScheme,
    };
};

export default ThemeManager;