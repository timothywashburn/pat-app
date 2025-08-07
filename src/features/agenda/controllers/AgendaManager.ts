import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse,
    GetItemsResponse, ItemData, Serializer,
    UpdateItemRequest,
    UpdateItemResponse,
    NotificationTemplateData
} from "@timothyw/pat-common";
import NotificationService from '@/src/services/NotificationService';
import { NotifiableWrapper } from '@/src/services/NotifiableEntity';
import { useUserDataStore } from "@/src/features/settings/controllers/useUserDataStore";

export class AgendaManager {
    private static instance: AgendaManager;
    private _agendaItems: ItemData[] = [];
    private notificationService = NotificationService.getInstance();

    private constructor() {
    }

    static getInstance(): AgendaManager {
        if (!AgendaManager.instance) {
            AgendaManager.instance = new AgendaManager();
        }
        return AgendaManager.instance;
    }

    get agendaItems(): ItemData[] {
        return [...this._agendaItems];
    }

    async loadAgendaItems(): Promise<void> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetItemsResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.GET,
            });

            if (!response.success) throw new Error('Failed to load agenda items');

            this._agendaItems = response.items.map(item => Serializer.deserializeItemData(item));
        } catch (error) {
            console.error('Failed to load agenda items:', error);
            throw error;
        }
    }

    async createAgendaItem(params: CreateItemRequest): Promise<ItemData> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<CreateItemRequest, CreateItemResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.POST,
                body: params,
            });

            if (!response.success) throw new Error('Failed to create agenda item');

            const createdItem = Serializer.deserializeItemData(response.item);

            // Register notification triggers for the new item
            await this.registerItemNotifications(createdItem);

            await this.loadAgendaItems();
            return createdItem;
        } catch (error) {
            console.error('Failed to create agenda item:', error);
            throw error;
        }
    }

    async updateAgendaItem(
        id: string,
        updates: UpdateItemRequest
    ): Promise<void> {
        console.log('Updating agenda item with body:', updates);

        try {
            await NetworkManager.shared.performAuthenticated<UpdateItemRequest, UpdateItemResponse>({
                endpoint: `/api/items/${id}`,
                method: HTTPMethod.PUT,
                body: updates,
            });

            // Refresh the list
            await this.loadAgendaItems();
        } catch (error) {
            console.error('Failed to update agenda item:', error);
            throw error;
        }
    }

    async setCompleted(id: string, completed: boolean): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated<CompleteItemRequest, CompleteItemResponse>({
                endpoint: `/api/items/${id}/complete`,
                method: HTTPMethod.PUT,
                body: {completed},
            });

            // Refresh the list
            await this.loadAgendaItems();
        } catch (error) {
            console.error('Failed to set completed status:', error);
            throw error;
        }
    }

    async deleteAgendaItem(id: string): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated<undefined, DeleteItemResponse>({
                endpoint: `/api/items/${id}`,
                method: HTTPMethod.DELETE,
            });

            // Remove notification triggers for deleted item
            await this.removeItemNotifications(id);

            // Refresh the list
            await this.loadAgendaItems();
        } catch (error) {
            console.error('Failed to delete agenda item:', error);
            throw error;
        }
    }

    // Notification integration methods

    /**
     * Create a notifiable wrapper for an agenda item
     */
    private createNotifiableItem(item: ItemData): NotifiableWrapper<ItemData> {
        return new NotifiableWrapper(
            item._id,
            'agenda_item',
            item,
            useUserDataStore.getState().data?._id
        );
    }

    /**
     * Register notification triggers for an agenda item
     */
    async registerItemNotifications(item: ItemData): Promise<void> {
        try {
            const notifiableItem = this.createNotifiableItem(item);

            // Create inherited templates if this is a new item
            await notifiableItem.createInheritedTemplates();

            // Register notification triggers
            await notifiableItem.registerNotificationTriggers();
        } catch (error) {
            console.error('Failed to register item notifications:', error);
        }
    }

    /**
     * Remove notification triggers for an agenda item
     */
    async removeItemNotifications(itemId: string): Promise<void> {
        try {
            const notifiableItem = new NotifiableWrapper(
                itemId,
                'agenda_item',
                { _id: itemId } as ItemData,
                useUserDataStore.getState().data?._id
            );

            await notifiableItem.removeNotificationTriggers();
        } catch (error) {
            console.error('Failed to remove item notifications:', error);
        }
    }

}