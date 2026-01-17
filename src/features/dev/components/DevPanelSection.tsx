import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface DevPanelSectionProps {
    title: string;
    children: ReactNode;
    bgClassName?: string;
}

const DevPanelSection = ({ title, children, bgClassName }: DevPanelSectionProps) => {
    return (
        <View className={`${bgClassName || 'bg-surface'} rounded-lg p-4 mb-4`}>
            <Text className="text-on-surface text-lg font-semibold mb-3">{title}</Text>
            {children}
        </View>
    );
};

export default DevPanelSection;