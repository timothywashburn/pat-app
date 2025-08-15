import { create } from 'zustand';
import { HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CompleteListItemRequest,
    CompleteListItemResponse,
    CreateListItemRequest,
    CreateListItemResponse,
    CreateListRequest,
    CreateListResponse,
    GetListItemsResponse,
    GetListsResponse,
    ListData,
    ListId,
    ListItemData,
    ListType,
    Serializer,
    UpdateListItemRequest,
    UpdateListItemResponse,
    UpdateListRequest,
    UpdateListResponse
} from "@timothyw/pat-common";
import { ListWithItems } from "@/src/features/lists/models";
import { performAuthenticatedRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';

interface ListsState {
    lists: ListData[];
    listItems: ListItemData[];
    isInitialized: boolean;
    isLoading: boolean;
}

interface ListsActions {
    loadAll: () => Promise<void>;
    loadLists: () => Promise<ListData[]>;
    loadListItems: () => Promise<ListItemData[]>;
    createList: (name: string, type: ListType) => Promise<ListData>;
    updateList: (id: string, updates: UpdateListRequest) => Promise<void>;
    deleteList: (id: string) => Promise<void>;
    createListItem: (params: { name: string; notes?: string; listId: ListId; }) => Promise<ListItemData>;
    updateListItem: (id: string, updates: UpdateListItemRequest) => Promise<void>;
    setListItemCompleted: (id: string, completed: boolean) => Promise<void>;
    deleteListItem: (id: string) => Promise<void>;
    getListsWithItems: () => ListWithItems[];
}

export const useListsStore = create<ListsState & ListsActions>((set, get) => ({
    lists: [],
    listItems: [],
    isInitialized: false,
    isLoading: false,

    loadAll: async (): Promise<void> => {
        set({ isLoading: true });
        await Promise.all([get().loadLists(), get().loadListItems()]);
        set({ isInitialized: true, isLoading: false });
    },

    getListsWithItems: (): ListWithItems[] => {
        const { lists, listItems } = get();
        return lists.map(list => ({
            ...list,
            items: listItems.filter(item => item.listId === list._id),
        }));
    },

    loadListItems: async (): Promise<ListItemData[]> => {
        try {
            const response = await performAuthenticatedRequest<undefined, GetListItemsResponse>({
                endpoint: '/api/list-items',
                method: HTTPMethod.GET,
            });

            if (!response.success) {
                toastManager.errorToast(response.error);
                return [];
            }

            const items = response.listItems.map(listItem => Serializer.deserialize<ListItemData>(listItem));
            set({ listItems: items });
            return items;
        } catch (error) {
            return [];
        }
    },

    loadLists: async (): Promise<ListData[]> => {
        try {
            const response = await performAuthenticatedRequest<undefined, GetListsResponse>({
                endpoint: '/api/lists',
                method: HTTPMethod.GET,
            });

            if (!response.success) {
                toastManager.errorToast(response.error);
                return [];
            }

            const listsData = response.lists.map(list => Serializer.deserialize<ListData>(list));
            set({ lists: listsData });
            return listsData;
        } catch (error) {
            return [];
        }
    },

    createList: async (name: string, type: ListType): Promise<ListData> => {
        const body: CreateListRequest = { name, type };

        const response = await performAuthenticatedRequest<CreateListRequest, CreateListResponse>({
            endpoint: '/api/lists',
            method: HTTPMethod.POST,
            body,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const newList = Serializer.deserialize<ListData>(response.list);
        await get().loadLists();
        return newList;
    },

    updateList: async (id: string, updates: UpdateListRequest): Promise<void> => {
        const response = await performAuthenticatedRequest<UpdateListRequest, UpdateListResponse>({
            endpoint: `/api/lists/${id}`,
            method: HTTPMethod.PUT,
            body: updates
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadLists();
    },

    deleteList: async (id: string): Promise<void> => {
        const response = await performAuthenticatedRequest<undefined, any>({
            endpoint: `/api/lists/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadLists();
    },

    createListItem: async (params: {
        name: string;
        notes?: string;
        listId: ListId;
    }): Promise<ListItemData> => {
        const body: CreateListItemRequest = {
            name: params.name,
            notes: params.notes,
            listId: params.listId,
        };

        const response = await performAuthenticatedRequest<CreateListItemRequest, CreateListItemResponse>({
            endpoint: '/api/list-items',
            method: HTTPMethod.POST,
            body,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const newListItem = Serializer.deserialize<ListItemData>(response.listItem);
        await get().loadListItems();
        return newListItem;
    },

    updateListItem: async (
        id: string,
        updates: UpdateListItemRequest
    ): Promise<void> => {
        const response = await performAuthenticatedRequest<UpdateListItemRequest, UpdateListItemResponse>({
            endpoint: `/api/list-items/${id}`,
            method: HTTPMethod.PUT,
            body: updates
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadListItems();
    },

    setListItemCompleted: async (id: string, completed: boolean): Promise<void> => {
        const response = await performAuthenticatedRequest<CompleteListItemRequest, CompleteListItemResponse>({
            endpoint: `/api/list-items/${id}/complete`,
            method: HTTPMethod.PUT,
            body: { completed },
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadListItems();
    },

    deleteListItem: async (id: string): Promise<void> => {
        const response = await performAuthenticatedRequest<undefined, any>({
            endpoint: `/api/list-items/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadListItems();
    },
}));