import { Habit } from '@timothyw/pat-common';
import { Platform } from 'react-native';
import { ExtensionStorage } from '@bacons/apple-targets';
import { toDateOnlyString } from "@/src/features/habits/models";
import { Logger } from "@/src/features/dev/components/Logger";

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

const storage = new ExtensionStorage(APP_GROUP);

export async function syncHabitsToWidget(habits: Habit[]): Promise<void> {
    if (Platform.OS !== 'ios') return;

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
        storage.set(HABITS_DATA_KEY, jsonString);
        ExtensionStorage.reloadWidget('HabitsWidget');

        Logger.debug('widget', 'Synced habits to widget', widgetHabits.length);
    } catch (error) {
        Logger.error('widget', 'Failed to sync habits to widget', error);
    }
}

export async function processWidgetActionQueue(): Promise<HabitAction | null> {
    if (Platform.OS !== 'ios') {
        Logger.debug('widget', 'Skipping action queue processing - not iOS');
        return null;
    }

    try {
        Logger.debug('widget', 'Checking for pending widget actions...');
        const jsonData = storage.get(ACTION_QUEUE_KEY);

        if (!jsonData) {
            Logger.debug('widget', 'No pending actions found');
            return null;
        }

        Logger.debug('widget', 'Found action data', jsonData);

        const action = JSON.parse(jsonData) as HabitAction;

        Logger.debug('widget', 'Parsed action', action);

        storage.remove(ACTION_QUEUE_KEY);

        Logger.debug('widget', 'Action queue cleared');
        Logger.debug('widget', 'Processed widget action', action);

        return action;
    } catch (error) {
        Logger.error('widget', 'Failed to process widget action queue', error);
        Logger.error('widget', 'Error details', error);
        return null;
    }
}
