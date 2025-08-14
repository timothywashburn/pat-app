import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CreateThoughtRequest,
    CreateThoughtResponse, DeleteThoughtResponse,
    GetThoughtsResponse, ItemData, Serializer, ThoughtData,
    UpdateThoughtRequest, UpdateThoughtResponse,
} from '@timothyw/pat-common';
import { useToast } from "@/src/components/toast/ToastContext";

export interface ThoughtsHookState {
    thoughts: ThoughtData[];
    isInitialized: boolean;
    error: string | null;
}

export function useThoughts() {
    const [ thoughts, setThoughts ] = useState<ThoughtData[]>([]);
    const [ isInitialized, setIsInitialized ] = useState<boolean>(false);

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

    useEffect(() => {
        loadThoughts();
    }, []);

    const loadThoughts = useCallback(async (): Promise<ThoughtData[]> => {
        const response = await performAuthenticated<undefined, GetThoughtsResponse>({
            endpoint: '/api/thoughts',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        const thoughts = response.thoughts.map(thought => Serializer.deserialize<ThoughtData>(thought));
        setThoughts(thoughts);
        setIsInitialized(true);
        return thoughts;
    }, [performAuthenticated, errorToast, setThoughts, setIsInitialized]);

    const createThought = useCallback(async (content: string): Promise<ThoughtData> => {
        const response = await performAuthenticated<CreateThoughtRequest, CreateThoughtResponse>({
            endpoint: '/api/thoughts',
            method: HTTPMethod.POST,
            body: { content },
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        await loadThoughts();
        return Serializer.deserialize<ThoughtData>(response.thought);
    }, [performAuthenticated, errorToast, loadThoughts]);

    const updateThought = useCallback(async (id: string, updates: UpdateThoughtRequest): Promise<void> => {
        const response = await performAuthenticated<UpdateThoughtRequest, UpdateThoughtResponse>({
            endpoint: `/api/thoughts/${id}`,
            method: HTTPMethod.PUT,
            body: updates,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadThoughts();
    }, [performAuthenticated, errorToast, loadThoughts]);

    const deleteThought = useCallback(async (id: string): Promise<void> => {
        const response = await performAuthenticated<undefined, DeleteThoughtResponse>({
            endpoint: `/api/thoughts/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadThoughts();
    }, [performAuthenticated, errorToast, loadThoughts]);

    return {
        thoughts,
        isInitialized,
        loadThoughts,
        createThought,
        updateThought,
        deleteThought,
    };
}