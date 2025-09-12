import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
    CreateNotificationTemplateRequest,
    NotificationEntityType,
    NotificationSchedulerType,
    NotificationTemplateData,
    NotificationTemplateLevel,
    NotificationVariantType,
    notificationSchedulerDataSchema
} from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { useToast } from '@/src/components/toast/ToastContext';
import BaseFormView from '@/src/components/common/BaseFormView';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { 
    getAvailableVariantsForEntity, 
    getDefaultDataForVariant, 
    getVariantDefinition,
    NotificationVariantInformation
} from '../variants';
import { z } from 'zod';

interface NotificationTemplateFormScreenProps {
    navigation: StackNavigationProp<MainStackParamList, 'NotificationForm'>;
    route: RouteProp<MainStackParamList, 'NotificationForm'>;
}

export const NotificationFormScreen: React.FC<NotificationTemplateFormScreenProps> = ({
    navigation,
    route
}) => {
    const { targetEntityType, targetId, targetLevel, template } = route.params;
    const { getColor } = useTheme();
    const [formData, setFormData] = useState<{
        active: boolean;
        selectedVariant: NotificationVariantType | null;
        variantData: any;
        schedulerData: z.infer<typeof notificationSchedulerDataSchema> | null;
    }>(() => {
        // Initialize form data based on existing template or defaults
        if (template) {
            return {
                active: template.active,
                selectedVariant: template.variantData?.type || null,
                variantData: template.variantData,
                schedulerData: template.schedulerData
            };
        } else {
            // For new templates, select the first available variant
            const availableVariants = getAvailableVariantsForEntity(targetEntityType);
            const firstVariant = availableVariants[0];
            if (firstVariant) {
                const defaults = getDefaultDataForVariant(firstVariant.type);
                return {
                    active: true,
                    selectedVariant: firstVariant.type,
                    variantData: defaults.variantData,
                    schedulerData: defaults.schedulerData
                };
            }
            return {
                active: true,
                selectedVariant: null,
                variantData: null,
                schedulerData: null
            };
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const notifications = useNotifications(targetEntityType, targetId, targetLevel);
    const { successToast, errorToast } = useToast();

    const availableVariants = useMemo(() => 
        getAvailableVariantsForEntity(targetEntityType), 
        [targetEntityType]
    );

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVariantChange = (variantType: NotificationVariantType) => {
        const defaults = getDefaultDataForVariant(variantType);
        setFormData(prev => ({
            ...prev,
            selectedVariant: variantType,
            variantData: defaults.variantData,
            schedulerData: defaults.schedulerData
        }));
    };

    const handleSave = async () => {
        if (!formData.selectedVariant || !formData.variantData || !formData.schedulerData) {
            errorToast('Please select a notification type');
            return;
        }

        setIsLoading(true);

        const templateData: CreateNotificationTemplateRequest = {
            targetLevel,
            targetEntityType,
            targetId,
            schedulerData: formData.schedulerData,
            variantData: formData.variantData,
            active: formData.active
        };

        if (template) {
            // Update existing template
            await notifications.updateTemplate(template._id, {
                schedulerData: formData.schedulerData,
                variantData: formData.variantData,
                active: formData.active
            });
            successToast('Template updated successfully');
        } else {
            // Create new template
            await notifications.createTemplate(templateData);
            successToast('Template created successfully');
        }

        navigation.goBack();
        setIsLoading(true);
    };

    const handleDelete = async () => {
        if (!template) return;
        
        setIsLoading(true);
        await notifications.deleteTemplate(template._id);
        successToast('Template deleted successfully');
        navigation.goBack();
    };

    const isSaveDisabled = !formData.selectedVariant || !formData.variantData || !formData.schedulerData;

    return (
        <BaseFormView
            navigation={navigation}
            route={route}
            title={template ? 'Edit Template' : 'New Template'}
            isEditMode={!!template}
            saveText={template ? 'Save' : 'Create'}
            onSave={handleSave}
            isSaveDisabled={isSaveDisabled}
            isLoading={isLoading}
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
                <Text className="text-on-surface text-base font-semibold mb-3">Notification Type</Text>
                {availableVariants.length === 0 ? (
                    <View className="p-4 bg-surface-variant/20 rounded-md">
                        <Text className="text-on-surface-variant text-sm text-center">
                            No notification types are available for this entity type.
                        </Text>
                    </View>
                ) : (
                    <View className="space-y-2">
                        {availableVariants.map((variant, index) => (
                            <TouchableOpacity
                                key={variant.type}
                                className={`p-3 border border-divider rounded-md ${
                                    formData.selectedVariant === variant.type ? 'bg-primary/20 border-primary' : ''
                                }`}
                                onPress={() => handleVariantChange(variant.type)}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name={variant.icon}
                                        size={20}
                                        color={formData.selectedVariant === variant.type ? getColor('primary') : getColor('on-surface-variant')}
                                        className="mr-3"
                                    />
                                    <View className="flex-1">
                                        <Text className={`text-sm font-medium ${
                                            formData.selectedVariant === variant.type ? 'text-primary' : 'text-on-surface'
                                        }`}>
                                            {variant.displayName}
                                        </Text>
                                        <Text className="text-xs text-on-surface-variant mt-0.5">
                                            {variant.description}
                                        </Text>
                                    </View>
                                    {formData.selectedVariant === variant.type && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color={getColor('primary')}
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </BaseFormView>
    );
};

export default NotificationFormScreen;