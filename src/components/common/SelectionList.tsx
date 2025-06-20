import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';

interface SelectionOption {
    value: string;
    label: string;
    description?: string;
}

interface SelectionListProps {
    label: string;
    options: SelectionOption[];
    selectedValue: string | undefined;
    onSelectionChange: (value: string) => void;
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

const SelectionList: React.FC<SelectionListProps> = ({
    label,
    options,
    selectedValue,
    onSelectionChange,
    required = false,
    error,
    disabled = false
}) => {
    const { getColor } = useTheme();

    return (
        <View className="mb-4">
            <Text className="text-on-surface text-base font-medium mb-2">
                {label}{required && ' *'}
            </Text>
            <View className={`bg-surface border rounded-lg ${
                error ? 'border-error' : 'border-outline'
            } ${disabled ? 'opacity-50' : ''}`}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={option.value}
                        className={`flex-row items-center justify-between p-3 ${
                            index < options.length - 1 ? 'border-b border-outline' : ''
                        }`}
                        onPress={() => !disabled && onSelectionChange(option.value)}
                        disabled={disabled}
                    >
                        <View className="flex-1">
                            <Text className="text-on-surface text-base">
                                {option.label}
                            </Text>
                            {option.description && (
                                <Text className="text-on-surface-variant text-sm mt-1">
                                    {option.description}
                                </Text>
                            )}
                        </View>
                        <Ionicons
                            name={selectedValue === option.value ? 'radio-button-on' : 'radio-button-off'}
                            size={20}
                            color={selectedValue === option.value ? getColor('primary') : getColor('on-surface-variant')}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            {error && (
                <Text className="text-error text-sm mt-1">{error}</Text>
            )}
        </View>
    );
};

export default SelectionList;