import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

// Keep in sync with global.css
export const lightColors = {
    primary: '#1A1D21',
    secondary: '#2D3748',
    accent: '#625fff',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    unset: '#FF0000'
};

export const darkColors = {
    primary: '#E8ECEF',
    secondary: '#9AA1B0',
    accent: '#625FFF',
    background: '#1A1D21',
    surface: '#2A2D35',
    unset: '#FF0000'
};

interface CustomColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
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
        colors: {
            primary: themeManager.getColor('primary', currentColorScheme),
            secondary: themeManager.getColor('secondary', currentColorScheme),
            accent: themeManager.getColor('accent', currentColorScheme),
            background: themeManager.getColor('background', currentColorScheme),
            surface: themeManager.getColor('surface', currentColorScheme),
        },
        colorScheme: currentColorScheme,
    };
};

export default ThemeManager;