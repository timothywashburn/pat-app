import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    maxLength?: number;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    required = false,
    error,
    disabled = false,
    autoFocus = false,
    maxLength,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences'
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
                placeholder={placeholder}
                placeholderTextColor={getColor('on-surface-variant')}
                value={value}
                onChangeText={onChangeText}
                editable={!disabled}
                autoFocus={autoFocus}
                maxLength={maxLength}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
            />
            {error && (
                <Text className="text-error text-sm mt-1">{error}</Text>
            )}
        </View>
    );
};

export default FormField;