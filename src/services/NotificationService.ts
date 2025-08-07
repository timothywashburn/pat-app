import NetworkManager, { HTTPMethod } from './NetworkManager';
import {
    NotificationTemplateData,
    NotificationEntityType,
    CreateNotificationTemplateRequest,
    CreateNotificationTemplateResponse,
    GetNotificationTemplatesResponse,
    UpdateNotificationTemplateRequest,
    UpdateNotificationTemplateResponse,
    DeleteNotificationTemplateResponse,
    PreviewNotificationTemplateRequest,
    PreviewNotificationTemplateResponse,
    SyncNotificationTemplateRequest,
    SyncNotificationTemplateResponse,
    Serializer,
    INotifiable,
    NotificationContext
} from '@timothyw/pat-common';

export class NotificationService {
    private static instance: NotificationService;

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Get notification templates for a user
     */
    async getTemplates(entityType?: NotificationEntityType, entityId?: string): Promise<NotificationTemplateData[]> {
        try {
            const params = new URLSearchParams();
            if (entityType) params.append('entityType', entityType);
            if (entityId) params.append('entityId', entityId);

            const endpoint = `/api/notifications/templates${params.toString() ? '?' + params.toString() : ''}`;

            const response = await NetworkManager.shared.performAuthenticated<undefined, GetNotificationTemplatesResponse>({
                endpoint,
                method: HTTPMethod.GET,
            });

            if (!response.success) throw new Error('Failed to get notification templates');

            return response.templates?.map(template => Serializer.deserializeNotificationTemplateData(template)) || [];
        } catch (error) {
            console.error('Failed to get notification templates:', error);
            throw error;
        }
    }

