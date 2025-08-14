import { useCallback } from 'react';
import {
    NotificationTemplateData,
    NotificationEntityType,
    NotificationContext
} from '@timothyw/pat-common';
import { useNotifications } from './useNotifications';

export interface NotifiableEntityConfig<T> {
    id: string;
    entityType: NotificationEntityType;
    entityData: T;
    userId: string;
}

/**
 * Hook for managing notifications for a specific entity
 * Replaces the NotifiableEntity and NotifiableWrapper classes
 */
export function useNotifiableEntity<T>(config: NotifiableEntityConfig<T>) {
    const notifications = useNotifications(config.entityType, config.id);

    /**
     * Get notification context for template rendering
     */
    const getNotificationContext = useCallback((): NotificationContext<T> => {
        return {
            entityId: config.id,
            entityType: config.entityType,
            entityData: config.entityData,
            userId: config.userId,
            variables: getNotificationVariables()
        };
    }, [config]);

    /**
     * Get variables for notification templates
     */
    const getNotificationVariables = useCallback((): Record<string, any> => {
        return {
            entity: config.entityData,
            now: new Date(),
            today: new Date().toDateString(),
            currentTime: new Date().toLocaleTimeString()
        };
    }, [config.entityData]);

    /**
     * Get parent entity type for inheritance
     */
    const getParentEntityType = useCallback((): NotificationEntityType | null => {
        switch (config.entityType) {
            case 'agenda_item':
                return 'agenda';
            case 'task':
            case 'task_list':
                return 'tasks';
            case 'habit':
                return 'habits';
            default:
                return null;
        }
    }, [config.entityType]);

    /**
     * Get inherited notification templates from parent entity
     */
    const getInheritedNotificationTemplates = useCallback(async (): Promise<NotificationTemplateData[]> => {
        const parentEntityType = getParentEntityType();
        if (!parentEntityType) return [];

        return await notifications.getTemplates(parentEntityType);
    }, [getParentEntityType, notifications]);

    /**
     * Get custom notification templates for this specific entity
     */
    const getCustomNotificationTemplates = useCallback(async (): Promise<NotificationTemplateData[]> => {
        return await notifications.getTemplates(config.entityType, config.id);
    }, [notifications, config.entityType, config.id]);

    /**
     * Get all effective notification templates (combination of inherited and custom)
     */
    const getAllNotificationTemplates = useCallback(async (): Promise<NotificationTemplateData[]> => {
        const [inherited, custom] = await Promise.all([
            getInheritedNotificationTemplates(),
            getCustomNotificationTemplates()
        ]);

        // Combine templates, with custom templates overriding inherited ones by name
        const customTemplateNames = new Set(custom.map(t => t.name));
        const effectiveInheritedTemplates = inherited.filter(
            t => !customTemplateNames.has(t.name)
        );

        return [...custom, ...effectiveInheritedTemplates];
    }, [getInheritedNotificationTemplates, getCustomNotificationTemplates]);

    /**
     * Register notification triggers for this entity
     * In practice, this would trigger server-side scheduling
     */
    const registerNotificationTriggers = useCallback(async (): Promise<void> => {
        try {
            // Get all effective templates for this entity
            const templates = await getAllNotificationTemplates();

            console.log(`Registering ${templates.length} notification templates for entity ${config.id}`);

            // The actual scheduling happens server-side when templates are applied to entities
            // This is mainly a trigger for server-side notification scheduling
            await scheduleNotificationsForEntity(templates);
        } catch (error) {
            console.error('Failed to register entity notifications:', error);
            throw error;
        }
    }, [config.id, getAllNotificationTemplates]);

    /**
     * Remove notification triggers for this entity
     */
    const removeNotificationTriggers = useCallback(async (): Promise<void> => {
        try {
            console.log(`Unregistering notifications for entity ${config.id}`);
            // This would typically involve canceling scheduled notifications
            // Implementation depends on server-side notification system
        } catch (error) {
            console.error('Failed to remove entity notifications:', error);
            throw error;
        }
    }, [config.id]);

    /**
     * Create inherited templates when this entity is created
     */
    const createInheritedTemplates = useCallback(async (): Promise<NotificationTemplateData[]> => {
        try {
            // Get parent-level templates that should be inherited
            const parentEntityType = getParentEntityType();
            if (!parentEntityType) return [];

            const parentTemplates = await notifications.getTemplates(parentEntityType);
            const createdTemplates: NotificationTemplateData[] = [];

            // Create inherited templates for this entity
            for (const parentTemplate of parentTemplates) {
                const inheritedTemplate = await notifications.createTemplate({
                    entityType: config.entityType,
                    entityId: config.id,
                    name: parentTemplate.name,
                    description: parentTemplate.description,
                    trigger: parentTemplate.trigger,
                    content: parentTemplate.content,
                    active: parentTemplate.active,
                    inheritedFrom: parentTemplate._id,
                    customized: false
                });

                createdTemplates.push(inheritedTemplate);
            }

            return createdTemplates;
        } catch (error) {
            console.error('Failed to create inherited templates:', error);
            throw error;
        }
    }, [config.entityType, config.id, getParentEntityType, notifications]);

    /**
     * Schedule notifications for this entity based on its templates
     * This is a placeholder - actual implementation would depend on server-side scheduling
     */
    const scheduleNotificationsForEntity = useCallback(async (
        templates: NotificationTemplateData[]
    ): Promise<void> => {
        const context = getNotificationContext();

        // For each template, determine if/when it should be scheduled
        for (const template of templates) {
            if (!template.active) continue;

            // This logic would be more complex in practice
            // For now, we'll just log the scheduling intent
            console.log(`Would schedule notification "${template.name}" for entity ${context.entityId}`);
        }
    }, [getNotificationContext]);

    return {
        // Core data
        id: config.id,
        entityType: config.entityType,
        entityData: config.entityData,
        userId: config.userId,

        // Notification operations
        getNotificationContext,
        getNotificationVariables,
        getParentEntityType,
        getInheritedNotificationTemplates,
        getCustomNotificationTemplates,
        getAllNotificationTemplates,
        registerNotificationTriggers,
        removeNotificationTriggers,
        createInheritedTemplates,

        // Pass through notifications hook functions
        ...notifications,
    };
}