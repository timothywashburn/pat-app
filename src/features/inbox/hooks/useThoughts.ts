import { useState, useCallback } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
import {
    CreateThoughtRequest,
    CreateThoughtResponse, DeleteThoughtResponse,
    GetThoughtsResponse, Serializer, ThoughtData,
    UpdateThoughtRequest, UpdateThoughtResponse,
} from '@timothyw/pat-common';
import { useNotifiableEntity } from '../../notifications/hooks/useNotifiableEntity';
import { useUserDataStore } from '@/src/stores/useUserDataStore';

export interface ThoughtsHookState {
    thoughts: ThoughtData[];
    isLoading: boolean;
    error: string | null;
}

export function useThoughts() {
    const [state, setState] = useState<ThoughtsHookState>({
        thoughts: [],
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

    const setThoughts = useCallback((thoughts: ThoughtData[]) => {
        setState(prev => ({ ...prev, thoughts, error: null }));
    }, []);

    const loadThoughts = useCallback(async (): Promise<ThoughtData[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, GetThoughtsResponse>({
                endpoint: '/api/thoughts',
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to load thoughts');

            const thoughts = response.thoughts.map(thought => Serializer.deserializeThoughtData(thought));
            setThoughts(thoughts);
            setLoading(false);
            return thoughts;
        }, { errorMessage: 'Failed to load thoughts' });
    }, [asyncOp, performAuthenticated, setLoading, setError, setThoughts]);

    const createThought = useCallback(async (content: string): Promise<ThoughtData> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateThoughtRequest, CreateThoughtResponse>({
                endpoint: '/api/thoughts',
                method: HTTPMethod.POST,
                body: { content },
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create thought');

            await loadThoughts();
            setLoading(false);

            return Serializer.deserializeThoughtData(response.thought);
        }, { errorMessage: 'Failed to create thought' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadThoughts]);

    const updateThought = useCallback(async (id: string, content: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<UpdateThoughtRequest, UpdateThoughtResponse>({
                endpoint: `/api/thoughts/${id}`,
                method: HTTPMethod.PUT,
                body: { content },
            }, { skipLoadingState: true });

            await loadThoughts();
            setLoading(false);
        }, { errorMessage: 'Failed to update thought' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadThoughts]);

    const deleteThought = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<undefined, DeleteThoughtResponse>({
                endpoint: `/api/thoughts/${id}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            await loadThoughts();
            setLoading(false);
        }, { errorMessage: 'Failed to delete thought' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadThoughts]);

    return {
        ...state,
        loadThoughts,
        createThought,
        updateThought,
        deleteThought,
    };
}

/**
 * Hook for managing notifications for the inbox
 * The inbox is treated as a single entity - individual thoughts are not notifiable
 */
export function useInboxNotifications(thoughts: ThoughtData[] = []) {
    const { data: userData } = useUserDataStore();
    
    const inboxNotifiable = useNotifiableEntity({
        id: 'inbox', // Fixed ID since there's only one inbox per user
        entityType: 'inbox',
        entityData: { thoughts },
        userId: userData?._id || '',
    });

    /**
     * Register notification triggers for the inbox
     * Called when the inbox is first accessed or when thoughts are modified
     */
    const registerInboxNotifications = useCallback(async (): Promise<void> => {
        if (!userData?._id) return;

        try {
            await inboxNotifiable.registerNotificationTriggers();
        } catch (error) {
            console.error('Failed to register inbox notifications:', error);
        }
    }, [userData, inboxNotifiable]);

    /**
     * Remove notification triggers for the inbox
     * Called if user wants to disable inbox notifications
     */
    const removeInboxNotifications = useCallback(async (): Promise<void> => {
        if (!userData?._id) return;

        try {
            await inboxNotifiable.removeNotificationTriggers();
        } catch (error) {
            console.error('Failed to remove inbox notifications:', error);
        }
    }, [userData, inboxNotifiable]);

    return {
        registerInboxNotifications,
        removeInboxNotifications,
        ...inboxNotifiable,
    };
}