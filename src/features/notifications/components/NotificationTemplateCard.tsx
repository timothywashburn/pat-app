import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NotificationTemplateData } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';

interface NotificationTemplateCardProps {
    template: NotificationTemplateData;
    onUpdate: (template: NotificationTemplateData) => void;
    onDelete: (templateId: string) => void;
    onEdit?: (template: NotificationTemplateData) => void;
    readOnly?: boolean;
}

export const NotificationTemplateCard: React.FC<NotificationTemplateCardProps> = ({
    template,
    onUpdate,
    onDelete,
    onEdit,
    readOnly = false
}) => {
    const { getColor } = useTheme();

    const handleDelete = () => {
        Alert.alert(
            'Delete Template',
            `Are you sure you want to delete "${template.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete(template._id)
                }
            ]
        );
    };

    const getTriggerDisplayText = () => {
        switch (template.trigger.type) {
            case 'time_based':
                return 'Time-based';
            case 'event_based':
                return 'Event-based';
            case 'recurring':
                return 'Recurring';
            default:
                return template.trigger.type;
        }
    };

    return (
        <View className={`bg-surface rounded-xl p-4 my-1.5 border ${
            template.active ? 'border-divider' : 'border-warning'
        } ${readOnly ? 'opacity-75 border-l-4 border-l-success/40' : ''}`}>
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center flex-1">
                    <Text className="text-on-surface text-base font-semibold">{template.name}</Text>
                    {readOnly && (
                        <View className="flex-row items-center ml-2 bg-success/20 px-2 py-0.5 rounded">
                            <Ionicons name="lock-closed" size={10} color={getColor('success')} />
                            <Text className="text-success text-xs font-medium ml-1">Inherited</Text>
                        </View>
                    )}
                </View>
                <View className={`flex-row items-center px-1.5 py-0.5 rounded ml-2 ${
                    template.active ? 'bg-success/20' : 'bg-error/20'
                }`}>
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

            {template.description && (
                <Text className="text-on-surface-variant text-sm mb-3">{template.description}</Text>
            )}

            <Text className="text-primary text-xs bg-primary/20 px-2 py-1 rounded-md self-start overflow-hidden">
                {getTriggerDisplayText()}
            </Text>

            <View className="my-2">
                <Text className="text-on-surface-variant text-xs italic">
                    "{template.content.title}" - {template.content.body}
                </Text>
            </View>


            <View className="flex-row justify-end items-center mt-3">
                {!readOnly && (
                    <>
                        <TouchableOpacity
                            className="flex-row items-center px-3 py-1.5 rounded-md ml-2 bg-primary/20"
                            onPress={() => onEdit?.(template)}
                        >
                            <Ionicons name="pencil" size={14} color={getColor('primary')} />
                            <Text className="text-primary text-xs font-medium ml-1">
                                Edit
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-3 py-1.5 rounded-md ml-2 bg-error/20"
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