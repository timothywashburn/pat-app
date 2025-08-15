import { create } from 'zustand';
import { HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CreateThoughtRequest,
    CreateThoughtResponse,
    DeleteThoughtResponse,
    GetThoughtsResponse,
    Serializer,
    ThoughtData,
    UpdateThoughtRequest,
    UpdateThoughtResponse,
} from '@timothyw/pat-common';
import { performAuthenticatedRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';

interface ThoughtsState {
    thoughts: ThoughtData[];
    isInitialized: boolean;
    isLoading: boolean;
}

interface ThoughtsActions {
    loadThoughts: () => Promise<ThoughtData[]>;
    createThought: (content: string) => Promise<ThoughtData>;
    updateThought: (id: string, updates: UpdateThoughtRequest) => Promise<void>;
    deleteThought: (id: string) => Promise<void>;
}

export const useThoughtsStore = create<ThoughtsState & ThoughtsActions>((set, get) => ({
    thoughts: [],
    isInitialized: false,
    isLoading: false,

    loadThoughts: async (): Promise<ThoughtData[]> => {
        set({ isLoading: true });

        try {
            const response = await performAuthenticatedRequest<undefined, GetThoughtsResponse>({
                endpoint: '/api/thoughts',
                method: HTTPMethod.GET,
            });

            if (!response.success) {
                toastManager.errorToast(response.error);
                set({ isLoading: false });
                return [];
            }

            const thoughts = response.thoughts.map(thought => Serializer.deserialize<ThoughtData>(thought));
            set({ thoughts, isInitialized: true, isLoading: false });
            return thoughts;
        } catch (error) {
            set({ isLoading: false });
            return [];
        }
    },

    createThought: async (content: string): Promise<ThoughtData> => {
        const response = await performAuthenticatedRequest<CreateThoughtRequest, CreateThoughtResponse>({
            endpoint: '/api/thoughts',
            method: HTTPMethod.POST,
            body: { content },
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadThoughts();
        return Serializer.deserialize<ThoughtData>(response.thought);
    },

    updateThought: async (id: string, updates: UpdateThoughtRequest): Promise<void> => {
        const response = await performAuthenticatedRequest<UpdateThoughtRequest, UpdateThoughtResponse>({
            endpoint: `/api/thoughts/${id}`,
            method: HTTPMethod.PUT,
            body: updates,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadThoughts();
    },

    deleteThought: async (id: string): Promise<void> => {
        const response = await performAuthenticatedRequest<undefined, DeleteThoughtResponse>({
            endpoint: `/api/thoughts/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadThoughts();
    },
}));