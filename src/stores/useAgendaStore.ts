import { create } from 'zustand';
import { HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse,
    GetItemsResponse, ItemData,
    UpdateItemRequest,
    UpdateItemResponse,
    Serializer
} from '@timothyw/pat-common';
import { performAuthenticatedRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';

interface AgendaState {
    items: ItemData[];
    isInitialized: boolean;
    isLoading: boolean;
}

interface AgendaActions {
    loadItems: () => Promise<ItemData[]>;
    createItem: (params: CreateItemRequest) => Promise<ItemData>;
    updateItem: (id: string, updates: UpdateItemRequest) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    setCompleted: (id: string, completed: boolean) => Promise<void>;
}

export const useAgendaStore = create<AgendaState & AgendaActions>((set, get) => ({
    items: [],
    isInitialized: false,
    isLoading: false,

    loadItems: async (): Promise<ItemData[]> => {
        set({ isLoading: true });

        try {
            const response = await performAuthenticatedRequest<undefined, GetItemsResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.GET,
            });

            if (!response.success) {
                toastManager.errorToast(response.error);
                set({ isLoading: false });
                return [];
            }

            const items = response.items.map(item => Serializer.deserialize<ItemData>(item));
            set({ items, isInitialized: true, isLoading: false });
            return items;
        } catch (error) {
            set({ isLoading: false });
            return [];
        }
    },

    createItem: async (params: CreateItemRequest): Promise<ItemData> => {
        const response = await performAuthenticatedRequest<CreateItemRequest, CreateItemResponse>({
            endpoint: '/api/items',
            method: HTTPMethod.POST,
            body: params,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const createdItem = Serializer.deserialize<ItemData>(response.item);
        await get().loadItems();
        return createdItem;
    },

    updateItem: async (id: string, updates: UpdateItemRequest): Promise<void> => {
        const response = await performAuthenticatedRequest<UpdateItemRequest, UpdateItemResponse>({
            endpoint: `/api/items/${id}`,
            method: HTTPMethod.PUT,
            body: updates,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadItems();
    },

    deleteItem: async (id: string): Promise<void> => {
        const response = await performAuthenticatedRequest<undefined, DeleteItemResponse>({
            endpoint: `/api/items/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadItems();
    },

    setCompleted: async (id: string, completed: boolean): Promise<void> => {
        const response = await performAuthenticatedRequest<CompleteItemRequest, CompleteItemResponse>({
            endpoint: `/api/items/${id}/complete`,
            method: HTTPMethod.PUT,
            body: { completed },
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadItems();
    },
}));