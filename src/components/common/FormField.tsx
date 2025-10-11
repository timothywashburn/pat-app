import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import TextBox from './TextBox';

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
    required,
    error,
    disabled,
    autoFocus,
    maxLength,
    secureTextEntry,
    keyboardType,
    autoCapitalize
}) => {
    return (
        <View className="mb-4">
            <Text className="text-on-surface text-base font-medium mb-2">
                {label}{required && ' *'}
            </Text>
            <TextBox
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                disabled={disabled}
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