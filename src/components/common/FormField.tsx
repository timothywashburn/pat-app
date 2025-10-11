import React from 'react';
import { Text, View } from 'react-native';
import TextBox from './TextBox';

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    maxLength?: number;
    autoFocus?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
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
    autoCapitalize,
    multiline,
}) => {
    return (
        <View className="mb-4">
            <TextBox
                label={`${label}${required ? ' *' : ''}`}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                disabled={disabled}
                autoFocus={autoFocus}
                maxLength={maxLength}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                multiline={multiline}
                error={error}
            />
            {error && (
                <Text className="text-error text-sm mt-1">{error}</Text>
            )}
        </View>
    );
};

export default FormField;