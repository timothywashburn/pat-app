import { create } from 'zustand';
import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { AuthState } from '@/src/features/auth/controllers/AuthState';
import { Ionicons } from "@expo/vector-icons";
import { GetUserResponse, PanelType, UpdateUserRequest, UpdateUserResponse, UserData } from "@timothyw/pat-common";

export const panelInfo: Record<PanelType, { icon: keyof typeof Ionicons.glyphMap; title: string }> = {
    agenda: { icon: 'calendar', title: 'Agenda' },
    inbox: { icon: 'mail', title: 'Inbox' },
    tasks: { icon: 'list', title: 'Tasks' },
    people: { icon: 'people', title: 'People' },
    settings: { icon: 'settings', title: 'Settings' },
    dev: { icon: 'code-slash', title: 'Dev' },
};

interface DataState {
    data: UserData;
    isLoaded: boolean;

    loadConfig: () => Promise<void>;
    updateConfig: (partialConfig: UpdateUserRequest) => Promise<void>;

    getFirstPanel: () => PanelType;
}

export const useConfigStore = create<DataState>((set, get) => ({
    data: null as unknown as UserData,
    isLoaded: false,

    loadConfig: async () => {
        const { data, isLoaded } = get();

        if (data && isLoaded) {
            return;
        }

        try {
            const authToken = AuthState.getState().authToken;
            if (!authToken) throw new Error('No auth token');

            const response = await NetworkManager.shared.perform<undefined, GetUserResponse>({
                endpoint: '/api/account',
                method: HTTPMethod.GET,
                token: authToken,
            });

            set({
                data: response.user,
                isLoaded: true,
            });

            console.log('config loaded');
        } catch (error) {
            console.error('failed to load config:', error);
            throw error;
        }
    },

    updateConfig: async (partialConfig: UpdateUserRequest) => {
        try {
            const authToken = AuthState.getState().authToken;
            if (!authToken) {
                throw new Error('No auth token');
            }

            const response = await NetworkManager.shared.perform<UpdateUserRequest, UpdateUserResponse>({
                endpoint: '/api/account',
                method: HTTPMethod.PUT,
                body: partialConfig,
                token: authToken,
            });

            set({
                data: response.user,
            });

            console.log('config updated');
        } catch (error) {
            console.error('failed to update config:', error);
            throw error;
        }
    },

    getFirstPanel: () => {
        const { data } = get();
        return data?.config.panels.find(panel => panel.visible)?.type ?? PanelType.AGENDA;
    }
}));

export const setConfigState = useConfigStore.setState;
export const ConfigState = useConfigStore;