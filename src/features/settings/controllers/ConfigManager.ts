import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { AuthState } from '@/src/features/auth/controllers/AuthState';
import { Ionicons } from "@expo/vector-icons";
import {
    GetUserConfigResponse, Panel, PanelType,
    UpdateUserConfigRequest,
    UpdateUserConfigResponse,
    UserConfig
} from "@timothyw/pat-common";

export const panelInfo: Record<PanelType, { icon: keyof typeof Ionicons.glyphMap; title: string }> = {
    agenda: { icon: 'calendar', title: 'Agenda' },
    inbox: { icon: 'mail', title: 'Inbox' },
    tasks: { icon: 'list', title: 'Tasks' },
    people: { icon: 'people', title: 'People' },
    settings: { icon: 'settings', title: 'Settings' }
};

export class ConfigManager {
    private static instance: ConfigManager;
    private _config: UserConfig | null = null;
    public isLoaded: boolean = false;

    private constructor() {
    }

    async loadConfig(): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) throw new Error('No auth token');

        try {
            const response = await NetworkManager.shared.perform<undefined, GetUserConfigResponse>({
                endpoint: '/api/account/config',
                method: HTTPMethod.GET,
                token: authToken,
            });

            this._config = response.user;
            this.isLoaded = true;
        } catch (error) {
            console.error('Failed to load settings:', error);
            throw error;
        }
    }

    async updateConfig(partialConfig: Partial<UpdateUserConfigRequest>): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) throw new Error('No auth token');

        try {
            const response = await NetworkManager.shared.perform<UpdateUserConfigRequest, UpdateUserConfigResponse>({
                endpoint: '/api/account/config',
                method: HTTPMethod.PUT,
                body: partialConfig,
                token: authToken,
            });

            console.log('settings updated')
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    }

    get config() {
        if (!this._config) throw new Error('Config not loaded');
        return this._config;
    }

    public static get shared(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
}