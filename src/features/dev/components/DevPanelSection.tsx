import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface DevPanelSectionProps {
    title: string;
    children: ReactNode;
}

const DevPanelSection = ({ title, children }: DevPanelSectionProps) => {
    return (
        <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-on-surface text-lg font-semibold mb-3">{title}</Text>
            {children}
        </View>
    );
};

export default DevPanelSection;