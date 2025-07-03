import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CreateHabitEntryRequest,
    CreateHabitEntryResponse,
    CreateHabitRequest,
    CreateHabitResponse,
    DateOnlyString,
    DeleteHabitResponse,
    GetHabitsResponse,
    Habit,
    HabitEntry, Serializer,
    UpdateHabitRequest,
    UpdateHabitResponse
} from '@timothyw/pat-common';
import { HabitEntryStatus, HabitFrequency } from "@timothyw/pat-common/src/types/models/habit-data";

export class HabitManager {
    private static instance: HabitManager;
    private _habits: Habit[] = [];

    private constructor() {}

    static getInstance(): HabitManager {
        if (!HabitManager.instance) {
            HabitManager.instance = new HabitManager();
        }
        return HabitManager.instance;
    }

    get habits(): Habit[] {
        return [...this._habits];
    }

    async loadHabits(): Promise<void> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetHabitsResponse>({
                endpoint: '/api/habits',
                method: HTTPMethod.GET,
            });

            if (!response.habits || !Array.isArray(response.habits)) {
                throw new Error('Invalid response format');
            }

            this._habits = response.habits.map(habit => Serializer.deserializeHabit(habit));
        } catch (error) {
            console.error('Failed to load habits:', error);
            throw error;
        }
    }

    async createHabit(params: CreateHabitRequest): Promise<Habit> {
        const body: CreateHabitRequest = {
            name: params.name,
            description: params.description,
            frequency: HabitFrequency.DAILY, // API only supports daily for now
            rolloverTime: params.rolloverTime || '00:00'
        };

        try {
            const response = await NetworkManager.shared.performAuthenticated<CreateHabitRequest, CreateHabitResponse>({
                endpoint: '/api/habits',
                method: HTTPMethod.POST,
                body
            });

            if (!response.habit) {
                throw new Error('Invalid response format');
            }

            // Refresh habits list
            await this.loadHabits();

            // Find the newly created habit
            const newHabit = this._habits.find(h => h._id === response.habit._id);
            if (!newHabit) {
                throw new Error('Failed to create habit');
            }

            return newHabit;
        } catch (error) {
            console.error('Failed to create habit:', error);
            throw error;
        }
    }

    async updateHabit(id: string, updates: UpdateHabitRequest): Promise<void> {
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

        try {
            await NetworkManager.shared.performAuthenticated<UpdateHabitRequest, UpdateHabitResponse>({
                endpoint: `/api/habits/${id}`,
                method: HTTPMethod.PUT,
                body
            });

            // Refresh habits list
            await this.loadHabits();
        } catch (error) {
            console.error('Failed to update habit:', error);
            throw error;
        }
    }

    async deleteHabit(id: string): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated<undefined, DeleteHabitResponse>({
                endpoint: `/api/habits/${id}`,
                method: HTTPMethod.DELETE
            });

            // Refresh habits list
            await this.loadHabits();
        } catch (error) {
            console.error('Failed to delete habit:', error);
            throw error;
        }
    }

    async markHabitEntry(habitId: string, date: DateOnlyString, status: HabitEntryStatus): Promise<void> {
        const body: CreateHabitEntryRequest = {
            date,
            status
        };

        console.log(body.date);

        try {
            await NetworkManager.shared.performAuthenticated<CreateHabitEntryRequest, CreateHabitEntryResponse>({
                endpoint: `/api/habits/${habitId}/entries`,
                method: HTTPMethod.POST,
                body
            });

            await this.loadHabits();
        } catch (error) {
            console.error('Failed to mark habit entry:', error);
            throw error;
        }
    }

    async deleteHabitEntry(habitId: string, date: DateOnlyString): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated<undefined, DeleteHabitResponse>({
                endpoint: `/api/habits/${habitId}/entries/${date}`,
                method: HTTPMethod.DELETE
            });

            await this.loadHabits();
        } catch (error) {
            console.error('Failed to delete habit entry:', error);
            throw error;
        }
    }

    getHabitById(id: string): Habit | undefined {
        return this._habits.find(h => h._id === id);
    }

    getHabitEntryByDate(habitId: string, date: DateOnlyString): HabitEntry | undefined {
        const habit = this.getHabitById(habitId);
        if (!habit) return undefined;
        return habit.entries.find(e => e.date === date);
    }
}