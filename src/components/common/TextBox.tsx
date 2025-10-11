import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

interface TextBoxProps extends Omit<TextInputProps, 'placeholderTextColor'> {
    /**
     * The placeholder text to display when the input is empty
     */
    placeholder?: string;
    /**
     * The current value of the text input
     */
    value: string;
    /**
     * Callback function called when the text changes
     */
    onChangeText: (text: string) => void;
    /**
     * Whether the input should be disabled
     */
    disabled?: boolean;
    /**
     * Whether to show the text as password (dots/asterisks)
     */
    secureTextEntry?: boolean;
    /**
     * The keyboard type to use
     */
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'url';
    /**
     * Callback when the submit/return key is pressed
     */
    onSubmitEditing?: () => void;
    /**
     * Whether to auto-focus this input when the screen loads
     */
    autoFocus?: boolean;
    /**
     * Maximum length of the input
     */
    maxLength?: number;
}

/**
 * A common text input component with consistent styling across the app.
 * Uses the theme context for colors and follows the app's design system.
 */
const TextBox: React.FC<TextBoxProps> = ({
    placeholder,
    value,
    onChangeText,
    disabled = false,
    secureTextEntry = false,
    keyboardType = 'default',
    returnKeyType = 'done',
    autoFocus = false,
    maxLength,
    ...rest
}) => {
    const { getColor } = useTheme();

    return (
        <TextInput
            className={`bg-surface text-on-surface h-[50px] border border-outline rounded-lg px-3 text-left ${
                disabled ? 'opacity-50' : ''
            }`}
            placeholder={placeholder}
            placeholderTextColor={getColor('on-surface-variant')}
            value={value}
            onChangeText={onChangeText}
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            // autoCapitalize={autoCapitalize}
            // returnKeyType={returnKeyType}
            // onSubmitEditing={onSubmitEditing}
            autoFocus={autoFocus}
            maxLength={maxLength}
            {...rest}
        />
    );
};

export default TextBox;
