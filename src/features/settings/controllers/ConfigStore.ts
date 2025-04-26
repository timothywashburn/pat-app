import { create } from 'zustand';
import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { AuthState } from '@/src/features/auth/controllers/AuthState';
import { Ionicons } from "@expo/vector-icons";
import {
    GetUserConfigResponse, PanelType,
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

interface ConfigState {
    config: UserConfig;
    isLoaded: boolean;

    loadConfig: () => Promise<void>;
    updateConfig: (partialConfig: Partial<UpdateUserConfigRequest>) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
    config: null as unknown as UserConfig,
    isLoaded: false,

    loadConfig: async () => {
        const { config, isLoaded } = get();

        if (config && isLoaded) {
            return;
        }

        try {
            const authToken = AuthState.getState().authToken;
            if (!authToken) throw new Error('No auth token');

            const response = await NetworkManager.shared.perform<undefined, GetUserConfigResponse>({
                endpoint: '/api/account/config',
                method: HTTPMethod.GET,
                token: authToken,
            });

            set({
                config: response.user,
                isLoaded: true,
            });

            console.log('config loaded');
        } catch (error) {
            console.error('failed to load config:', error);
            throw error;
        }
    },

    updateConfig: async (partialConfig: Partial<UpdateUserConfigRequest>) => {
        try {
            const authToken = AuthState.getState().authToken;
            if (!authToken) {
                throw new Error('No auth token');
            }

            const response = await NetworkManager.shared.perform<UpdateUserConfigRequest, UpdateUserConfigResponse>({
                endpoint: '/api/account/config',
                method: HTTPMethod.PUT,
                body: partialConfig,
                token: authToken,
            });

            set(state => ({
                config: { ...state.config, ...partialConfig },
            }));

            console.log('config updated');
        } catch (error) {
            console.error('failed to update config:', error);
            throw error;
        }
    },
}));

export const setConfigState = useConfigStore.setState;
export const ConfigState = useConfigStore;