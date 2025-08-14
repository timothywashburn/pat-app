import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse,
    GetItemsResponse, ItemData, Serializer,
    UpdateItemRequest,
    UpdateItemResponse,
} from '@timothyw/pat-common';
import { useToast } from "@/src/components/toast/ToastContext";

export function useAgenda() {
    const [ agendaItems, setAgendaItems ] = useState<ItemData[]>([]);
    const [ isInitialized, setIsInitialized ] = useState<boolean>(false);

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

    useEffect(() => {
        loadAgendaItems();
    }, []);

    const loadAgendaItems = useCallback(async (): Promise<ItemData[]> => {
        const response = await performAuthenticated<undefined, GetItemsResponse>({
            endpoint: '/api/items',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        const items = response.items.map(item => Serializer.deserialize<ItemData>(item));
        setAgendaItems(items);
        setIsInitialized(true);
        return items;
    }, [performAuthenticated, errorToast, setAgendaItems, setIsInitialized]);

    const createAgendaItem = useCallback(async (params: CreateItemRequest): Promise<ItemData> => {
        const response = await performAuthenticated<CreateItemRequest, CreateItemResponse>({
            endpoint: '/api/items',
            method: HTTPMethod.POST,
            body: params,
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const createdItem = Serializer.deserialize<ItemData>(response.item);
        await loadAgendaItems();
        return createdItem;
    }, [performAuthenticated, errorToast, loadAgendaItems]);

    const updateAgendaItem = useCallback(async (
        id: string,
        updates: UpdateItemRequest
    ): Promise<void> => {
        const response = await performAuthenticated<UpdateItemRequest, UpdateItemResponse>({
            endpoint: `/api/items/${id}`,
            method: HTTPMethod.PUT,
            body: updates,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadAgendaItems();
    }, [performAuthenticated, errorToast, loadAgendaItems]);

    const setCompleted = useCallback(async (id: string, completed: boolean): Promise<void> => {
        const response = await performAuthenticated<CompleteItemRequest, CompleteItemResponse>({
            endpoint: `/api/items/${id}/complete`,
            method: HTTPMethod.PUT,
            body: { completed },
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadAgendaItems();
    }, [performAuthenticated, errorToast, loadAgendaItems]);

    const deleteAgendaItem = useCallback(async (id: string): Promise<void> => {
        const response = await performAuthenticated<undefined, DeleteItemResponse>({
            endpoint: `/api/items/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadAgendaItems();
    }, [performAuthenticated, errorToast, loadAgendaItems]);

    return {
        agendaItems,
        isInitialized,
        loadAgendaItems,
        createAgendaItem,
        updateAgendaItem,
        setCompleted,
        deleteAgendaItem,
    };
}