import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { NotificationTemplateData, CreateNotificationTemplateRequest, NotificationTemplateLevel, NotificationEntityType, NotificationTriggerType } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';

interface NotificationTemplateFormProps {
    targetEntityType: NotificationEntityType;
    targetId: string;
    targetLevel: NotificationTemplateLevel;
    template?: NotificationTemplateData; // For editing
    onSave: (template: NotificationTemplateData) => void;
    onCancel: () => void;
}

export const NotificationTemplateForm: React.FC<NotificationTemplateFormProps> = ({
    targetEntityType,
    targetId,
    targetLevel,
    template,
    onSave,
    onCancel
}) => {
    const { getColor } = useTheme();
    const [formData, setFormData] = useState({
        active: template?.active ?? true,
        triggerType: template?.trigger.type || NotificationTriggerType.TIME_BASED,
    });
    const [isLoading, setIsLoading] = useState(false);
    const notifications = useNotifications(targetEntityType, targetId, targetLevel);

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const templateData: CreateNotificationTemplateRequest = {
                targetLevel,
                targetEntityType,
                targetId,
                trigger: {
                    type: formData.triggerType as NotificationTriggerType,
                },
                active: formData.active
            };

            let savedTemplate: NotificationTemplateData;
            if (template) {
                // Update existing template
                savedTemplate = await notifications.updateTemplate(template._id, {
                    trigger: templateData.trigger,
                    active: templateData.active
                });
            } else {
                // Create new template
                savedTemplate = await notifications.createTemplate(templateData);
            }

            onSave(savedTemplate);
        } catch (error) {
            console.error('Failed to save template:', error);
            Alert.alert('Error', 'Failed to save notification template');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerOptions = [
        { value: NotificationTriggerType.TIME_BASED, label: 'Time Based', icon: 'time' },
        { value: NotificationTriggerType.EVENT_BASED, label: 'Event Based', icon: 'flash' },
        { value: NotificationTriggerType.RECURRING, label: 'Recurring', icon: 'refresh' },
    ];

    return (
        <View className="flex-1 bg-background">
            <View className="flex-row items-center justify-between p-4 border-b border-divider">
                <Text className="text-on-surface text-lg font-semibold">
                    {template ? 'Edit Template' : 'New Template'}
                </Text>
                <View className="flex-row">
                    <TouchableOpacity onPress={onCancel} className="ml-4">
                        <Text className="text-on-surface-variant text-base font-medium">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} className="ml-4" disabled={isLoading}>
                        <Text className="text-primary text-base font-medium">
                            {isLoading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="p-4 border-b border-divider">
                    <Text className="text-on-surface text-base font-semibold mb-3">Template Settings</Text>

                    <View className="mb-4">
                        <Text className="text-on-surface text-sm font-medium mb-1.5">Target Level</Text>
                        <Text className="text-on-surface-variant text-sm">
                            {targetLevel === NotificationTemplateLevel.PARENT ? 'Parent Level' : 'Entity Level'}
                        </Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-on-surface text-sm font-medium mb-1.5">Entity Type</Text>
                        <Text className="text-on-surface-variant text-sm">{targetEntityType}</Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-on-surface text-sm font-medium flex-1">Active</Text>
                        <Switch
                            value={formData.active}
                            onValueChange={(value) => updateFormData('active', value)}
                            trackColor={{ false: getColor('divider'), true: getColor('primary') + '40' }}
                            thumbColor={formData.active ? getColor('primary') : getColor('on-surface-variant')}
                        />
                    </View>
                </View>

                <View className="p-4 border-b border-divider">
                    <Text className="text-on-surface text-base font-semibold mb-3">Trigger</Text>
                    <View className="flex-row mt-2">
                        {triggerOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`flex-1 py-2 px-3 border border-divider rounded-md items-center ${
                                    index < triggerOptions.length - 1 ? 'mr-2' : ''
                                } ${formData.triggerType === option.value ? 'bg-primary/20 border-primary' : ''}`}
                                onPress={() => updateFormData('triggerType', option.value)}
                            >
                                <Ionicons
                                    name={option.icon as any}
                                    size={16}
                                    color={formData.triggerType === option.value ? getColor('primary') : getColor('on-surface-variant')}
                                />
                                <Text className={`text-xs mt-1 ${
                                    formData.triggerType === option.value ? 'text-primary font-medium' : 'text-on-surface-variant'
                                }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};