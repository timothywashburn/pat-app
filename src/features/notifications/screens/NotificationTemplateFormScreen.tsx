import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
    CreateNotificationTemplateRequest,
    NotificationEntityType,
    NotificationSchedulerType,
    NotificationTemplateData,
    NotificationTemplateLevel,
    NotificationVariantType
} from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { useToast } from '@/src/components/toast/ToastContext';
import BaseFormView from '@/src/components/common/BaseFormView';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { MainStackParamList } from '@/src/navigation/MainStack';

interface NotificationTemplateFormScreenProps {
    navigation: StackNavigationProp<MainStackParamList, 'NotificationTemplateForm'>;
    route: RouteProp<MainStackParamList, 'NotificationTemplateForm'>;
}

export const NotificationTemplateFormScreen: React.FC<NotificationTemplateFormScreenProps> = ({
    navigation,
    route
}) => {
    const { targetEntityType, targetId, targetLevel, template } = route.params;
    const { getColor } = useTheme();
    const [formData, setFormData] = useState<{
        active: boolean;
        schedulerType: NotificationSchedulerType;
    }>({
        active: template?.active ?? true,
        schedulerType: NotificationSchedulerType.RELATIVE_DATE,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const notifications = useNotifications(targetEntityType, targetId, targetLevel);
    const { errorToast, successToast } = useToast();

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        
        try {
            const templateData: CreateNotificationTemplateRequest = {
                targetLevel,
                targetEntityType,
                targetId,
                schedulerData: {
                    type: NotificationSchedulerType.RELATIVE_DATE,
                    offsetMinutes: 1
                },
                variantData: {
                    type: NotificationVariantType.AGENDA_ITEM_UPCOMING_DEADLINE,
                },
                active: formData.active
            };

            let savedTemplate: NotificationTemplateData;
            if (template) {
                // Update existing template
                savedTemplate = await notifications.updateTemplate(template._id, {
                    schedulerData: {
                        type: NotificationSchedulerType.RELATIVE_DATE,
                        offsetMinutes: 1
                    },
                    variantData: {
                        type: NotificationVariantType.AGENDA_ITEM_UPCOMING_DEADLINE,
                    },
                    active: templateData.active
                });
                successToast('Template updated successfully');
            } else {
                // Create new template
                savedTemplate = await notifications.createTemplate(templateData);
                successToast('Template created successfully');
            }

            navigation.goBack();
        } catch (error) {
            console.error('Failed to save template:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save notification template');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!template) return;
        
        setIsLoading(true);
        setErrorMessage(null);
        
        try {
            await notifications.deleteTemplate(template._id);
            successToast('Template deleted successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to delete template:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete notification template');
            setIsLoading(false);
        }
    };

    const triggerOptions = [
        { value: NotificationSchedulerType.DAY_TIME, label: 'Date and Time', icon: 'time' },
        { value: NotificationSchedulerType.RELATIVE_DATE, label: 'Relative Date', icon: 'flash' },
        // { value: NotificationSchedulerType.RECURRING, label: 'Recurring', icon: 'refresh' },
    ];

    return (
        <BaseFormView
            navigation={navigation}
            route={route}
            title={template ? 'Edit Template' : 'New Template'}
            isEditMode={!!template}
            saveText={template ? 'Save' : 'Create'}
            onSave={handleSave}
            isSaveDisabled={false}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={template}
            onDelete={template ? handleDelete : undefined}
            deleteButtonText="Delete Template"
            deleteConfirmTitle="Delete Template"
            deleteConfirmMessage="Are you sure you want to delete this notification template? This action cannot be undone."
        >
            <View className="border-b border-divider pb-4 mb-4">
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

            <View className="border-b border-divider pb-4 mb-4">
                <Text className="text-on-surface text-base font-semibold mb-3">Trigger</Text>
                <View className="flex-row mt-2">
                    {triggerOptions.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`flex-1 py-2 px-3 border border-divider rounded-md items-center ${
                                index < triggerOptions.length - 1 ? 'mr-2' : ''
                            } ${formData.schedulerType === option.value ? 'bg-primary/20 border-primary' : ''}`}
                            onPress={() => updateFormData('triggerType', option.value)}
                        >
                            <Ionicons
                                name={option.icon as any}
                                size={16}
                                color={formData.schedulerType === option.value ? getColor('primary') : getColor('on-surface-variant')}
                            />
                            <Text className={`text-xs mt-1 ${
                                formData.schedulerType === option.value ? 'text-primary font-medium' : 'text-on-surface-variant'
                            }`}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </BaseFormView>
    );
};

export default NotificationTemplateFormScreen;