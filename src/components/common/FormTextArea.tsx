import React from 'react';
import { Text, View } from 'react-native';
import TextBox from './TextBox';

interface FormTextAreaProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    maxLength?: number;
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    required,
    error,
    disabled,
    maxLength,
}) => {
    return (
        <View className="mb-4">
            <TextBox
                label={`${label}${required ? '*' : ''}`}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                disabled={disabled}
                maxLength={maxLength}
                multiline
                error={error}
            />
            {error && (
                <Text className="text-error text-sm mt-1">{error}</Text>
            )}
        </View>
    );
};

export default FormTextArea;