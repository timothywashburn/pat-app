import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Switch } from 'react-native';
import { NotificationTemplateData, NotificationEntityType, NotificationTemplateLevel } from '@timothyw/pat-common';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/core';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { useToast } from '@/src/components/toast/ToastContext';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { NotificationTemplateCard } from '../components/NotificationTemplateCard';
import NotificationViewHeader from '@/src/components/headers/NotificationViewHeader';

interface NotificationConfigScreenProps {
    navigation: StackNavigationProp<MainStackParamList, 'NotificationConfig'>;
    route: RouteProp<MainStackParamList, 'NotificationConfig'>;
}

export const NotificationConfigScreen: React.FC<NotificationConfigScreenProps> = ({
    navigation,
    route
}) => {
    const { targetEntityType, targetId, targetLevel, entityName } = route.params;
    const { getColor } = useTheme();
    const [isSynced, setIsSynced] = useState<boolean>(true); // For individual entities
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const notifications = useNotifications(targetEntityType, targetId, targetLevel);
    const { templates, refreshTemplates } = notifications;
    const { errorToast, successToast } = useToast();

    useEffect(() => {
        loadTemplates();
        if (targetLevel === NotificationTemplateLevel.ENTITY) {
            loadSyncState();
        }
    }, [targetEntityType, targetId, targetLevel]);

    // Refresh templates when screen comes into focus (e.g., returning from form screen)
    useFocusEffect(
        React.useCallback(() => {
            loadTemplates();
            if (targetLevel === NotificationTemplateLevel.ENTITY) {
                loadSyncState();
            }
        }, [targetEntityType, targetId, targetLevel])
    );

    const loadTemplates = async () => {
        try {
            await notifications.getTemplates();
        } catch (error) {
            console.error('Failed to load templates:', error);
            errorToast('Failed to load notification templates');
        }
    };

    const loadSyncState = async () => {
        if (targetLevel !== NotificationTemplateLevel.ENTITY) return;

        try {
            const syncState = await notifications.getEntitySyncState(targetEntityType, targetId);
            setIsSynced(syncState.synced);
        } catch (error) {
            console.error('Failed to load sync state:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadTemplates();
        if (targetLevel === NotificationTemplateLevel.ENTITY) {
            await loadSyncState();
        }
        setIsRefreshing(false);
    };

    const handleTemplateDelete = async (templateId: string) => {
        try {
            await notifications.deleteTemplate(templateId);
            await refreshTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            errorToast('Failed to delete notification template');
        }
    };

    const handleSyncToggle = async () => {
        if (targetLevel !== NotificationTemplateLevel.ENTITY) return;

        try {
            const newSyncState = !isSynced;
            const result = await notifications.updateEntitySync(targetEntityType, targetId, newSyncState);

            setIsSynced(result.synced);
            await refreshTemplates();

            successToast(
                newSyncState ? 'Now inheriting templates from parent' : 'Created custom templates'
            );
        } catch (error) {
            console.error('Failed to update sync state:', error);
            errorToast('Failed to update sync state');
        }
    };

    const handleTemplateEdit = (template: NotificationTemplateData) => {
        navigation.navigate('NotificationTemplateForm', {
            targetEntityType,
            targetId,
            targetLevel,
            template
        });
    };

    const getEntityDisplayName = () => {
        if (entityName) return entityName;

        // Simple display name mapping
        switch (targetEntityType) {
            case NotificationEntityType.AGENDA_ITEM:
                return 'Agenda Item';
            case NotificationEntityType.AGENDA_PANEL:
                return 'Agenda Panel';
            case NotificationEntityType.INBOX_PANEL:
                return 'Inbox Panel';
            default:
                return targetEntityType;
        }
    };

    const isPanelLevel = targetLevel === NotificationTemplateLevel.PARENT;
    const isIndividualEntity = targetLevel === NotificationTemplateLevel.ENTITY;

    const renderTemplate = ({ item }: { item: NotificationTemplateData }) => (
        <NotificationTemplateCard
            template={item}
            onDelete={handleTemplateDelete}
            onEdit={handleTemplateEdit}
            readOnly={isIndividualEntity && isSynced}
        />
    );

    const renderEmptyState = () => (
        <View className="flex-1 justify-center items-center px-8">
            <Ionicons
                name="notifications-outline"
                size={64}
                color={getColor('on-surface-variant')}
                className="mb-4"
            />
            <Text className="text-on-surface text-lg font-semibold text-center mb-2">No Notifications Set Up</Text>
            <Text className="text-on-surface-variant text-sm text-center leading-5">
                {isPanelLevel
                    ? `Create notification templates for ${getEntityDisplayName().toLowerCase()} that will automatically apply to new items.`
                    : `Set up custom notifications for this ${getEntityDisplayName().toLowerCase()}, or sync with ${getEntityDisplayName()} panel notifications.`
                }
            </Text>
        </View>
    );

    const renderContent = () => {
        return (
            <FlatList
                data={templates}
                renderItem={renderTemplate}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={getColor('primary')}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                ListHeaderComponent={
                    templates.length > 0 ? (
                        <View className="flex-row items-center justify-between mb-3 mt-2">
                            <Text className="text-on-surface text-base font-semibold">
                                {isPanelLevel
                                    ? `${getEntityDisplayName()} Notifications`
                                    : (isSynced ? 'Inherited Templates' : 'Custom Templates')
                                }
                            </Text>
                            <Text className="text-on-surface-variant text-xs bg-divider px-2 py-0.5 rounded-full">
                                {templates.length}
                            </Text>
                        </View>
                    ) : null
                }
            />
        );
    };

    return (
        <View className="flex-1 bg-background">
            <NotificationViewHeader
                title={`Notifications - ${getEntityDisplayName()}`}
                onBack={() => navigation.goBack()}
                showAddButton={!(isIndividualEntity && isSynced)}
                onAdd={() => navigation.navigate('NotificationTemplateForm', {
                    targetEntityType,
                    targetId,
                    targetLevel
                })}
                addButtonText="Add"
            />


            {isIndividualEntity && (
                <View className="flex-row items-center justify-between p-4 bg-surface-variant border-b border-divider">
                    <View className="flex-1">
                        <Text className="text-on-surface text-sm font-medium">
                            {isSynced ? 'Synced with Parent' : 'Custom Templates'}
                        </Text>
                        <Text className="text-on-surface-variant text-xs">
                            {isSynced
                                ? 'Inheriting templates from parent settings'
                                : 'Using custom notification templates'}
                        </Text>
                    </View>
                    <Switch
                        value={isSynced}
                        onValueChange={handleSyncToggle}
                        trackColor={{ false: getColor('divider'), true: getColor('primary') + '40' }}
                        thumbColor={isSynced ? getColor('primary') : getColor('on-surface-variant')}
                    />
                </View>
            )}

            <View className="flex-1 p-4">
                {renderContent()}
            </View>
        </View>
    );
};

export default NotificationConfigScreen;