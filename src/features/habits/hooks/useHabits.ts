import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
import {
    CreateHabitEntryRequest,
    CreateHabitEntryResponse,
    CreateHabitRequest,
    CreateHabitResponse,
    DateOnlyString,
    DeleteHabitResponse,
    GetHabitsResponse,
    Habit,
    HabitEntry,
    Serializer,
    UpdateHabitRequest,
    UpdateHabitResponse
} from '@timothyw/pat-common';
import { HabitEntryStatus, HabitFrequency } from '@timothyw/pat-common/src/types/models/habit-data';

export interface HabitsHookState {
    habits: Habit[];
    isLoading: boolean;
    error: string | null;
}

export function useHabits() {
    const [state, setState] = useState<HabitsHookState>({
        habits: [],
        isLoading: false,
        error: null,
    });

    const { performAuthenticated } = useNetworkRequest();
    const asyncOp = useAsyncOperation();

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const setHabits = useCallback((habits: Habit[]) => {
        setState(prev => ({ ...prev, habits, error: null }));
    }, []);

    const loadHabits = useCallback(async (): Promise<Habit[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, GetHabitsResponse>({
                endpoint: '/api/habits',
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to load habits');

            const habits = response.habits.map(habit => Serializer.deserializeHabit(habit));
            setHabits(habits);
            setLoading(false);
            return habits;
        }, { errorMessage: 'Failed to load habits' });
    }, [asyncOp, performAuthenticated, setLoading, setError, setHabits]);

    const createHabit = useCallback(async (params: CreateHabitRequest): Promise<Habit> => {
        const body: CreateHabitRequest = {
            name: params.name,
            description: params.description,
            frequency: HabitFrequency.DAILY, // API only supports daily for now
            rolloverTime: params.rolloverTime || '00:00'
        };

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateHabitRequest, CreateHabitResponse>({
                endpoint: '/api/habits',
                method: HTTPMethod.POST,
                body
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create habit');

            const updatedHabits = await loadHabits();

            const newHabit = updatedHabits.find(h => h._id === response.habit._id);
            if (!newHabit) throw new Error('Failed to create habit');

            setLoading(false);
            return newHabit;
        }, { errorMessage: 'Failed to create habit' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadHabits]);

    const updateHabit = useCallback(async (id: string, updates: UpdateHabitRequest): Promise<void> => {
        const body: UpdateHabitRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }
        if (updates.description !== undefined) {
            body.description = updates.description;
        }
        if (updates.frequency !== undefined) {
            body.frequency = HabitFrequency.DAILY; // API only supports daily for now
        }
        if (updates.rolloverTime !== undefined) {
            body.rolloverTime = updates.rolloverTime;
        }

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<UpdateHabitRequest, UpdateHabitResponse>({
                endpoint: `/api/habits/${id}`,
                method: HTTPMethod.PUT,
                body
            }, { skipLoadingState: true });

            await loadHabits();
            setLoading(false);
        }, { errorMessage: 'Failed to update habit' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadHabits]);

    const deleteHabit = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<undefined, DeleteHabitResponse>({
                endpoint: `/api/habits/${id}`,
                method: HTTPMethod.DELETE
            }, { skipLoadingState: true });

            await loadHabits();
            setLoading(false);
        }, { errorMessage: 'Failed to delete habit' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadHabits]);

    const markHabitEntry = useCallback(async (habitId: string, date: DateOnlyString, status: HabitEntryStatus): Promise<void> => {
        const body: CreateHabitEntryRequest = {
            date,
            status
        };


        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<CreateHabitEntryRequest, CreateHabitEntryResponse>({
                endpoint: `/api/habits/${habitId}/entries`,
                method: HTTPMethod.POST,
                body
            }, { skipLoadingState: true });

            await loadHabits();
            setLoading(false);
        }, { errorMessage: 'Failed to mark habit entry' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadHabits]);

    const deleteHabitEntry = useCallback(async (habitId: string, date: DateOnlyString): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<undefined, DeleteHabitResponse>({
                endpoint: `/api/habits/${habitId}/entries/${date}`,
                method: HTTPMethod.DELETE
            }, { skipLoadingState: true });

            await loadHabits();
            setLoading(false);
        }, { errorMessage: 'Failed to delete habit entry' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadHabits]);

    const getHabitById = useCallback((id: string): Habit | undefined => {
        return state.habits.find(h => h._id === id);
    }, [state.habits]);

    const getHabitEntryByDate = useCallback((habitId: string, date: DateOnlyString): HabitEntry | undefined => {
        const habit = getHabitById(habitId);
        if (!habit) return undefined;
        return habit.entries.find(e => e.date === date);
    }, [getHabitById]);

    useEffect(() => {
        loadHabits().catch(error => {
            console.error('Failed to load habits on mount:', error);
        });
    }, []);

    return {
        ...state,
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