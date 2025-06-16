import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';

interface DetailViewHeaderProps {
    title: string;
    onBack: () => void;
    onEdit: () => void;
    showEdit?: boolean;
}

const DetailViewHeader: React.FC<DetailViewHeaderProps> = ({
    title,
    onBack,
    onEdit,
    showEdit = true
}) => {
    const { getColor } = useTheme();

    return (
        <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
            <TouchableOpacity onPress={onBack}>
                <Ionicons name="chevron-back" size={24} color={getColor("primary")} />
            </TouchableOpacity>

            <Text className="text-on-surface text-lg font-bold">{title}</Text>

            {showEdit ? (
                <TouchableOpacity onPress={onEdit}>
                    <Text className="text-primary text-base">
                        Edit
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={{ width: 24 }} />
            )}
        </View>
    );
};

export default DetailViewHeader;