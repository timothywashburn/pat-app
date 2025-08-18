import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NotificationTemplateData, NotificationTriggerType } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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
            'Are you sure you want to delete this notification template?',
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
            case NotificationTriggerType.TIME_BASED:
                return 'Time-based';
            case NotificationTriggerType.EVENT_BASED:
                return 'Event-based';
            case NotificationTriggerType.RECURRING:
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
                    <Text className="text-on-surface text-base font-semibold">
                        {template.targetLevel}:{template.targetEntityType}
                    </Text>
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

            <Text className="text-on-surface-variant text-sm mb-3">
                Target: {template.targetId}
            </Text>

            <Text className="text-primary text-xs bg-primary/20 py-1 rounded-md self-start overflow-hidden">
                {getTriggerDisplayText()}
            </Text>

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