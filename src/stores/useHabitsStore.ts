import { create } from 'zustand';
import {
    CreateHabitEntryRequest,
    CreateHabitEntryResponse,
    CreateHabitRequest,
    CreateHabitResponse,
    DateOnlyString,
    DeleteHabitResponse,
    GetHabitsResponse,
    Habit,
    HabitEntryData,
    HabitEntryStatus, HabitFrequency,
    Serializer,
    UpdateHabitRequest,
    UpdateHabitResponse
} from '@timothyw/pat-common';
import { performAuthenticatedRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';
import { HTTPMethod } from "@/src/hooks/useNetworkRequestTypes";
import { syncHabitsToWidget } from '@/src/utils/widgetSync';

interface HabitsState {
    habits: Habit[];
    isInitialized: boolean;
    isLoading: boolean;
}

interface HabitsActions {
    loadHabits: () => Promise<Habit[]>;
    createHabit: (params: CreateHabitRequest) => Promise<Habit>;
    updateHabit: (id: string, updates: UpdateHabitRequest) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    markHabitEntry: (habitId: string, date: DateOnlyString, status: HabitEntryStatus) => Promise<void>;
    deleteHabitEntry: (habitId: string, date: DateOnlyString) => Promise<void>;
    getHabitById: (id: string) => Habit | undefined;
    getHabitEntryByDate: (habitId: string, date: DateOnlyString) => HabitEntryData | undefined;
    syncToWidget: () => Promise<void>;
}

export const useHabitsStore = create<HabitsState & HabitsActions>((set, get) => ({
    habits: [],
    isInitialized: false,
    isLoading: false,

    loadHabits: async (): Promise<Habit[]> => {
        set({ isLoading: true });

        try {
            const response = await performAuthenticatedRequest<undefined, GetHabitsResponse>({
                endpoint: '/api/habits',
                method: HTTPMethod.GET,
            });

            if (!response.success) {
                toastManager.errorToast(response.error);
                set({ isLoading: false });
                return [];
            }

            const habits = response.habits.map(habit => Serializer.deserialize<Habit>(habit));
            set({ habits, isInitialized: true, isLoading: false });

            // Sync to widget
            syncHabitsToWidget(habits).catch(err => console.error('Failed to sync to widget:', err));

            return habits;
        } catch (error) {
            set({ isLoading: false });
            return [];
        }
    },

    createHabit: async (body: CreateHabitRequest): Promise<Habit> => {
        const response = await performAuthenticatedRequest<CreateHabitRequest, CreateHabitResponse>({
            endpoint: '/api/habits',
            method: HTTPMethod.POST,
            body
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const updatedHabits = await get().loadHabits();
        const newHabit = updatedHabits.find(h => h._id === response.habit._id);
        if (!newHabit) {
            toastManager.errorToast('Failed to create habit');
            throw new Error('Failed to create habit');
        }

        return newHabit;
    },

    updateHabit: async (id: string, updates: UpdateHabitRequest): Promise<void> => {
        const response = await performAuthenticatedRequest<UpdateHabitRequest, UpdateHabitResponse>({
            endpoint: `/api/habits/${id}`,
            method: HTTPMethod.PUT,
            body: updates
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadHabits();
    },

    deleteHabit: async (id: string): Promise<void> => {
        const response = await performAuthenticatedRequest<undefined, DeleteHabitResponse>({
            endpoint: `/api/habits/${id}`,
            method: HTTPMethod.DELETE
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadHabits();
    },

    markHabitEntry: async (habitId: string, date: DateOnlyString, status: HabitEntryStatus): Promise<void> => {
        const body: CreateHabitEntryRequest = {
            date,
            status
        };

        const response = await performAuthenticatedRequest<CreateHabitEntryRequest, CreateHabitEntryResponse>({
            endpoint: `/api/habits/${habitId}/entries`,
            method: HTTPMethod.POST,
            body
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadHabits();
    },

    deleteHabitEntry: async (habitId: string, date: DateOnlyString): Promise<void> => {
        const response = await performAuthenticatedRequest<undefined, DeleteHabitResponse>({
            endpoint: `/api/habits/${habitId}/entries/${date}`,
            method: HTTPMethod.DELETE
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadHabits();
    },

    getHabitById: (id: string): Habit | undefined => {
        return get().habits.find(h => h._id === id);
    },

    getHabitEntryByDate: (habitId: string, date: DateOnlyString): HabitEntryData | undefined => {
        const habit = get().getHabitById(habitId);
        if (!habit) return undefined;
        return habit.entries.find(e => e.date === date);
    },

    syncToWidget: async (): Promise<void> => {
        const { habits } = get();
        await syncHabitsToWidget(habits);
    },
}));