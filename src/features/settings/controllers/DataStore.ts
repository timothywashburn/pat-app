import { create } from 'zustand';
import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { AuthState } from '@/src/features/auth/controllers/AuthState';
import { Ionicons } from "@expo/vector-icons";
import {
    GetUserResponse,
    ModuleType,
    UpdateUserRequest,
    UpdateUserResponse,
    UserData
} from "@timothyw/pat-common";
import AgendaPanel from "@/src/app/(tabs)/agenda";
import InboxPanel from "@/src/app/(tabs)/inbox";
import TasksPanel from "@/src/app/(tabs)/tasks";
import PeoplePanel from "@/src/app/(tabs)/people";
import SettingsPanel from "@/src/app/(tabs)/settings";
import DevPanel from "@/src/app/(tabs)/dev";

export const moduleInfo: Record<ModuleType, {
    getComponent: () => React.JSX.Element;
    icon: keyof typeof Ionicons.glyphMap;
    title: string
}> = {
    agenda: { getComponent: AgendaPanel, icon: 'calendar', title: 'Agenda' },
    inbox: { getComponent: InboxPanel, icon: 'mail', title: 'Inbox' },
    tasks: { getComponent: TasksPanel, icon: 'list', title: 'Tasks' },
    people: { getComponent: PeoplePanel, icon: 'people', title: 'People' },
    settings: { getComponent: SettingsPanel, icon: 'settings', title: 'Settings' },
    dev: { getComponent: DevPanel, icon: 'code-slash', title: 'Dev' },
};

interface DataState {
    data: UserData | null;
    isLoaded: boolean;

    loadConfig: () => Promise<void>;
    updateConfig: (partialConfig: UpdateUserRequest) => Promise<void>;
    getFirstModule: () => ModuleType;
}

export const useDataStore = create<DataState>((set, get) => ({
    data: null,
    isLoaded: false,

    loadConfig: async () => {
        if (get().isLoaded) {
            console.log('config already loaded, skipping');
            return;
        }

        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('no auth token available');
        }

        console.log('loading user config');

        const response = await NetworkManager.shared.perform<undefined, GetUserResponse>({
            endpoint: '/api/account',
            method: HTTPMethod.GET,
            token: authToken,
        });

        set({
            data: response.user,
            isLoaded: true,
        });

        console.log('config loaded successfully');
    },

    updateConfig: async (partialConfig: UpdateUserRequest) => {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('no auth token available');
        }

        const response = await NetworkManager.shared.perform<UpdateUserRequest, UpdateUserResponse>({
            endpoint: '/api/account',
            method: HTTPMethod.PUT,
            body: partialConfig,
            token: authToken,
        });

        set({ data: response.user });
        console.log('config updated successfully');
    },

    getFirstModule: () => {
        const { data } = get();
        return data?.config.modules.find(module => module.visible)?.type ?? ModuleType.AGENDA;
    }
}));

export const setDataState = useDataStore.setState;
export const DataState = useDataStore;