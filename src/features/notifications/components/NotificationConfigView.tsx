import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Switch } from 'react-native';
import { NotificationTemplateData, NotificationEntityType } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications';
import { NotificationTemplateCard } from './NotificationTemplateCard';
import { NotificationTemplateForm } from './NotificationTemplateForm';

interface NotificationConfigViewProps {
    entityType: NotificationEntityType;
    entityId: string;
    entityName?: string;
    onClose?: () => void;
}

export const NotificationConfigView: React.FC<NotificationConfigViewProps> = ({
    entityType,
    entityId,
    entityName,
    onClose
}) => {
    const { getColor } = useTheme();
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateData | null>(null);
    const [viewMode, setViewMode] = useState<'individual' | 'defaults'>('individual'); // For panel-level toggle
    const [isSynced, setIsSynced] = useState<boolean>(true); // For individual entities
    const [hasParentTemplates, setHasParentTemplates] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Get the effective entity type based on view mode
    const effectiveEntityType = (!entityId && viewMode === 'defaults') 
        ? `${entityType}_defaults` as NotificationEntityType 
        : entityType;
    
    const notifications = useNotifications(effectiveEntityType, entityId);
    const { templates } = notifications;

    useEffect(() => {
        loadTemplates();
        if (entityId) {
            loadSyncState();
        }
    }, [entityType, entityId, viewMode]);

    const loadTemplates = async () => {
        try {
            await notifications.getTemplates();
        } catch (error) {
            console.error('Failed to load templates:', error);
            Alert.alert('Error', 'Failed to load notification templates');
        }
    };

    const loadSyncState = async () => {
        if (!entityId) return;

        try {
            const syncState = await notifications.getEntitySyncState(entityType, entityId);
            setIsSynced(syncState.synced);
            setHasParentTemplates(syncState.hasParentTemplates);
        } catch (error) {
            console.error('Failed to load sync state:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadTemplates();
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
        } catch (error) {
            console.error('Failed to delete template:', error);
            Alert.alert('Error', 'Failed to delete notification template');
        }
    };

    const handleSyncToggle = async () => {
        if (!entityId || !hasParentTemplates) return;

        try {
            const newSyncState = !isSynced;
            const result = await notifications.updateEntitySync(entityType, entityId, newSyncState);

            setIsSynced(result.synced);

            Alert.alert(
                'Sync Updated',
                newSyncState ? 'Now inheriting templates from parent' : 'Created custom templates'
            );
        } catch (error) {
            console.error('Failed to update sync state:', error);
            Alert.alert('Error', 'Failed to update sync state');
        }
    };

    const handleTemplateSave = (savedTemplate: NotificationTemplateData) => {
        // The hook automatically manages state updates
        // Just close the form
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

        switch (entityType) {
            case 'agenda':
                return 'Agenda Panel';
            case 'habits':
                return 'Habits Panel';
            case 'agenda_item':
                return 'Agenda Item';
            case 'habit':
                return 'Habit';
            default:
                return entityType;
        }
    };

    const getEntityIcon = () => {
        switch (entityType) {
            case 'agenda':
            case 'agenda_item':
                return 'calendar';
            case 'habits':
            case 'habit':
                return 'fitness';
            default:
                return 'notifications';
        }
    };

    const isPanelLevel = !entityId;
    const isIndividualEntity = !!entityId;

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
        if (templates.length === 0) {
            return renderEmptyState();
        }

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
                ListHeaderComponent={
                    templates.length > 0 ? (
                        <View className="flex-row items-center justify-between mb-3 mt-2">
                            <Text className="text-on-surface text-base font-semibold">
                                {isPanelLevel
                                    ? (viewMode === 'defaults' ? 'Default Templates' : `${getEntityDisplayName()} Notifications`)
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

    const containerClassName = onClose
        ? "bg-background absolute inset-0 z-50"  // Modal style
        : "flex-1 bg-background";  // Regular view style

    return (
        <View className={containerClassName}>
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

                {onClose && (
                    <TouchableOpacity className="p-2" onPress={onClose}>
                        <Ionicons name="close" size={24} color={getColor('on-surface-variant')} />
                    </TouchableOpacity>
                )}
            </View>

            {isPanelLevel && (
                <View className="flex-row items-center justify-between p-4 bg-surface-variant border-b border-divider">
                    <Text className="text-on-surface text-sm font-medium">View:</Text>
                    <View className="flex-row bg-surface rounded-lg p-1">
                        <TouchableOpacity
                            className={`px-3 py-1 rounded-md ${viewMode === 'individual' ? 'bg-primary' : ''}`}
                            onPress={() => setViewMode('individual')}
                        >
                            <Text className={`text-xs font-medium ${
                                viewMode === 'individual' ? 'text-white' : 'text-on-surface-variant'
                            }`}>
                                {getEntityDisplayName()}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`px-3 py-1 rounded-md ${viewMode === 'defaults' ? 'bg-primary' : ''}`}
                            onPress={() => setViewMode('defaults')}
                        >
                            <Text className={`text-xs font-medium ${
                                viewMode === 'defaults' ? 'text-white' : 'text-on-surface-variant'
                            }`}>
                                Default Templates
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {isIndividualEntity && hasParentTemplates && (
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
                    entityType={isPanelLevel && viewMode === 'defaults' ? `${entityType}_defaults` as NotificationEntityType : entityType}
                    entityId={entityId}
                    template={editingTemplate || undefined}
                    onSave={handleTemplateSave}
                    onCancel={handleTemplateFormCancel}
                />
            )}
        </View>
    );
};