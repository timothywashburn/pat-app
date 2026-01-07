import { create } from 'zustand';
import {
    CompleteAgendaItemRequest, CompleteAgendaItemResponse,
    CreateAgendaItemRequest,
    CreateAgendaItemResponse, DeleteAgendaItemResponse,
    GetAgendaItemsResponse, AgendaItemData,
    UpdateAgendaItemRequest,
    UpdateAgendaItemResponse,
    Serializer
} from '@timothyw/pat-common';
import { performAuthenticatedRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';
import { HTTPMethod } from "@/src/hooks/useNetworkRequestTypes";

interface NavigationState {
    enabled: boolean;
}

interface NavigationActions {
    setEnabled: (enabled: boolean) => void;
}

export const useNavigationStore = create<NavigationState & NavigationActions>((set, get) => ({
    enabled: true,

    setEnabled: (enabled: boolean): void => {
        set({ enabled });
    },
}));