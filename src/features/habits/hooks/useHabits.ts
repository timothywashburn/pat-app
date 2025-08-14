import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CreateHabitEntryRequest,
    CreateHabitEntryResponse,
    CreateHabitRequest,
    CreateHabitResponse,
    DateOnlyString,
    DeleteHabitResponse,
    GetHabitsResponse,
    Habit,
    HabitEntry, ItemData,
    Serializer,
    UpdateHabitRequest,
    UpdateHabitResponse
} from '@timothyw/pat-common';
import { HabitEntryStatus, HabitFrequency } from '@timothyw/pat-common/src/types/models/habit-data';
import { useToast } from "@/src/components/toast/ToastContext";

export function useHabits() {
    const [ habits, setHabits ] = useState<Habit[]>([]);
    const [ isInitialized, setIsInitialized ] = useState<boolean>(false);

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = useCallback(async (): Promise<Habit[]> => {
        const response = await performAuthenticated<undefined, GetHabitsResponse>({
            endpoint: '/api/habits',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        const habits = response.habits.map(habit => Serializer.deserialize<Habit>(habit));
        setHabits(habits);
        setIsInitialized(true);
        return habits;
    }, [performAuthenticated, errorToast, setHabits, setIsInitialized]);

    const createHabit = useCallback(async (params: CreateHabitRequest): Promise<Habit> => {
        const body: CreateHabitRequest = {
            name: params.name,
            description: params.description,
            frequency: HabitFrequency.DAILY, // API only supports daily for now
            rolloverTime: params.rolloverTime || '00:00'
        };

        const response = await performAuthenticated<CreateHabitRequest, CreateHabitResponse>({
            endpoint: '/api/habits',
            method: HTTPMethod.POST,
            body
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const updatedHabits = await loadHabits();

        const newHabit = updatedHabits.find(h => h._id === response.habit._id);
        if (!newHabit) {
            errorToast('Failed to create habit');
            throw new Error('Failed to create habit');
        }

        return newHabit;
    }, [performAuthenticated, errorToast, loadHabits]);

    const updateHabit = useCallback(async (id: string, updates: UpdateHabitRequest): Promise<void> => {
        const response = await performAuthenticated<UpdateHabitRequest, UpdateHabitResponse>({
            endpoint: `/api/habits/${id}`,
            method: HTTPMethod.PUT,
            body: updates
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadHabits();
    }, [performAuthenticated, errorToast, loadHabits]);

    const deleteHabit = useCallback(async (id: string): Promise<void> => {
        const response = await performAuthenticated<undefined, DeleteHabitResponse>({
            endpoint: `/api/habits/${id}`,
            method: HTTPMethod.DELETE
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadHabits();
    }, [performAuthenticated, errorToast, loadHabits]);

    const markHabitEntry = useCallback(async (habitId: string, date: DateOnlyString, status: HabitEntryStatus): Promise<void> => {
        const body: CreateHabitEntryRequest = {
            date,
            status
        };

        const response = await performAuthenticated<CreateHabitEntryRequest, CreateHabitEntryResponse>({
            endpoint: `/api/habits/${habitId}/entries`,
            method: HTTPMethod.POST,
            body
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadHabits();
    }, [performAuthenticated, errorToast, loadHabits]);

    const deleteHabitEntry = useCallback(async (habitId: string, date: DateOnlyString): Promise<void> => {
        const response = await performAuthenticated<undefined, DeleteHabitResponse>({
            endpoint: `/api/habits/${habitId}/entries/${date}`,
            method: HTTPMethod.DELETE
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadHabits();
    }, [performAuthenticated, errorToast, loadHabits]);

    const getHabitById = useCallback((id: string): Habit | undefined => {
        return habits.find(h => h._id === id);
    }, [habits]);

    const getHabitEntryByDate = useCallback((habitId: string, date: DateOnlyString): HabitEntry | undefined => {
        const habit = getHabitById(habitId);
        if (!habit) return undefined;
        return habit.entries.find(e => e.date === date);
    }, [getHabitById]);

    return {
        habits,
        isInitialized,
        loadHabits,
        createHabit,
        updateHabit,
        deleteHabit,
        markHabitEntry,
        deleteHabitEntry,
        getHabitById,
        getHabitEntryByDate,
    };
}