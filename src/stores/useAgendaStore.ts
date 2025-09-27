import { create } from 'zustand';
import {
    CompleteAgendaItemRequest, CompleteAgendaItemResponse,
    CreateAgendaItemRequest,
    CreateAgendaItemResponse, DeleteAgendaItemResponse,
    GetAgendaItemsResponse, AgendaItemData,
    UpdateAgendaItemRequest,
    UpdateAgendaItemResponse,
    Serializer
} from '@timothyw/pat-common';
import { performAuthenticatedRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';
import { HTTPMethod } from "@/src/hooks/useNetworkRequestTypes";

interface AgendaState {
    items: AgendaItemData[];
    isInitialized: boolean;
    isLoading: boolean;
}

interface AgendaActions {
    loadItems: () => Promise<AgendaItemData[]>;
    createItem: (params: CreateAgendaItemRequest) => Promise<AgendaItemData>;
    updateItem: (id: string, updates: UpdateAgendaItemRequest) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    setCompleted: (id: string, completed: boolean) => Promise<void>;
}

// TODO: need a get items so load items can be called automatically if the items haven't been loaded yet (probably sane for all entities)
export const useAgendaStore = create<AgendaState & AgendaActions>((set, get) => ({
    items: [],
    isInitialized: false,
    isLoading: false,

    loadItems: async (): Promise<AgendaItemData[]> => {
        set({ isLoading: true });

        console.log("hi")
        console.log("hi")
        console.log("hi")
        console.log("hi")

        try {
            const response = await performAuthenticatedRequest<undefined, GetAgendaItemsResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.GET,
            });

            if (!response.success) {
                toastManager.errorToast(response.error);
                set({ isLoading: false });
                return [];
            }

            const items = response.agendaItems.map(item => Serializer.deserialize<AgendaItemData>(item));
            set({ items, isInitialized: true, isLoading: false });
            return items;
        } catch (error) {
            set({ isLoading: false });
            return [];
        }
    },

    createItem: async (params: CreateAgendaItemRequest): Promise<AgendaItemData> => {
        const response = await performAuthenticatedRequest<CreateAgendaItemRequest, CreateAgendaItemResponse>({
            endpoint: '/api/items',
            method: HTTPMethod.POST,
            body: params,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const createdItem = Serializer.deserialize<AgendaItemData>(response.agendaItem);
        await get().loadItems();
        return createdItem;
    },

    updateItem: async (id: string, updates: UpdateAgendaItemRequest): Promise<void> => {
        const response = await performAuthenticatedRequest<UpdateAgendaItemRequest, UpdateAgendaItemResponse>({
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
        const response = await performAuthenticatedRequest<undefined, DeleteAgendaItemResponse>({
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
        const response = await performAuthenticatedRequest<CompleteAgendaItemRequest, CompleteAgendaItemResponse>({
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