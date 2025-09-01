import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';

interface NotificationViewHeaderProps {
    title: string;
    onBack: () => void;
    showAddButton?: boolean;
    onAdd?: () => void;
    addButtonText?: string;
}

const NotificationViewHeader: React.FC<NotificationViewHeaderProps> = ({
    title,
    onBack,
    showAddButton = false,
    onAdd,
    addButtonText = "Add"
}) => {
    const { getColor } = useTheme();

    return (
        <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
            <TouchableOpacity onPress={onBack}>
                <Ionicons name="chevron-back" size={24} color={getColor("primary")} />
            </TouchableOpacity>

            <Text className="text-on-surface text-lg font-bold">{title}</Text>

            {showAddButton && onAdd ? (
                <TouchableOpacity onPress={onAdd}>
                    <Text className="text-primary text-base">
                        {addButtonText}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={{ width: 24 }} />
            )}
        </View>
    );
};

export default NotificationViewHeader;