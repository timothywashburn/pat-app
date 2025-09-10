import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NotificationTemplateData, NotificationEntityType, NotificationTemplateLevel } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';

interface NotificationsSectionProps {
    targetEntityType: NotificationEntityType;
    targetId: string;
    targetLevel: NotificationTemplateLevel;
    entityName?: string;
    onPress?: () => void;
    compact?: boolean;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
    targetEntityType,
    targetId,
    targetLevel,
    entityName,
    onPress,
    compact = false
}) => {
    const { getColor } = useTheme();
    const notifications = useNotifications(targetEntityType, targetId, targetLevel);
    const { templates } = notifications;

    useEffect(() => {
        loadTemplates();
    }, [targetEntityType, targetId, targetLevel]);

    const loadTemplates = async () => {
        try {
            await notifications.loadTemplates();
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
        return 'checkmark-circle'; // Active template
    };

    const getStatusColor = () => {
        return getColor('success');
    };

    const activeTemplates = templates.filter((t: NotificationTemplateData) => t.active);
    const totalCount = activeTemplates.length;

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
                                No notifications configured
                            </Text>
                        </View>
                    ) : (
                        activeTemplates.slice(0, 3).map(template => (
                            <View key={template._id} className="flex-row items-center py-1">
                                <Ionicons
                                    name={getStatusIcon()}
                                    size={12}
                                    color={getStatusColor()}
                                    className="mr-1.5"
                                />
                                <Text className={`text-on-surface-variant flex-1 ${compact ? 'text-xs' : 'text-sm'}`} numberOfLines={1}>
                                    {template.targetLevel} - {template.schedulerData.type}
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