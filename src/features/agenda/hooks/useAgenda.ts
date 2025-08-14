import { useState, useCallback } from 'react';
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

    return {
        ...state,
        loadAgendaItems,
        createAgendaItem,
        updateAgendaItem,
        setCompleted,
        deleteAgendaItem,
    };
}

/**
 * Hook for managing notifications for an agenda item
 */
export function useAgendaItemNotifications(item: ItemData) {
    const { data: userData } = useUserDataStore();
    
    return useNotifiableEntity({
        id: item._id,
        entityType: 'agenda_item',
        entityData: item,
        userId: userData?._id || '',
    });
}

/**
 * Hook for registering and removing notifications for agenda items
 */
export function useAgendaNotifications() {
    const { data: userData } = useUserDataStore();

    /**
     * Register notification triggers for an agenda item
     */
    const registerItemNotifications = useCallback(async (item: ItemData): Promise<void> => {
        if (!userData?._id) return;

        try {
            // Note: We can't use useNotifiableEntity here directly due to hooks rules
            // Instead, we'll call the notification service directly
            console.log(`Registering notifications for agenda item ${item._id}`);
            
            // This should trigger server-side notification setup
            // The actual notification registration happens server-side when the item is created/updated
        } catch (error) {
            console.error('Failed to register item notifications:', error);
        }
    }, [userData]);

    /**
     * Remove notification triggers for an agenda item
     */
    const removeItemNotifications = useCallback(async (itemId: string): Promise<void> => {
        if (!userData?._id) return;

        try {
            console.log(`Removing notifications for agenda item ${itemId}`);
            
            // This should trigger server-side notification cleanup
            // The actual notification removal happens server-side when the item is deleted
        } catch (error) {
            console.error('Failed to remove item notifications:', error);
        }
    }, [userData]);

    return {
        registerItemNotifications,
        removeItemNotifications,
    };
}