import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

interface KeyboardAvoidingWrapperProps {
    children: React.ReactNode;
    style?: any;
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
    children,
    style
}) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[{ flex: 1 }, style]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 47 : 0} // not sure why 47 seems to be the right size, tested on my iphone 13
        >
            {children}
        </KeyboardAvoidingView>
    );
};

export default KeyboardAvoidingWrapper;