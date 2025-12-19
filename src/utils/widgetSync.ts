import { Habit } from '@timothyw/pat-common';
import { Platform } from 'react-native';
import { ExtensionStorage } from '@bacons/apple-targets';
import { toDateOnlyString } from "@/src/features/habits/models";

interface WidgetHabitData {
    habits: WidgetHabit[];
    lastUpdated: string;
}

interface WidgetHabit {
    id: string;
    name: string;
    startOffsetMinutes: number;
    endOffsetMinutes: number;
    todayEntry?: {
        date: string;
        status: 'completed' | 'excused' | 'missed';
    };
    stats: {
        completedDays: number;
        totalDays: number;
        completionRate: number;
    };
}

interface HabitAction {
    habitId: string;
    date: string;
    action: string;
}

const APP_GROUP = 'group.dev.timothyw.patapp';
const HABITS_DATA_KEY = 'habits_widget_data';
const ACTION_QUEUE_KEY = 'habit_action_queue';

// Create storage instance
const storage = new ExtensionStorage(APP_GROUP);

/**
 * Sync habits data to widget via UserDefaults
 */
export async function syncHabitsToWidget(habits: Habit[]): Promise<void> {
    if (Platform.OS !== 'ios') {
        return;
    }

    try {
        const today = toDateOnlyString(new Date());

        const widgetHabits: WidgetHabit[] = habits.map(habit => {
            const todayEntry = habit.entries.find(e => e.date === today);

            return {
                id: habit._id,
                name: habit.name,
                startOffsetMinutes: habit.startOffsetMinutes,
                endOffsetMinutes: habit.endOffsetMinutes,
                todayEntry: todayEntry
                    ? {
                          date: todayEntry.date,
                          status: todayEntry.status,
                      }
                    : undefined,
                stats: {
                    completedDays: habit.stats.completedDays,
                    totalDays: habit.stats.totalDays,
                    completionRate: habit.stats.completionRate,
                },
            };
        });

        const widgetData: WidgetHabitData = {
            habits: widgetHabits,
            lastUpdated: new Date().toISOString(),
        };

        const jsonString = JSON.stringify(widgetData);

        // Use ExtensionStorage to write to UserDefaults
        storage.set(HABITS_DATA_KEY, jsonString);

        // Reload widget timelines
        ExtensionStorage.reloadWidget('HabitsWidget');

        console.log('[WidgetSync] Synced habits to widget:', widgetHabits.length);
    } catch (error) {
        console.error('[WidgetSync] Failed to sync habits to widget:', error);
    }
}

/**
 * Read and process any pending widget actions
 */
export async function processWidgetActionQueue(): Promise<HabitAction | null> {
    if (Platform.OS !== 'ios') {
        return null;
    }

    try {
        const jsonData = storage.get(ACTION_QUEUE_KEY);

        if (!jsonData) {
            return null;
        }

        const action = JSON.parse(jsonData) as HabitAction;

        // Clear the queue
        storage.remove(ACTION_QUEUE_KEY);

        console.log('[WidgetSync] Processed widget action:', action);

        return action;
    } catch (error) {
        console.error('[WidgetSync] Failed to process widget action queue:', error);
        return null;
    }
}
