import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod, ApiResponseBody } from '@/src/hooks/useNetworkRequest';
import { Serializer } from '@timothyw/pat-common';
import { useToast } from "@/src/components/toast/ToastContext";

export interface BaseCrudOptions {
    autoLoad?: boolean;
}

export interface BaseCrudHook<T, CreateRequest, UpdateRequest> {
    data: T[];
    isInitialized: boolean;
    load: () => Promise<T[]>;
    create: (params: CreateRequest) => Promise<T>;
    update: (id: string, updates: UpdateRequest) => Promise<void>;
    delete: (id: string) => Promise<void>;
}

export function useBaseCrud<T extends { _id: string }, CreateRequest, UpdateRequest, GetResponse, CreateResponse, UpdateResponse, DeleteResponse>(
    endpoint: string,
    responseDataKey: string,
    createdItemKey: string,
    options: BaseCrudOptions = {}
): BaseCrudHook<T, CreateRequest, UpdateRequest> {
    const [data, setData] = useState<T[]>([]);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

    const { autoLoad = true } = options;

    const load = useCallback(async (): Promise<T[]> => {
        const response = await performAuthenticated<undefined, GetResponse>({
            endpoint,
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        const items = (response as any)[responseDataKey].map((item: any) => Serializer.deserialize<T>(item));
        setData(items);
        setIsInitialized(true);
        return items;
    }, [performAuthenticated, errorToast, endpoint, responseDataKey]);

    useEffect(() => {
        if (autoLoad) {
            load();
        }
    }, [autoLoad, load]);

    const create = useCallback(async (params: CreateRequest): Promise<T> => {
        const response = await performAuthenticated<CreateRequest, CreateResponse>({
            endpoint,
            method: HTTPMethod.POST,
            body: params,
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const createdItem = Serializer.deserialize<T>((response as any)[createdItemKey]);
        await load();
        return createdItem;
    }, [performAuthenticated, errorToast, endpoint, createdItemKey, load]);

    const update = useCallback(async (id: string, updates: UpdateRequest): Promise<void> => {
        const response = await performAuthenticated<UpdateRequest, UpdateResponse>({
            endpoint: `${endpoint}/${id}`,
            method: HTTPMethod.PUT,
            body: updates,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await load();
    }, [performAuthenticated, errorToast, endpoint, load]);

    const deleteItem = useCallback(async (id: string): Promise<void> => {
        const response = await performAuthenticated<undefined, DeleteResponse>({
            endpoint: `${endpoint}/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await load();
    }, [performAuthenticated, errorToast, endpoint, load]);

    return {
        data,
        isInitialized,
        load,
        create,
        update,
        delete: deleteItem,
    };
}