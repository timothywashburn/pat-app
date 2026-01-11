import { create } from 'zustand';
import {
    GetUserResponse,
    ModuleType, Serializer,
    UpdateUserRequest,
    UpdateUserResponse,
    UserData, UserId
} from "@timothyw/pat-common";
import { Logger } from "@/src/features/dev/components/Logger";
import { HTTPMethod } from "@/src/hooks/useNetworkRequestTypes";
import { performAuthenticatedRequest } from "@/src/utils/networkUtils";

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
            const response = await performAuthenticatedRequest<undefined, GetUserResponse>({
                endpoint: '/api/account',
                method: HTTPMethod.GET,
            });

            if (!response.success) throw new Error('Failed to load user data');

            set({
                userDataStoreStatus: UserDataStoreStatus.LOADED,
                data: Serializer.deserialize<UserData>(response.user),
            });

            Logger.debug('unclassified', 'user data loaded successfully');
        } catch (error) {
            Logger.error('unclassified', 'failed to load user data', error);
        }
    },

    updateUserData: async (partialData: UpdateUserRequest) => {
        const response = await performAuthenticatedRequest<UpdateUserRequest, UpdateUserResponse>({
            endpoint: '/api/account',
            method: HTTPMethod.PUT,
            body: partialData,
        });

        if (!response.success) throw new Error('Failed to update user data');

        set({
            data: Serializer.deserialize<UserData>(response.user)
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