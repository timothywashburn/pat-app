import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
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

export interface ListsHookState {
    lists: ListData[];
    listItems: ListItemData[];
    listsWithItems: ListWithItems[];
    isLoading: boolean;
    error: string | null;
}

export function useLists() {
    const [state, setState] = useState<ListsHookState>({
        lists: [],
        listItems: [],
        listsWithItems: [],
        isLoading: false,
        error: null,
    });

    const { performAuthenticated } = useNetworkRequest();
    const asyncOp = useAsyncOperation();

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const updateListsWithItems = useCallback((lists: ListData[], items: ListItemData[]) => {
        const listsWithItems = lists.map(list => ({
            ...list,
            items: items.filter(item => item.listId === list._id),
        }));

        setState(prev => ({
            ...prev,
            lists,
            listItems: items,
            listsWithItems,
            error: null
        }));
    }, []);

    const loadLists = useCallback(async (): Promise<ListData[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, GetListsResponse>({
                endpoint: '/api/lists',
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to load lists');

            const lists = response.lists.map(list => Serializer.deserialize<ListData>(list));

            // Also load list items to update the combined view
            const listItems = await loadListItemsInternal();
            updateListsWithItems(lists, listItems);
            setLoading(false);

            return lists;
        }, { errorMessage: 'Failed to load lists' });
    }, [asyncOp, performAuthenticated, setLoading, setError, updateListsWithItems]);

    const loadListItemsInternal = useCallback(async (): Promise<ListItemData[]> => {
        const response = await performAuthenticated<undefined, GetListItemsResponse>({
            endpoint: '/api/list-items',
            method: HTTPMethod.GET,
        }, { skipLoadingState: true });

        if (!response.success) throw new Error('Failed to load list items');

        return response.listItems.map(listItem => Serializer.deserialize<ListItemData>(listItem));
    }, [performAuthenticated]);

    const loadListItems = useCallback(async (): Promise<ListItemData[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const listItems = await loadListItemsInternal();
            updateListsWithItems(state.lists, listItems);
            setLoading(false);

            return listItems;
        }, { errorMessage: 'Failed to load list items' });
    }, [asyncOp, state.lists, setLoading, setError, updateListsWithItems, loadListItemsInternal]);

    const createList = useCallback(async (name: string, type: ListType): Promise<ListData> => {
        const body: CreateListRequest = { name, type };

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateListRequest, CreateListResponse>({
                endpoint: '/api/lists',
                method: HTTPMethod.POST,
                body,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create list');

            const newList = Serializer.deserialize<ListData>(response.list);

            await loadLists();
            setLoading(false);

            return newList;
        }, { errorMessage: 'Failed to create list' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadLists]);

    const updateList = useCallback(async (id: string, updates: UpdateListRequest): Promise<void> => {
        const body: UpdateListRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }
        if (updates.type !== undefined) {
            body.type = updates.type;
        }

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<UpdateListRequest, UpdateListResponse>({
                endpoint: `/api/lists/${id}`,
                method: HTTPMethod.PUT,
                body,
            }, { skipLoadingState: true });

            await loadLists();
            setLoading(false);
        }, { errorMessage: 'Failed to update list' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadLists]);

    const deleteList = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated({
                endpoint: `/api/lists/${id}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            await loadLists();
            setLoading(false);
        }, { errorMessage: 'Failed to delete list' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadLists]);

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

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateListItemRequest, CreateListItemResponse>({
                endpoint: '/api/list-items',
                method: HTTPMethod.POST,
                body,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create list item');

            const newListItem = Serializer.deserialize<ListItemData>(response.listItem);

            await loadListItems();
            setLoading(false);

            return newListItem;
        }, { errorMessage: 'Failed to create list item' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadListItems]);

    const updateListItem = useCallback(async (
        id: string,
        updates: UpdateListItemRequest
    ): Promise<void> => {
        const body: UpdateListItemRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }
        if (updates.notes !== undefined) {
            body.notes = updates.notes;
        }
        if (updates.completed !== undefined) {
            body.completed = updates.completed;
        }
        if (updates.listId !== undefined) {
            body.listId = updates.listId;
        }

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<UpdateListItemRequest, UpdateListItemResponse>({
                endpoint: `/api/list-items/${id}`,
                method: HTTPMethod.PUT,
                body,
            }, { skipLoadingState: true });

            await loadListItems();
            setLoading(false);
        }, { errorMessage: 'Failed to update list item' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadListItems]);

    const setListItemCompleted = useCallback(async (id: string, completed: boolean): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<CompleteListItemRequest, CompleteListItemResponse>({
                endpoint: `/api/list-items/${id}/complete`,
                method: HTTPMethod.PUT,
                body: { completed },
            }, { skipLoadingState: true });

            await loadListItems();
            setLoading(false);
        }, { errorMessage: 'Failed to set list item completed status' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadListItems]);

    const deleteListItem = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated({
                endpoint: `/api/list-items/${id}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            await loadListItems();
            setLoading(false);
        }, { errorMessage: 'Failed to delete list item' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadListItems]);

    useEffect(() => {
        loadLists().catch(error => {
            console.error('Failed to load lists on mount:', error);
        });
    }, []);

    return {
        ...state,
        loadLists,
        loadListItems,
        createList,
        updateList,
        deleteList,
        createListItem,
        updateListItem,
        setListItemCompleted,
        deleteListItem,
    };
}