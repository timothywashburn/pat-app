import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NotificationTemplateData, NotificationEntityType } from '@timothyw/pat-common';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Ionicons } from '@expo/vector-icons';
import NotificationService from '@/src/services/NotificationService';

interface NotificationsSectionProps {
    entityType: NotificationEntityType;
    entityId?: string;
    entityName?: string;
    onPress?: () => void;
    compact?: boolean;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
    entityType,
    entityId,
    entityName,
    onPress,
    compact = false
}) => {
    const { getColor } = useTheme();
    const [templates, setTemplates] = useState<NotificationTemplateData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const notificationService = NotificationService.getInstance();

    useEffect(() => {
        loadTemplates();
    }, [entityType, entityId]);

    const loadTemplates = async () => {
        try {
            const loadedTemplates = await notificationService.getTemplates(entityType, entityId);
            setTemplates(loadedTemplates.filter(t => t.active));
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (template: NotificationTemplateData) => {
        if (template.inheritedFrom && !template.customized) {
            return 'link'; // Synced/inherited
        }
        return 'checkmark-circle'; // Custom/active
    };

    const getStatusColor = (template: NotificationTemplateData) => {
        if (template.inheritedFrom && !template.customized) {
            return getColor('warning');
        }
        return getColor('success');
    };

    const activeTemplates = templates.filter(t => t.active);
    const totalCount = activeTemplates.length;

    if (isLoading) {
        return (
            <View className={`bg-surface border border-divider ${compact ? 'rounded-lg p-3 my-1' : 'rounded-xl p-4 my-2'}`}>
                <View className={`flex-row items-center justify-between ${compact ? 'mb-1.5' : 'mb-2'}`}>
                    <View className="flex-row items-center flex-1">
                        <Ionicons
                            name="notifications-outline"
                            size={compact ? 16 : 18}
                            color={getColor('on-surface-variant')}
                            className="mr-2"
                        />
                        <Text className={`text-on-surface font-semibold ${compact ? 'text-sm' : 'text-base'}`}>Notifications</Text>
                    </View>
                </View>
                <Text className={`text-on-surface-variant italic ml-1 ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity className={`bg-surface border border-divider ${compact ? 'rounded-lg p-3 my-1' : 'rounded-xl p-4 my-2'}`} onPress={onPress} activeOpacity={0.7}>
            <View className={`flex-row items-center justify-between ${compact ? 'mb-1.5' : 'mb-2'}`}>
                <View className="flex-row items-center flex-1">
                    <Ionicons
                        name={totalCount > 0 ? "notifications" : "notifications-outline"}
                        size={compact ? 16 : 18}
                        color={totalCount > 0 ? getColor('primary') : getColor('on-surface-variant')}
                        className="mr-2"
                    />
                    <View className="flex-1">
                        <Text className={`text-on-surface font-semibold ${compact ? 'text-sm' : 'text-base'}`}>Notifications</Text>
                        {entityName && (
                            <Text className={`text-on-surface-variant mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>{entityName}</Text>
                        )}
                    </View>
                </View>

                {totalCount > 0 && (
                    <View className="bg-primary/20 px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-primary text-xs font-medium">{totalCount}</Text>
                    </View>
                )}

                <Ionicons
                    name="chevron-forward"
                    size={compact ? 14 : 16}
                    color={getColor('on-surface-variant')}
                />
            </View>

            {!compact && (
                <View className={compact ? 'mt-1' : 'mt-2'}>
                    {totalCount === 0 ? (
                        <View className="flex-row items-center py-2">
                            <Ionicons
                                name="add-circle-outline"
                                size={14}
                                color={getColor('on-surface-variant')}
                            />
                            <Text className={`text-on-surface-variant italic ml-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                                {entityId ? 'No custom notifications' : 'No panel notifications'}
                            </Text>
                        </View>
                    ) : (
                        activeTemplates.slice(0, 3).map(template => (
                            <View key={template._id} className="flex-row items-center py-1">
                                <Ionicons
                                    name={getStatusIcon(template)}
                                    size={12}
                                    color={getStatusColor(template)}
                                    className="mr-1.5"
                                />
                                <Text className={`text-on-surface-variant flex-1 ${compact ? 'text-xs' : 'text-sm'}`} numberOfLines={1}>
                                    {template.name}
                                </Text>
                                <Text className="text-success text-xs">Active</Text>
                            </View>
                        ))
                    )}

                    {totalCount > 3 && (
                        <Text className={`text-on-surface-variant italic ${compact ? 'text-xs' : 'text-sm'}`}>
                            +{totalCount - 3} more...
                        </Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};