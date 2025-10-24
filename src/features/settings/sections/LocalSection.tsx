import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';

export const LocalSection: React.FC = () => {
    const { themePreference, setThemePreference, getColor } = useTheme();

    const getIconName = (value: 'light' | 'dark' | 'system'): keyof typeof Ionicons.glyphMap => {
        switch (value) {
            case 'light':
                return 'sunny-outline';
            case 'dark':
                return 'moon-outline';
            case 'system':
                return 'desktop-outline';
        }
    };

    const renderThemeOption = (value: 'light' | 'dark' | 'system', label: string) => {
        const isSelected = themePreference === value;
        return (
            <TouchableOpacity
                key={value}
                onPress={() => setThemePreference(value)}
                className={`flex-1 py-3 px-4 rounded-lg ${
                    isSelected ? 'bg-primary' : 'bg-surface'
                }`}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center justify-center">
                    <Ionicons
                        name={getIconName(value)}
                        size={16}
                        color={isSelected ? getColor('on-primary') : getColor('on-surface')}
                        className="mr-2"
                    />
                    <Text
                        className={`text-base ${
                            isSelected ? 'text-on-primary font-bold' : 'text-on-surface'
                        }`}
                    >
                        {label}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="mb-5">
            <Text className="text-on-background text-lg font-bold mb-4">Local Settings</Text>

            <View className="mb-4">
                <Text className="text-on-background text-base font-semibold mb-2">Theme</Text>
                <View className="flex-row gap-2">
                    {renderThemeOption('light', 'Light')}
                    {renderThemeOption('dark', 'Dark')}
                    {renderThemeOption('system', 'System')}
                </View>
            </View>
        </View>
    );
};
