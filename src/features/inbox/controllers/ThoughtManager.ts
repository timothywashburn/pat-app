import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CreateThoughtRequest,
    CreateThoughtResponse, DeleteThoughtResponse,
    GetThoughtsResponse, Serializer, ThoughtData,
    UpdateThoughtRequest, UpdateThoughtResponse
} from "@timothyw/pat-common";

class ThoughtManager {
    private static instance: ThoughtManager;
    private _thoughts: ThoughtData[] = [];

    private constructor() {}

    static getInstance(): ThoughtManager {
        if (!ThoughtManager.instance) {
            ThoughtManager.instance = new ThoughtManager();
        }
        return ThoughtManager.instance;
    }

    get thoughts(): ThoughtData[] {
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

            this._thoughts = response.thoughts.map(thought => Serializer.deserializeThoughtData(thought));
        } catch (error) {
            console.error('Failed to load thoughts:', error);
            throw error;
        }
    }

    async createThought(content: string): Promise<ThoughtData> {
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

            return Serializer.deserializeThoughtData(response.thought);
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