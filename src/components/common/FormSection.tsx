import React from 'react';
import { Text, View } from 'react-native';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
    title,
    children,
    className = "bg-surface rounded-lg p-4 mb-5"
}) => {
    return (
        <View className={className}>
            <Text className="text-on-surface text-lg font-semibold mb-3">
                {title}
            </Text>
            {children}
        </View>
    );
};

export default FormSection;