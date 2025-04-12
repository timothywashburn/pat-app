import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeManager';

interface CustomHeaderProps {
    title: string;
    showAddButton?: boolean;
    onAddTapped?: () => void;
    showFilterButton?: boolean;
    isFilterActive?: boolean;
    onFilterTapped?: () => void;
    trailing?: () => React.ReactNode;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    showAddButton = false,
    onAddTapped,
    showFilterButton = false,
    isFilterActive = false,
    onFilterTapped,
    trailing,
}) => {
    const { colors } = useTheme();

    return (
        <View className="border-b border-surface">
            <View className="h-15 flex-row items-center justify-between px-4">
                <View className="flex-1 items-start">
                    <TouchableOpacity
                        onPress={() => {
                            console.log("menu button pressed")
                        }}
                    >
                        <Ionicons name="menu" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <Text className="text-primary text-lg font-bold flex-2 text-center">{title}</Text>

                <View className="flex-1 flex-row justify-end items-center">
                    {showFilterButton && (
                        <TouchableOpacity onPress={onFilterTapped} className="ml-4 p-1">
                            <Ionicons
                                name="filter"
                                size={24}
                                color={isFilterActive ? colors.accent : colors.primary}
                            />
                        </TouchableOpacity>
                    )}

                    {showAddButton && (
                        <TouchableOpacity onPress={onAddTapped} className="ml-4 p-1">
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    )}

                    {trailing && trailing()}
                </View>
            </View>
        </View>
    );
};

export default CustomHeader;