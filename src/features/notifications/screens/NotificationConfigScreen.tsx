import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Switch } from 'react-native';
import { NotificationTemplateData, NotificationEntityType, NotificationTemplateLevel } from '@timothyw/pat-common';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { useToast } from '@/src/components/toast/ToastContext';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { NotificationTemplateCard } from '../components/NotificationTemplateCard';
import { NotificationTemplateForm } from '../components/NotificationTemplateForm';

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
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateData | null>(null);
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

    const handleTemplateUpdate = (updatedTemplate: NotificationTemplateData) => {
        // The hook already handles state updates automatically
        // This function is kept for compatibility but the state is managed by the hook
        console.log('Template updated:', updatedTemplate);
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

    const handleTemplateSave = async (savedTemplate: NotificationTemplateData) => {
        // Refresh templates to ensure UI is updated
        await refreshTemplates();
        // Close the form
        setShowTemplateForm(false);
        setEditingTemplate(null);
    };

    const handleTemplateFormCancel = () => {
        setShowTemplateForm(false);
        setEditingTemplate(null);
    };

    const handleTemplateEdit = (template: NotificationTemplateData) => {
        setEditingTemplate(template);
        setShowTemplateForm(true);
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

    const getEntityIcon = (): keyof typeof Ionicons.glyphMap => {
        // Simple icon mapping
        switch (targetEntityType) {
            case NotificationEntityType.AGENDA_ITEM:
                return 'list';
            case NotificationEntityType.AGENDA_PANEL:
                return 'calendar';
            case NotificationEntityType.INBOX_PANEL:
                return 'mail';
            default:
                return 'notifications';
        }
    };

    const isPanelLevel = targetLevel === NotificationTemplateLevel.PARENT;
    const isIndividualEntity = targetLevel === NotificationTemplateLevel.ENTITY;

    const renderTemplate = ({ item }: { item: NotificationTemplateData }) => (
        <NotificationTemplateCard
            template={item}
            onUpdate={handleTemplateUpdate}
            onDelete={handleTemplateDelete}
            onEdit={handleTemplateEdit}
            readOnly={isIndividualEntity && isSynced} // Read-only if synced with parent
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
            <View className="flex-row items-center justify-between p-4 border-b border-divider">
                <View className="flex-row items-center flex-1">
                    <Ionicons
                        name={getEntityIcon()}
                        size={24}
                        color={getColor('primary')}
                    />
                    <View className="ml-2">
                        <Text className="text-on-surface text-lg font-semibold">Notifications</Text>
                        <Text className="text-on-surface-variant text-sm">{getEntityDisplayName()}</Text>
                    </View>
                </View>

                {!(isIndividualEntity && isSynced) && (
                    <TouchableOpacity
                        className="flex-row items-center bg-primary px-4 py-2 rounded-lg mr-2"
                        onPress={() => setShowTemplateForm(true)}
                    >
                        <Ionicons name="add" size={16} color="white" />
                        <Text className="text-white font-medium ml-1">Add Template</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={getColor('on-surface-variant')} />
                </TouchableOpacity>
            </View>


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

            {showTemplateForm && (
                <NotificationTemplateForm
                    targetEntityType={targetEntityType}
                    targetId={targetId}
                    targetLevel={targetLevel}
                    template={editingTemplate || undefined}
                    onSave={handleTemplateSave}
                    onCancel={handleTemplateFormCancel}
                />
            )}
        </View>
    );
};

export default NotificationConfigScreen;