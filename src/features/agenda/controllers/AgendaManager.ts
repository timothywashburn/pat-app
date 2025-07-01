import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse, deserializeItemData,
    GetItemsResponse, ItemData,
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
            }) as GetItemsResponse;

            if (!response.items || !Array.isArray(response.items)) {
                throw new Error('Invalid response format');
            }

            this._agendaItems = response.items.map(deserializeItemData);
        } catch (error) {
            console.error('Failed to load agenda items:', error);
            throw error;
        }
    }

    async createAgendaItem(params: CreateItemRequest): Promise<ItemData> {
        const body: CreateItemRequest = {
            name: params.name,
            notes: params.notes || '',
            urgent: params.urgent || false,
        };

        if (params.dueDate) {
            body.dueDate = params.dueDate;
        }

        if (params.category) {
            body.category = params.category;
        }

        if (params.type) {
            body.type = params.type;
        }

        try {
            const response = await NetworkManager.shared.performAuthenticated<CreateItemRequest, CreateItemResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.POST,
                body,
            });

            if (!response.item) {
                throw new Error('Invalid response format');
            }

            await this.loadAgendaItems();
            return deserializeItemData(response.item);
        } catch (error) {
            console.error('Failed to create agenda item:', error);
            throw error;
        }
    }

    async updateAgendaItem(
        id: string,
        updates: UpdateItemRequest
    ): Promise<void> {
        const body: UpdateItemRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }

        if (updates.dueDate !== undefined) {
            body.dueDate = updates.dueDate ? updates.dueDate.toISOString() as unknown as Date : null;
        }

        if (updates.notes !== undefined) {
            body.notes = updates.notes;
        }

        if (updates.urgent !== undefined) {
            body.urgent = updates.urgent;
        }

        if (updates.category !== undefined) {
            body.category = updates.category;
        }

        if (updates.type !== undefined) {
            body.type = updates.type;
        }

        try {
            await NetworkManager.shared.performAuthenticated<UpdateItemRequest, UpdateItemResponse>({
                endpoint: `/api/items/${id}`,
                method: HTTPMethod.PUT,
                body,
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