import React, { useState } from 'react';
import { TextInput, TextInputProps, Text } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

interface ATextBoxProps extends Omit<TextInputProps, 'placeholderTextColor'> {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    disabled?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'url';
    autoFocus?: boolean;
    maxLength?: number;
    multiline?: boolean;
    error?: string;
    className?: string;
}

const CustomTextInput: React.FC<ATextBoxProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    disabled = false,
    secureTextEntry = false,
    keyboardType = 'default',
    autoFocus = false,
    maxLength,
    multiline,
    error,
    className,
    ...rest
}) => {
    const { getColor } = useTheme();

    const baseClassName = `bg-surface text-on-surface border rounded-lg px-3 py-4 text-left ${
        error ? 'border-error' : 'border-outline'
    } ${disabled ? 'opacity-50' : ''}`;

    const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

    return (
        <>
            {label && (
                <Text className="text-on-surface text-base font-medium mb-2">
                    {label}
                </Text>
            )}
            <TextInput
                className={combinedClassName}
                placeholder={placeholder}
                placeholderTextColor={getColor('on-surface-variant')}
                value={value}
                onChangeText={onChangeText}
                editable={!disabled}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoFocus={autoFocus}
                maxLength={maxLength}
                multiline={multiline}
                numberOfLines={4}
                {...rest}
            />
        </>
    );
};

export default CustomTextInput;
