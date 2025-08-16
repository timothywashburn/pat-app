import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { NotificationTemplateData, NotificationEntityType, CreateNotificationTemplateRequest } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';

interface NotificationTemplateFormProps {
    entityType: NotificationEntityType;
    entityId: string;
    template?: NotificationTemplateData; // For editing
    onSave: (template: NotificationTemplateData) => void;
    onCancel: () => void;
}

export const NotificationTemplateForm: React.FC<NotificationTemplateFormProps> = ({
    entityType,
    entityId,
    template,
    onSave,
    onCancel
}) => {
    const { getColor } = useTheme();
    const [formData, setFormData] = useState({
        name: template?.name || '',
        description: template?.description || '',
        title: template?.content.title || '',
        body: template?.content.body || '',
        active: template?.active ?? true,
        triggerType: template?.trigger.type || 'time_based',
        customized: template?.customized ?? false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const notifications = useNotifications(entityType, entityId);

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generatePreview = async () => {
        if (!formData.title.trim() || !formData.body.trim()) {
            setPreview(null);
            return;
        }

        try {
            const previewData = await notifications.previewTemplate({
                templateTitle: formData.title,
                templateBody: formData.body,
                entityType,
                entityId: entityId || 'sample-id',
                variables: {}
            });
            setPreview(previewData);
        } catch (error) {
            console.error('Failed to generate preview:', error);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(generatePreview, 500);
        return () => clearTimeout(debounceTimer);
    }, [formData.title, formData.body]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter a template name');
            return;
        }

        if (!formData.title.trim() || !formData.body.trim()) {
            Alert.alert('Error', 'Please enter notification title and body');
            return;
        }

        setIsLoading(true);
        try {
            const templateData: CreateNotificationTemplateRequest = {
                entityType,
                entityId,
                name: formData.name,
                description: formData.description,
                trigger: {
                    type: formData.triggerType as any,
                    conditions: {},
                    timing: {
                        testDelay: true // 5-second test trigger
                    }
                },
                content: {
                    title: formData.title,
                    body: formData.body
                },
                active: formData.active,
                customized: false
            };

            let savedTemplate: NotificationTemplateData;
            if (template) {
                // Update existing template
                savedTemplate = await notifications.updateTemplate(template._id, templateData);
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
        { value: 'time_based', label: 'Time Based', icon: 'time' },
        { value: 'event_based', label: 'Event Based', icon: 'flash' },
        { value: 'recurring', label: 'Recurring', icon: 'refresh' },
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
                    <Text className="text-on-surface text-base font-semibold mb-3">Template Info</Text>

                    <View className="mb-4">
                        <Text className="text-on-surface text-sm font-medium mb-1.5">Name</Text>
                        <TextInput
                            className="bg-surface border border-divider rounded-lg p-3 text-on-surface text-sm"
                            value={formData.name}
                            onChangeText={(text) => updateFormData('name', text)}
                            placeholder="Template name..."
                            placeholderTextColor={getColor('on-surface-variant')}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-on-surface text-sm font-medium mb-1.5">Description (optional)</Text>
                        <TextInput
                            className="bg-surface border border-divider rounded-lg p-3 text-on-surface text-sm min-h-[80px]"
                            value={formData.description}
                            onChangeText={(text) => updateFormData('description', text)}
                            placeholder="Describe when this notification should be sent..."
                            placeholderTextColor={getColor('on-surface-variant')}
                            multiline
                            textAlignVertical="top"
                        />
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

                <View className="p-4 border-b border-divider">
                    <Text className="text-on-surface text-base font-semibold mb-3">Notification Content</Text>

                    <View className="mb-4">
                        <Text className="text-on-surface text-sm font-medium mb-1.5">Title</Text>
                        <TextInput
                            className="bg-surface border border-divider rounded-lg p-3 text-on-surface text-sm"
                            value={formData.title}
                            onChangeText={(text) => updateFormData('title', text)}
                            placeholder="Notification title..."
                            placeholderTextColor={getColor('on-surface-variant')}
                        />
                        <Text className="text-on-surface-variant text-xs mt-1 italic">
                            Use variables like {"{{entity.name}}"} or {"{{timeUntilDue}}"}
                        </Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-on-surface text-sm font-medium mb-1.5">Body</Text>
                        <TextInput
                            className="bg-surface border border-divider rounded-lg p-3 text-on-surface text-sm min-h-[80px]"
                            value={formData.body}
                            onChangeText={(text) => updateFormData('body', text)}
                            placeholder="Notification message..."
                            placeholderTextColor={getColor('on-surface-variant')}
                            multiline
                            textAlignVertical="top"
                        />
                        <Text className="text-on-surface-variant text-xs mt-1 italic">
                            Use variables like {"{{entity.name}}"} or {"{{timeUntilDue}}"}
                        </Text>
                    </View>
                </View>

                {preview && (
                    <View className="bg-surface m-4 p-4 rounded-xl border border-divider">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-on-surface text-sm font-semibold">Preview</Text>
                            <TouchableOpacity
                                className="flex-row items-center bg-primary/20 px-3 py-1.5 rounded-md"
                                onPress={generatePreview}
                            >
                                <Ionicons name="refresh" size={12} color={getColor('primary')} />
                                <Text className="text-primary text-xs ml-1">Refresh</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="bg-background p-3 rounded-lg border border-divider mt-2">
                            <Text className="text-on-surface text-sm font-semibold mb-1">{preview.title}</Text>
                            <Text className="text-on-surface-variant text-xs leading-4">{preview.body}</Text>
                        </View>
                        {preview.missingVariables?.length > 0 && (
                            <Text className="text-warning text-xs mt-1 italic">
                                Missing variables: {preview.missingVariables.join(', ')}
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};