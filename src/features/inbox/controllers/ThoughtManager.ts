import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { AuthState } from '@/src/features/auth/controllers/AuthState';
import {
    CreateThoughtRequest,
    CreateThoughtResponse, DeleteThoughtResponse,
    GetThoughtsResponse,
    UpdateThoughtRequest, UpdateThoughtResponse
} from "@timothyw/pat-common";

export interface Thought {
    id: string;
    content: string;
}

class ThoughtManager {
    private static instance: ThoughtManager;
    private _thoughts: Thought[] = [];

    private constructor() {}

    static getInstance(): ThoughtManager {
        if (!ThoughtManager.instance) {
            ThoughtManager.instance = new ThoughtManager();
        }
        return ThoughtManager.instance;
    }

    get thoughts(): Thought[] {
        return [...this._thoughts];
    }

    async loadThoughts(): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            console.log('loadThoughts: no auth token');
            return;
        }

        try {
            const response = await NetworkManager.shared.perform<undefined, GetThoughtsResponse>({
                endpoint: '/api/thoughts',
                method: HTTPMethod.GET,
                token: authToken,
            });

            if (!response.thoughts || !Array.isArray(response.thoughts)) {
                throw new Error('Invalid response format');
            }

            this._thoughts = response.thoughts.map((thought: any) => ({
                id: thought.id || thought._id,
                content: thought.content
            }));
        } catch (error) {
            console.error('Failed to load thoughts:', error);
            throw error;
        }
    }

    async createThought(content: string): Promise<Thought> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await NetworkManager.shared.perform<CreateThoughtRequest, CreateThoughtResponse>({
                endpoint: '/api/thoughts',
                method: HTTPMethod.POST,
                body: { content },
                token: authToken,
            });

            if (!response.thought) {
                throw new Error('Invalid response format');
            }

            // Refresh thoughts list
            await this.loadThoughts();

            return {
                id: response.thought.id,
                content: response.thought.content
            };
        } catch (error) {
            console.error('Failed to create thought:', error);
            throw error;
        }
    }

    async updateThought(id: string, content: string): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        try {
            await NetworkManager.shared.perform<UpdateThoughtRequest, UpdateThoughtResponse>({
                endpoint: `/api/thoughts/${id}`,
                method: HTTPMethod.PUT,
                body: { content },
                token: authToken,
            });

            // Refresh thoughts list
            await this.loadThoughts();
        } catch (error) {
            console.error('Failed to update thought:', error);
            throw error;
        }
    }

    async deleteThought(id: string): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        try {
            await NetworkManager.shared.perform<undefined, DeleteThoughtResponse>({
                endpoint: `/api/thoughts/${id}`,
                method: HTTPMethod.DELETE,
                token: authToken,
            });

            // Refresh thoughts list
            await this.loadThoughts();
        } catch (error) {
            console.error('Failed to delete thought:', error);
            throw error;
        }
    }
}

export default ThoughtManager;