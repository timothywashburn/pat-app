import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CreateThoughtRequest,
    CreateThoughtResponse, DeleteThoughtResponse,
    GetThoughtsResponse, Serializer, ThoughtData,
    UpdateThoughtRequest, UpdateThoughtResponse,
    NotificationTemplateData
} from "@timothyw/pat-common";
import NotificationService from '@/src/services/NotificationService';
import { NotifiableWrapper } from '@/src/services/NotifiableEntity';
import { useUserDataStore } from "@/src/features/settings/controllers/useUserDataStore";

class ThoughtManager {
    private static instance: ThoughtManager;
    private _thoughts: ThoughtData[] = [];
    private notificationService = NotificationService.getInstance();

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

            if (!response.success) throw new Error('Failed to load thoughts');

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

            if (!response.success) throw new Error('Failed to create thought');

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

    // Notification integration methods

    /**
     * Create a notifiable wrapper for the inbox entity
     * The inbox is treated as a single entity - individual thoughts are not notifiable
     */
    private createNotifiableInbox(): NotifiableWrapper<{ thoughts: ThoughtData[] }> {
        return new NotifiableWrapper(
            'inbox', // Fixed ID since there's only one inbox per user
            'inbox',
            { thoughts: this._thoughts },
            useUserDataStore.getState().data?._id
        );
    }

    /**
     * Register notification triggers for the inbox
     * Called when the inbox is first accessed or when thoughts are modified
     */
    async registerInboxNotifications(): Promise<void> {
        try {
            const notifiableInbox = this.createNotifiableInbox();
            await notifiableInbox.registerNotificationTriggers();
        } catch (error) {
            console.error('Failed to register inbox notifications:', error);
        }
    }

    /**
     * Remove notification triggers for the inbox
     * Called if user wants to disable inbox notifications
     */
    async removeInboxNotifications(): Promise<void> {
        try {
            const notifiableInbox = this.createNotifiableInbox();
            await notifiableInbox.removeNotificationTriggers();
        } catch (error) {
            console.error('Failed to remove inbox notifications:', error);
        }
    }
}

export default ThoughtManager;