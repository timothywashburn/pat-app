import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CompleteListItemRequest,
    CompleteListItemResponse,
    CreateListItemRequest, CreateListItemResponse, CreateListRequest, CreateListResponse, GetListItemsResponse,
    GetListsResponse, ItemData,
    ListData,
    ListId,
    ListItemData, ListType,
    Serializer, UpdateListItemRequest, UpdateListItemResponse, UpdateListRequest, UpdateListResponse
} from "@timothyw/pat-common";
import { ListWithItems } from "@/src/features/lists/models";
import { useToast } from "@/src/components/toast/ToastContext";

export function useLists() {
    const [lists, setLists] = useState<ListData[]>([]);
    const [listItems, setListItems] = useState<ListItemData[]>([]);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = useCallback(async (): Promise<void> => {
        await Promise.all([loadLists(), loadListItems()]);
        setIsInitialized(true);
    }, []);

    const listsWithItems = useMemo<ListWithItems[]>(() => {
        return lists.map(list => ({
            ...list,
            items: listItems.filter(item => item.listId === list._id),
        }));
    }, [lists, listItems]);

    const loadListItems = useCallback(async (): Promise<ListItemData[]> => {
        const response = await performAuthenticated<undefined, GetListItemsResponse>({
            endpoint: '/api/list-items',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        const items = response.listItems.map(listItem => Serializer.deserialize<ListItemData>(listItem));
        setListItems(items);
        return items;
    }, [performAuthenticated, errorToast]);

    const loadLists = useCallback(async (): Promise<ListData[]> => {
        const response = await performAuthenticated<undefined, GetListsResponse>({
            endpoint: '/api/lists',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        const listsData = response.lists.map(list => Serializer.deserialize<ListData>(list));
        setLists(listsData);
        return listsData;
    }, [performAuthenticated, errorToast]);

    const createList = useCallback(async (name: string, type: ListType): Promise<ListData> => {
        const body: CreateListRequest = { name, type };

        const response = await performAuthenticated<CreateListRequest, CreateListResponse>({
            endpoint: '/api/lists',
            method: HTTPMethod.POST,
            body,
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const newList = Serializer.deserialize<ListData>(response.list);
        await loadLists();
        return newList;
    }, [performAuthenticated, errorToast, loadLists]);

    const updateList = useCallback(async (id: string, updates: UpdateListRequest): Promise<void> => {
        const response = await performAuthenticated<UpdateListRequest, UpdateListResponse>({
            endpoint: `/api/lists/${id}`,
            method: HTTPMethod.PUT,
            body: updates
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadLists();
    }, [performAuthenticated, errorToast, loadLists]);

    const deleteList = useCallback(async (id: string): Promise<void> => {
        const response = await performAuthenticated({
            endpoint: `/api/lists/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadLists();
    }, [performAuthenticated, errorToast, loadLists]);

    const createListItem = useCallback(async (params: {
        name: string;
        notes?: string;
        listId: ListId;
    }): Promise<ListItemData> => {
        const body: CreateListItemRequest = {
            name: params.name,
            notes: params.notes,
            listId: params.listId,
        };

        const response = await performAuthenticated<CreateListItemRequest, CreateListItemResponse>({
            endpoint: '/api/list-items',
            method: HTTPMethod.POST,
            body,
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const newListItem = Serializer.deserialize<ListItemData>(response.listItem);
        await loadListItems();
        return newListItem;
    }, [performAuthenticated, errorToast, loadListItems]);

    const updateListItem = useCallback(async (
        id: string,
        updates: UpdateListItemRequest
    ): Promise<void> => {
        const response = await performAuthenticated<UpdateListItemRequest, UpdateListItemResponse>({
            endpoint: `/api/list-items/${id}`,
            method: HTTPMethod.PUT,
            body: updates
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadListItems();
    }, [performAuthenticated, errorToast, loadListItems]);

    const setListItemCompleted = useCallback(async (id: string, completed: boolean): Promise<void> => {
        const response = await performAuthenticated<CompleteListItemRequest, CompleteListItemResponse>({
            endpoint: `/api/list-items/${id}/complete`,
            method: HTTPMethod.PUT,
            body: { completed },
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadListItems();
    }, [performAuthenticated, errorToast, loadListItems]);

    const deleteListItem = useCallback(async (id: string): Promise<void> => {
        const response = await performAuthenticated({
            endpoint: `/api/list-items/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadListItems();
    }, [performAuthenticated, errorToast, loadListItems]);

    return {
        lists,
        listItems,
        listsWithItems,
        isInitialized,
        loadLists,
        loadListItems,
        loadAll,
        createList,
        updateList,
        deleteList,
        createListItem,
        updateListItem,
        setListItemCompleted,
        deleteListItem,
    };
}