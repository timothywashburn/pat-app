import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';

interface FormTextAreaProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    maxLength?: number;
    numberOfLines?: number;
    minHeight?: number;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    required = false,
    error,
    disabled = false,
    maxLength,
    numberOfLines = 4,
    minHeight = 100
}) => {
    const { getColor } = useTheme();

    return (
        <View className="mb-4">
            <Text className="text-on-surface text-base font-medium mb-2">
                {label}{required && ' *'}
            </Text>
            <TextInput
                className={`bg-surface border rounded-lg p-3 text-on-surface text-base ${
                    error ? 'border-error' : 'border-outline'
                } ${disabled ? 'opacity-50' : ''}`}
                style={{ minHeight }}
                placeholder={placeholder}
                placeholderTextColor={getColor('on-surface-variant')}
                value={value}
                onChangeText={onChangeText}
                editable={!disabled}
                multiline
                numberOfLines={numberOfLines}
                textAlignVertical="top"
                maxLength={maxLength}
            />
            {error && (
                <Text className="text-error text-sm mt-1">{error}</Text>
            )}
        </View>
    );
};

export default FormTextArea;