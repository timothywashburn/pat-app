import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NotificationTemplateData } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { useAlert } from '@/src/components/alert';
import { Ionicons } from '@expo/vector-icons';
import { getVariantDefinition } from '@/src/features/notifications/variants';

interface NotificationTemplateCardProps {
    template: NotificationTemplateData;
    onDelete: (templateId: string) => void;
    onEdit?: (template: NotificationTemplateData) => void;
    readOnly?: boolean;
}

export const NotificationTemplateCard: React.FC<NotificationTemplateCardProps> = ({
    template,
    onDelete,
    onEdit,
    readOnly = false
}) => {
    const { getColor } = useTheme();
    const { confirmAlert } = useAlert();

    const handleDelete = () => {
        confirmAlert(
            'Delete Template',
            'Are you sure you want to delete this notification template?',
            () => onDelete(template._id)
        );
    };

    const renderTemplateDisplay = () => {
        const variantDefinition = getVariantDefinition(template.variantData.type);

        if (variantDefinition?.displayComponent) {
            const DisplayComponent = variantDefinition.displayComponent;
            return (
                <DisplayComponent
                    schedulerData={template.schedulerData}
                    variantData={template.variantData}
                />
            );
        }

        return (
            <View className="flex-row items-center">
                <Text className="text-on-surface text-base font-semibold">
                    {template.variantData.type}
                </Text>
            </View>
        );
    };

    return (
        <View className={`bg-surface rounded-xl p-4 my-1.5 border ${
            template.active ? 'border-primary' : ''
        } ${readOnly ? 'opacity-75 border-l-4 border-l-success/40' : ''}`}>
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center flex-1">
                    {renderTemplateDisplay()}
                    {readOnly && (
                        <View className="flex-row items-center ml-2 px-2 py-0.5 rounded">
                            <Ionicons name="lock-closed" size={10} color={getColor('success')} />
                            <Text className="text-success text-xs font-medium ml-1">Inherited</Text>
                        </View>
                    )}
                </View>
                <View className={`flex-row items-center px-1.5 py-0.5 rounded ml-2`}>
                    <Ionicons
                        name={template.active ? 'checkmark-circle' : 'pause-circle'}
                        size={10}
                        color={getColor(template.active ? 'success' : 'error')}
                    />
                    <Text className={`text-xs font-medium ${
                        template.active ? 'text-success' : 'text-error'
                    }`}>
                        {template.active ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>

            <Text className="text-on-surface-variant text-sm mb-3">
                Target: {template.targetId}
            </Text>

            <View className="flex-row justify-end items-center mt-3">
                {!readOnly && (
                    <>
                        <TouchableOpacity
                            className="flex-row items-center px-3 py-1.5 rounded-md ml-2"
                            onPress={() => onEdit?.(template)}
                        >
                            <Ionicons name="pencil" size={14} color={getColor('primary')} />
                            <Text className="text-primary text-xs font-medium ml-1">
                                Edit
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-3 py-1.5 rounded-md ml-2"
                            onPress={handleDelete}
                        >
                            <Ionicons name="trash" size={14} color={getColor('error')} />
                            <Text className="text-error text-xs font-medium ml-1">
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};