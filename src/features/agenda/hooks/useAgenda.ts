import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse,
    GetItemsResponse, ItemData, Serializer,
    UpdateItemRequest,
    UpdateItemResponse,
} from '@timothyw/pat-common';
import { useNotifiableEntity } from '../../notifications/hooks/useNotifiableEntity';
import { useUserDataStore } from '@/src/stores/useUserDataStore';

export interface AgendaHookState {
    agendaItems: ItemData[];
    isLoading: boolean;
    error: string | null;
}

export function useAgenda() {
    const [state, setState] = useState<AgendaHookState>({
        agendaItems: [],
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

    const setAgendaItems = useCallback((items: ItemData[]) => {
        setState(prev => ({ ...prev, agendaItems: items, error: null }));
    }, []);

    const loadAgendaItems = useCallback(async (): Promise<ItemData[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, GetItemsResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to load agenda items');

            const items = response.items.map(item => Serializer.deserializeItemData(item));
            setAgendaItems(items);
            setLoading(false);
            return items;
        }, { errorMessage: 'Failed to load agenda items' });
    }, [asyncOp, performAuthenticated, setLoading, setError, setAgendaItems]);

    const createAgendaItem = useCallback(async (params: CreateItemRequest): Promise<ItemData> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateItemRequest, CreateItemResponse>({
                endpoint: '/api/items',
                method: HTTPMethod.POST,
                body: params,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create agenda item');

            const createdItem = Serializer.deserializeItemData(response.item);

            await loadAgendaItems();
            setLoading(false);

            return createdItem;
        }, { errorMessage: 'Failed to create agenda item' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadAgendaItems]);

    const updateAgendaItem = useCallback(async (
        id: string,
        updates: UpdateItemRequest
    ): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            console.log('Updating agenda item with body:', updates);

            await performAuthenticated<UpdateItemRequest, UpdateItemResponse>({
                endpoint: `/api/items/${id}`,
                method: HTTPMethod.PUT,
                body: updates,
            }, { skipLoadingState: true });

            await loadAgendaItems();
            setLoading(false);
        }, { errorMessage: 'Failed to update agenda item' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadAgendaItems]);

    const setCompleted = useCallback(async (id: string, completed: boolean): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<CompleteItemRequest, CompleteItemResponse>({
                endpoint: `/api/items/${id}/complete`,
                method: HTTPMethod.PUT,
                body: { completed },
            }, { skipLoadingState: true });

            await loadAgendaItems();
            setLoading(false);
        }, { errorMessage: 'Failed to set completed status' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadAgendaItems]);

    const deleteAgendaItem = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<undefined, DeleteItemResponse>({
                endpoint: `/api/items/${id}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            await loadAgendaItems();
            setLoading(false);
        }, { errorMessage: 'Failed to delete agenda item' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadAgendaItems]);

    useEffect(() => {
        loadAgendaItems().catch(error => {
            console.error('Failed to load agenda items on mount:', error);
        });
    }, []);

    return {
        ...state,
        loadAgendaItems,
        createAgendaItem,
        updateAgendaItem,
        setCompleted,
        deleteAgendaItem,
    };
}