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

export enum UserAuthState {
    NOT_AUTHENTICATED = 'not_authenticated',
    AUTHENTICATED_NO_EMAIL = 'authenticated_no_email',
    FULLY_AUTHENTICATED = 'fully_authenticated'
}

interface UserDataState {
    data: UserData;
    isLoaded: boolean;

    loadUserData: () => Promise<void>;
    updateUserData: (partialUserData: UpdateUserRequest) => Promise<void>;
    getFirstModule: () => ModuleType;
    getUserAuthState: () => UserAuthState;
    canRenderTabs: () => boolean;
}

export const useDataStore = create<UserDataState>((set, get) => ({
    data: null as never,
    isLoaded: false,

    loadUserData: async () => {
        if (get().isLoaded) {
            console.log('user data already loaded, skipping');
            return;
        }

        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('no auth token available');
        }

        console.log('loading user data');

        const response = await NetworkManager.shared.perform<undefined, GetUserResponse>({
            endpoint: '/api/account',
            method: HTTPMethod.GET,
            token: authToken,
        });

        set({
            data: response.user,
            isLoaded: true,
        });

        console.log('data loaded successfully');
    },

    updateUserData: async (partialData: UpdateUserRequest) => {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('no auth token available');
        }

        const response = await NetworkManager.shared.perform<UpdateUserRequest, UpdateUserResponse>({
            endpoint: '/api/account',
            method: HTTPMethod.PUT,
            body: partialData,
            token: authToken,
        });

        set({ data: response.user });
        console.log('user data updated successfully');
    },

    getFirstModule: () => {
        const { data } = get();
        if (!data?.config?.modules) {
            console.log('no data available for getFirstModule, defaulting to agenda');
            return ModuleType.AGENDA;
        }
        return data.config.modules.find(module => module.visible)?.type ?? ModuleType.AGENDA;
    },

    getUserAuthState: () => {
        const authState = AuthState.getState();

        if (!authState.isAuthenticated) {
            return UserAuthState.NOT_AUTHENTICATED;
        }

        if (!authState.userInfo?.isEmailVerified) {
            return UserAuthState.AUTHENTICATED_NO_EMAIL;
        }

        return UserAuthState.FULLY_AUTHENTICATED;
    },

    canRenderTabs: () => {
        return get().getUserAuthState() === UserAuthState.FULLY_AUTHENTICATED;
    }
}));

export const setDataState = useDataStore.setState;
export const DataState = useDataStore;