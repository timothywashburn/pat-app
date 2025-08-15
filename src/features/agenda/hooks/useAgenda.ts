import { useCallback } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import { useBaseCrud } from '@/src/hooks/useBaseCrud';
import {
    CompleteItemRequest, CompleteItemResponse,
    CreateItemRequest,
    CreateItemResponse, DeleteItemResponse,
    GetItemsResponse, ItemData,
    UpdateItemRequest,
    UpdateItemResponse,
} from '@timothyw/pat-common';
import { useToast } from "@/src/components/toast/ToastContext";

export function useAgenda() {
    const baseCrud = useBaseCrud<
        ItemData,
        CreateItemRequest,
        UpdateItemRequest,
        GetItemsResponse,
        CreateItemResponse,
        UpdateItemResponse,
        DeleteItemResponse
    >('/api/items', 'items', 'item');

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

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

        await baseCrud.load();
    }, [performAuthenticated, errorToast, baseCrud.load]);

    return {
        agendaItems: baseCrud.data,
        isInitialized: baseCrud.isInitialized,
        loadAgendaItems: baseCrud.load,
        createAgendaItem: baseCrud.create,
        updateAgendaItem: baseCrud.update,
        setCompleted,
        deleteAgendaItem: baseCrud.delete,
    };
}