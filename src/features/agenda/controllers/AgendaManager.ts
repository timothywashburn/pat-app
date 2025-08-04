import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse,
    GetItemsResponse, ItemData, Serializer,
    UpdateItemRequest,
    UpdateItemResponse
} from "@timothyw/pat-common";

export class AgendaManager {
    private static instance: AgendaManager;
    private _agendaItems: ItemData[] = [];

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

            await this.loadAgendaItems();
            return Serializer.deserializeItemData(response.item);
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

            // Refresh the list
            await this.loadAgendaItems();
        } catch (error) {
            console.error('Failed to delete agenda item:', error);
            throw error;
        }
    }
}