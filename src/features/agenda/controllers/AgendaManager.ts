import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { AuthState } from '@/src/features/auth/controllers/AuthState';
import { AgendaItem } from "@/src/features/agenda/models";
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse,
    GetItemsResponse,
    UpdateItemRequest,
    UpdateItemResponse
} from "@timothyw/pat-common";

export class AgendaManager {
    private static instance: AgendaManager;
    private _agendaItems: AgendaItem[] = [];

    private constructor() {
    }

    static getInstance(): AgendaManager {
        if (!AgendaManager.instance) {
            AgendaManager.instance = new AgendaManager();
        }
        return AgendaManager.instance;
    }

    get agendaItems(): AgendaItem[] {
        return [...this._agendaItems];
    }

    async loadAgendaItems(): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            console.log('loadAgendaItems: no auth token')
            return;
        }

        try {
            const response = await NetworkManager.shared.perform<undefined, GetItemsResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.GET,
                token: authToken,
            }) as GetItemsResponse;

            if (!response.items || !Array.isArray(response.items)) {
                throw new Error('Invalid response format');
            }

            const items: AgendaItem[] = response.items.map((item: any) => ({
                id: item._id || item.id,
                name: item.name,
                date: item.dueDate ? new Date(item.dueDate) : undefined,
                notes: item.notes,
                completed: !!item.completed,
                urgent: !!item.urgent,
                category: item.category,
                type: item.type,
            }));

            this._agendaItems = items;
        } catch (error) {
            console.error('Failed to load agenda items:', error);
            throw error;
        }
    }

    async createAgendaItem(params: {
        name: string;
        date?: Date;
        notes?: string;
        urgent?: boolean;
        category?: string;
        type?: string;
    }): Promise<AgendaItem> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        const body: CreateItemRequest = {
            name: params.name,
            notes: params.notes || '',
            urgent: params.urgent || false,
        };

        if (params.date) {
            body.dueDate = params.date.toISOString();
        }

        if (params.category) {
            body.category = params.category;
        }

        if (params.type) {
            body.type = params.type;
        }

        try {
            const response = await NetworkManager.shared.perform<CreateItemRequest, CreateItemResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.POST,
                body,
                token: authToken,
            });

            if (!response.item) {
                throw new Error('Invalid response format');
            }

            const item = response.item;
            const agendaItem: AgendaItem = {
                id: item.id,
                name: item.name,
                date: item.dueDate ? new Date(item.dueDate) : undefined,
                notes: item.notes,
                completed: item.completed,
                urgent: item.urgent,
                category: item.category,
                type: item.type,
            };

            await this.loadAgendaItems();
            return agendaItem;
        } catch (error) {
            console.error('Failed to create agenda item:', error);
            throw error;
        }
    }

    async updateAgendaItem(
        id: string,
        updates: {
            name?: string;
            date?: Date;
            notes?: string;
            urgent?: boolean;
            category?: string;
            type?: string;
        }
    ): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        const body: UpdateItemRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }

        if (updates.date !== undefined) {
            body.dueDate = updates.date ? updates.date.toISOString() : null;
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
            await NetworkManager.shared.perform<UpdateItemRequest, UpdateItemResponse>({
                endpoint: `/api/items/${id}`,
                method: HTTPMethod.PUT,
                body,
                token: authToken,
            });

            // Refresh the list
            await this.loadAgendaItems();
        } catch (error) {
            console.error('Failed to update agenda item:', error);
            throw error;
        }
    }

    async setCompleted(id: string, completed: boolean): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        try {
            await NetworkManager.shared.perform<CompleteItemRequest, CompleteItemResponse>({
                endpoint: `/api/items/${id}/complete`,
                method: HTTPMethod.PUT,
                body: {completed},
                token: authToken,
            });

            // Refresh the list
            await this.loadAgendaItems();
        } catch (error) {
            console.error('Failed to set completed status:', error);
            throw error;
        }
    }

    async deleteAgendaItem(id: string): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        try {
            await NetworkManager.shared.perform<undefined, DeleteItemResponse>({
                endpoint: `/api/items/${id}`,
                method: HTTPMethod.DELETE,
                token: authToken,
            });

            // Refresh the list
            await this.loadAgendaItems();
        } catch (error) {
            console.error('Failed to delete agenda item:', error);
            throw error;
        }
    }
}