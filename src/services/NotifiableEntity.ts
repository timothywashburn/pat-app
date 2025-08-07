import {
    INotifiable,
    NotificationTemplateData,
    NotificationEntityType,
    NotificationContext
} from '@timothyw/pat-common';
import NotificationService from './NotificationService';

/**
 * Abstract base class that provides INotifiable implementation for client-side entities
 */
export abstract class NotifiableEntity<T> implements INotifiable<T> {
    protected notificationService = NotificationService.getInstance();

    abstract getId(): string;
    abstract getNotificationEntityType(): NotificationEntityType;
    abstract getEntityData(): T;
    abstract getUserId(): string;

    getNotificationContext(): NotificationContext<T> {
        return {
            entityId: this.getId(),
            entityType: this.getNotificationEntityType(),
            entityData: this.getEntityData(),
            userId: this.getUserId(),
            variables: this.getNotificationVariables()
        };
    }

    /**
     * Get variables for notification templates - can be overridden by subclasses
     */
    protected getNotificationVariables(): Record<string, any> {
        const entityData = this.getEntityData();
        return {
            entity: entityData,
            now: new Date(),
            today: new Date().toDateString(),
            currentTime: new Date().toLocaleTimeString()
        };
    }

    async getInheritedNotificationTemplates(): Promise<NotificationTemplateData[]> {
        const parentEntityType = this.getParentEntityType();
        if (!parentEntityType) return [];

        return await this.notificationService.getTemplates(parentEntityType);
    }

    async getCustomNotificationTemplates(): Promise<NotificationTemplateData[]> {
        return await this.notificationService.getTemplates(
            this.getNotificationEntityType(),
            this.getId()
        );
    }

    async getAllNotificationTemplates(): Promise<NotificationTemplateData[]> {
        const [inherited, custom] = await Promise.all([
            this.getInheritedNotificationTemplates(),
            this.getCustomNotificationTemplates()
        ]);

        // Combine templates, with custom templates overriding inherited ones by name
        const customTemplateNames = new Set(custom.map(t => t.name));
        const effectiveInheritedTemplates = inherited.filter(
            t => !customTemplateNames.has(t.name)
        );

        return [...custom, ...effectiveInheritedTemplates];
    }

    async registerNotificationTriggers(): Promise<void> {
        await this.notificationService.registerEntityNotifications(this);
    }

    async removeNotificationTriggers(): Promise<void> {
        await this.notificationService.unregisterEntityNotifications(this);
    }

    /**
     * Create inherited templates when this entity is created
     */
    async createInheritedTemplates(): Promise<NotificationTemplateData[]> {
        return await this.notificationService.createInheritedTemplatesForEntity(
            this.getNotificationEntityType(),
            this.getId()
        );
    }

    private getParentEntityType(): NotificationEntityType | null {
        switch (this.getNotificationEntityType()) {
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

/**
 * Wrapper class for existing entities to make them notifiable
 */
export class NotifiableWrapper<T> extends NotifiableEntity<T> {
    constructor(
        private id: string,
        private entityType: NotificationEntityType,
        private entityData: T,
        private userId: string
    ) {
        super();
    }

    getId(): string {
        return this.id;
    }

    getNotificationEntityType(): NotificationEntityType {
        return this.entityType;
    }

    getEntityData(): T {
        return this.entityData;
    }

    getUserId(): string {
        return this.userId;
    }
}