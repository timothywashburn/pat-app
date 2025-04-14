import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import themeData from '@/theme.json';
export const lightColors = themeData.light;
export const darkColors = themeData.dark;

interface CustomColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    unset: string;
}

interface CustomTheme extends Theme {
    colors: Theme['colors'] & CustomColors;
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

    getColor(colorName: keyof CustomColors, colorScheme: ColorSchemeType): string {
        const theme = this.getTheme(colorScheme);
        return theme.colors[colorName];
    }
}

export const useTheme = () => {
    const { colorScheme } = useColorScheme();
    const themeManager = ThemeManager.shared;
    const currentColorScheme = (colorScheme || 'light') as ColorSchemeType;

    return {
        theme: themeManager.getTheme(currentColorScheme),
        colors: Object.keys(lightColors).reduce((acc, key) => {
            acc[key as keyof CustomColors] = themeManager.getColor(key as keyof CustomColors, currentColorScheme);
            return acc;
        }, {} as Record<keyof CustomColors, string>),
        colorScheme: currentColorScheme,
    };
};

export default ThemeManager;