    /**
     * Create a new notification template
     */
    async createTemplate(templateData: CreateNotificationTemplateRequest): Promise<NotificationTemplateData> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<CreateNotificationTemplateRequest, CreateNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates',
                method: HTTPMethod.POST,
                body: templateData,
            });

            if (!response.success) throw new Error('Failed to create notification template');
            if (!response.template) throw new Error('No template returned');

            return Serializer.deserializeNotificationTemplateData(response.template);
        } catch (error) {
            console.error('Failed to create notification template:', error);
            throw error;
        }
    }

    /**
     * Update a notification template
     */
    async updateTemplate(templateId: string, updates: UpdateNotificationTemplateRequest): Promise<NotificationTemplateData> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<UpdateNotificationTemplateRequest, UpdateNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.PUT,
                body: updates,
            });

            if (!response.success) throw new Error('Failed to update notification template');
            if (!response.template) throw new Error('No template returned');

            return Serializer.deserializeNotificationTemplateData(response.template);
        } catch (error) {
            console.error('Failed to update notification template:', error);
            throw error;
        }
    }

    /**
     * Delete a notification template
     */
    async deleteTemplate(templateId: string): Promise<void> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, DeleteNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.DELETE,
            });

            if (!response.success) throw new Error('Failed to delete notification template');
        } catch (error) {
            console.error('Failed to delete notification template:', error);
            throw error;
        }
    }


    /**
     * Preview a notification template
     */
    async previewTemplate(request: PreviewNotificationTemplateRequest): Promise<{
        title: string;
        body: string;
        variables: Record<string, any>;
        missingVariables: string[];
    }> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<PreviewNotificationTemplateRequest, PreviewNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates/preview',
                method: HTTPMethod.POST,
                body: request,
            });

            if (!response.success) throw new Error('Failed to preview notification template');
            if (!response.preview) throw new Error('No preview returned');

            return {
                title: response.preview.title,
                body: response.preview.body,
                variables: response.preview.variables,
                missingVariables: response.missingVariables || []
            };
        } catch (error) {
            console.error('Failed to preview notification template:', error);
            throw error;
        }
    }

    /**
     * Get entity sync state
     */
    async getEntitySyncState(entityType: NotificationEntityType, entityId: string): Promise<{
        synced: boolean;
        hasParentTemplates: boolean;
    }> {
        try {
            const params = new URLSearchParams();
            params.append('entityType', entityType);
            params.append('entityId', entityId);

            const response = await NetworkManager.shared.performAuthenticated<undefined, any>({
                endpoint: `/api/notifications/entity-sync?${params.toString()}`,
                method: HTTPMethod.GET,
            });

            if (!response.success) throw new Error('Failed to get entity sync state');

            return {
                synced: response.synced,
                hasParentTemplates: response.hasParentTemplates
            };
        } catch (error) {
            console.error('Failed to get entity sync state:', error);
            throw error;
        }
    }

    /**
     * Update entity sync state
     */
    async updateEntitySync(entityType: NotificationEntityType, entityId: string, synced: boolean): Promise<{
        synced: boolean;
        templates: NotificationTemplateData[];
    }> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<any, any>({
                endpoint: '/api/notifications/entity-sync',
                method: HTTPMethod.PUT,
                body: { entityType, entityId, synced },
            });

            if (!response.success) throw new Error('Failed to update entity sync');

            return {
                synced: response.synced,
                templates: response.templates?.map((template: any) => Serializer.deserializeNotificationTemplateData(template)) || []
            };
        } catch (error) {
            console.error('Failed to update entity sync:', error);
            throw error;
        }
    }

    /**
     * Register notification triggers for an entity when it's created/updated
     */
    async registerEntityNotifications<T>(entity: INotifiable<T>): Promise<void> {
        try {
            // Get all effective templates for this entity
            const templates = await entity.getAllNotificationTemplates();

            // Register triggers - this would typically involve:
            // 1. Scheduling notifications based on the entity's data and template triggers
            // 2. This is handled by the GenericNotificationHandler on the server side
            // For now, we'll just log that we're registering
            console.log(`Registering ${templates.length} notification templates for entity ${entity.getId()}`);

            // The actual scheduling happens server-side when templates are applied to entities
            // Client-side registration is mainly about triggering the server-side scheduling
            await this.scheduleNotificationsForEntity(entity, templates);
        } catch (error) {
            console.error('Failed to register entity notifications:', error);
            throw error;
        }
    }

    /**
     * Remove notification triggers for an entity when it's deleted
     */
    async unregisterEntityNotifications<T>(entity: INotifiable<T>): Promise<void> {
        try {
            // This would typically involve canceling scheduled notifications
            // For now, we'll implement this as needed
            console.log(`Unregistering notifications for entity ${entity.getId()}`);
        } catch (error) {
            console.error('Failed to unregister entity notifications:', error);
            throw error;
        }
    }

    /**
     * Schedule notifications for an entity based on its templates
     * This is a placeholder - actual implementation would depend on server-side scheduling
     */
    private async scheduleNotificationsForEntity<T>(
        entity: INotifiable<T>,
        templates: NotificationTemplateData[]
    ): Promise<void> {
        const context = entity.getNotificationContext();

        // For each template, determine if/when it should be scheduled
        for (const template of templates) {
            if (!template.active) continue;

            // This logic would be more complex in practice
            // For now, we'll just log the scheduling intent
            console.log(`Would schedule notification "${template.name}" for entity ${context.entityId}`);
        }
    }

    /**
     * Create inherited templates when a new entity is created
     */
    async createInheritedTemplatesForEntity(
        entityType: NotificationEntityType,
        entityId: string
    ): Promise<NotificationTemplateData[]> {
        try {
            // Get panel-level templates that should be inherited
            const parentEntityType = this.getParentEntityType(entityType);
            if (!parentEntityType) return [];

            const parentTemplates = await this.getTemplates(parentEntityType);
            const createdTemplates: NotificationTemplateData[] = [];

            // Create inherited templates for the new entity
            for (const parentTemplate of parentTemplates) {
                const inheritedTemplate = await this.createTemplate({
                    entityType,
                    entityId,
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
    }

    private getParentEntityType(entityType: NotificationEntityType): NotificationEntityType | null {
        switch (entityType) {
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
    }
}

export default NotificationService;