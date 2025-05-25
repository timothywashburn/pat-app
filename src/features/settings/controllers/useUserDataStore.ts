import { create } from 'zustand';
import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
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
import { Logger } from "@/src/features/dev/components/Logger";
import React from "react";

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

export enum UserDataStoreStatus {
    NOT_LOADED = 'not_loaded',
    LOADING = 'loading',
    LOADED = 'loaded',
}

interface UserDataState {
    userDataStoreStatus: UserDataStoreStatus;

    data: UserData;

    loadUserData: () => Promise<void>;
    updateUserData: (partialUserData: UpdateUserRequest) => Promise<void>;
    getFirstModule: () => ModuleType;
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
    userDataStoreStatus: UserDataStoreStatus.NOT_LOADED,

    data: null as never,

    loadUserData: async () => {
        if (get().userDataStoreStatus !== UserDataStoreStatus.NOT_LOADED) {
            Logger.error('unclassified', 'illegal call to loadUserData', {
                userDataStoreStatus: get().userDataStoreStatus,
            });
            return;
        }

        Logger.debug('unclassified', 'loading user data');
        set({ userDataStoreStatus: UserDataStoreStatus.LOADING });

        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetUserResponse>({
                endpoint: '/api/account',
                method: HTTPMethod.GET,
            });

            set({
                userDataStoreStatus: UserDataStoreStatus.LOADED,
                data: response.user,
            });

            Logger.debug('unclassified', 'user data loaded successfully');
        } catch (error) {
            Logger.error('unclassified', 'failed to load user data', error);
        }
    },

    updateUserData: async (partialData: UpdateUserRequest) => {
        const response = await NetworkManager.shared.performAuthenticated<UpdateUserRequest, UpdateUserResponse>({
            endpoint: '/api/account',
            method: HTTPMethod.PUT,
            body: partialData,
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
}));

export const DataState = useUserDataStore;