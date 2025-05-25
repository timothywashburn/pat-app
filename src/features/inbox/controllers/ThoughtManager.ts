import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
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
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetThoughtsResponse>({
                endpoint: '/api/thoughts',
                method: HTTPMethod.GET,
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
        try {
            const response = await NetworkManager.shared.performAuthenticated<CreateThoughtRequest, CreateThoughtResponse>({
                endpoint: '/api/thoughts',
                method: HTTPMethod.POST,
                body: { content },
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
        try {
            await NetworkManager.shared.performAuthenticated<UpdateThoughtRequest, UpdateThoughtResponse>({
                endpoint: `/api/thoughts/${id}`,
                method: HTTPMethod.PUT,
                body: { content },
            });

            // Refresh thoughts list
            await this.loadThoughts();
        } catch (error) {
            console.error('Failed to update thought:', error);
            throw error;
        }
    }

    async deleteThought(id: string): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated<undefined, DeleteThoughtResponse>({
                endpoint: `/api/thoughts/${id}`,
                method: HTTPMethod.DELETE,
            });

            await this.loadThoughts();
        } catch (error) {
            console.error('Failed to delete thought:', error);
            throw error;
        }
    }
}

export default ThoughtManager;