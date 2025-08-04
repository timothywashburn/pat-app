import { create } from 'zustand';
import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { Ionicons } from "@expo/vector-icons";
import {
    GetUserResponse,
    ModuleType, Serializer,
    UpdateUserRequest,
    UpdateUserResponse,
    UserData, UserId
} from "@timothyw/pat-common";
// import { AgendaPanel } from "@/src/app/(tabs)/agenda";
// import InboxPanel from "@/src/app/(tabs)/inbox";
// import TasksPanel from "@/src/app/(tabs)/tasks";
// import PeoplePanel from "@/src/app/(tabs)/people";
// import SettingsPanel from "@/src/app/(tabs)/settings";
// import DevPanel from "@/src/app/(tabs)/dev";
import { Logger } from "@/src/features/dev/components/Logger";
import React from "react";

export enum UserDataStoreStatus {
    NOT_LOADED = 'not_loaded',
    LOADING = 'loading',
    LOADED = 'loaded',
}

interface UserDataState {
    userDataStoreStatus: UserDataStoreStatus;

    id: UserId;
    data: UserData;

    loadUserData: () => Promise<void>;
    updateUserData: (partialUserData: UpdateUserRequest) => Promise<void>;
    getFirstModule: () => ModuleType;
    isModuleVisible: (moduleType: ModuleType) => boolean;
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
    userDataStoreStatus: UserDataStoreStatus.NOT_LOADED,

    id: null as never,
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

            if (!response.success) throw new Error('Failed to load user data');

            set({
                userDataStoreStatus: UserDataStoreStatus.LOADED,
                data: Serializer.deserializeUserData(response.user),
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

        if (!response.success) throw new Error('Failed to update user data');

        set({
            data: Serializer.deserializeUserData(response.user)
        });
    },

    getFirstModule: () => {
        const { data } = get();
        if (!data?.config?.modules) {
            console.log('no data available for getFirstModule, defaulting to agenda');
            return ModuleType.AGENDA;
        }
        return data.config.modules.find(module => module.visible)?.type ?? ModuleType.AGENDA;
    },

    isModuleVisible: (moduleType: ModuleType) => {
        const { data } = get();
        if (!data?.config?.modules) {
            return true;
        }
        const module = data.config.modules.find(m => m.type === moduleType);
        return module?.visible ?? false;
    },
}));

export const DataState = useUserDataStore;