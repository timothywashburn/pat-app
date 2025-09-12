import React, { useCallback, useEffect } from 'react';
import { FlatList, Switch, Text, View } from 'react-native';
import {
    NotificationTemplateData,
    NotificationTemplateLevel,
    NotificationTemplateSyncState
} from '@timothyw/pat-common';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/core';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { NotificationTemplateCard } from '../components/NotificationTemplateCard';
import NotificationViewHeader from '@/src/components/headers/NotificationViewHeader';
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { isParenthesizedExpression } from "@babel/types";

interface NotificationConfigScreenProps {
    navigation: StackNavigationProp<MainStackParamList, 'NotificationInfo'>;
    route: RouteProp<MainStackParamList, 'NotificationInfo'>;
}

export const NotificationInfoScreen: React.FC<NotificationConfigScreenProps> = ({
    navigation,
    route
}) => {
    const { targetEntityType, targetId, targetLevel, entityName } = route.params;
    const { getColor } = useTheme();

    const notifications = useNotifications(targetEntityType, targetId, targetLevel);

    const isParent = targetLevel === NotificationTemplateLevel.PARENT;

    const loadData = useCallback(async () => {
        await notifications.loadTemplates();
        if (!isParent) await notifications.loadEntitySyncState(targetEntityType, targetId);
    }, [targetEntityType, targetId, targetLevel]);
    
    const { refreshControl } = useRefreshControl(loadData, 'Failed to refresh notification templates');

    useEffect(() => {
        loadData();
    }, [loadData]);

    useFocusEffect(useCallback(() => {
        loadData();
    }, [loadData]));

    const renderContent = () => {
        const sortedTemplates = notifications.templates.sort((a, b) => {
            if (a.active && !b.active) return -1;
            if (!a.active && b.active) return 1;
            return 0;
        });

        return (
            <FlatList
                data={sortedTemplates}
                renderItem={({ item }: { item: NotificationTemplateData }) => (
                    <NotificationTemplateCard
                        template={item}
                        onDelete={notifications.deleteTemplate}
                        onEdit={(template: NotificationTemplateData) => {
                            navigation.navigate('NotificationForm', {
                                targetEntityType,
                                targetId,
                                targetLevel,
                                template
                            });
                        }}
                        readOnly={!isParent && notifications.syncState == NotificationTemplateSyncState.SYNCED}
                    />
                )}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                refreshControl={refreshControl}
                ListEmptyComponent={(
                    <View className="flex-1 justify-center items-center px-8">
                        <Ionicons
                            name="notifications-outline"
                            size={64}
                            color={getColor('on-surface-variant')}
                            className="mb-4"
                        />
                        <Text className="text-on-surface text-lg font-semibold text-center mb-2">No Notifications Set Up</Text>
                        <Text className="text-on-surface-variant text-sm text-center leading-5">
                            {isParent
                                ? `Create notification templates for ${entityName.toLowerCase()} that will automatically apply to new items.`
                                : `Set up custom notifications for this ${entityName.toLowerCase()}, or sync with ${entityName} panel notifications.`
                            }
                        </Text>
                    </View>
                )}
            />
        );
    };

    return (
        <View className="flex-1 bg-background">
            <NotificationViewHeader
                title={`Notifications - ${entityName}`}
                onBack={() => navigation.goBack()}
                showAddButton={isParent || notifications.syncState != NotificationTemplateSyncState.SYNCED}
                onAdd={() => navigation.navigate('NotificationForm', {
                    targetEntityType,
                    targetId,
                    targetLevel
                })}
                addButtonText="Add"
            />

            {!isParent && notifications.syncState != NotificationTemplateSyncState.NO_PARENT && (
                <View className="flex-row items-center justify-between p-4 bg-surface-variant border-b border-divider">
                    <View className="flex-1">
                        <Text className="text-on-surface text-sm font-medium">
                            {notifications.syncState == NotificationTemplateSyncState.SYNCED ? 'Synced with Parent' : 'Not Synced'}
                        </Text>
                        <Text className="text-on-surface-variant text-xs">
                            {notifications.syncState == NotificationTemplateSyncState.SYNCED
                                ? 'Inheriting templates from parent settings'
                                : 'Using custom notification templates'}
                        </Text>
                    </View>
                    <Switch
                        value={notifications.syncState === NotificationTemplateSyncState.SYNCED}
                        onValueChange={async () => {
                            let newState = notifications.syncState !== NotificationTemplateSyncState.SYNCED;
                            await notifications.updateEntitySync(targetEntityType, targetId, newState);
                        }}
                        trackColor={{ false: getColor('divider'), true: getColor('primary') + '40' }}
                        thumbColor={notifications.syncState == NotificationTemplateSyncState.SYNCED ? getColor('primary') : getColor('on-surface-variant')}
                    />
                </View>
            )}

            <View className="flex-1 p-4">
                {renderContent()}
            </View>
        </View>
    );
};

export default NotificationInfoScreen;