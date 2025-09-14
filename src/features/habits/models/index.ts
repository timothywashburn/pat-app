import { DateOnlyString, Habit, HabitEntryStatus, HabitStats } from "@timothyw/pat-common";

export const getTodayDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

export const getYesterdayDate = (): Date => {
    const yesterday = getTodayDate();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
};

export const toDateOnlyString = (date: Date): DateOnlyString => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}` as DateOnlyString;
}

export const fromDateOnlyString = (dateString: DateOnlyString): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};

export const isYesterday = (date: Date): boolean => {
    const yesterday = getYesterdayDate();
    return date.getFullYear() === yesterday.getFullYear() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getDate() === yesterday.getDate();
};

// Date utilities for rollover time
export const shouldRolloverToNextDay = (rolloverTime: string): boolean => {
    const now = new Date();
    const [hours, minutes] = rolloverTime.split(':').map(Number);

    const rolloverDate = new Date();
    rolloverDate.setHours(hours, minutes, 0, 0);

    return now >= rolloverDate;
};

export const sh = (rolloverTime: string): boolean => {
    const now = new Date();
    const [hours, minutes] = rolloverTime.split(':').map(Number);

    const rolloverDate = new Date();
    rolloverDate.setHours(hours, minutes, 0, 0);

    return now >= rolloverDate;
};

// export const getActiveHabitDate = (habit: Habit): Date => {
//     const shouldRollover = shouldRolloverToNextDay(habit.rolloverTime);
//
//     if (shouldRollover) {
//         return new Date();
//     } else {
//         return getYesterdayDate();
//     }
// };

export const getActiveHabitDate = (habit: Habit): DateOnlyString | null => {
    const now = new Date();
    let date = getYesterdayDate();

    for (let i = 0; i < 2; i++) {
        const habitStart = new Date(date.getTime() + habit.startOffsetMinutes * 60 * 1000);
        const habitEnd = new Date(date.getTime() + habit.endOffsetMinutes * 60 * 1000);
        if (now >= habitStart && now <= habitEnd) return toDateOnlyString(date);
        date.setDate(date.getDate() + 1);
    }

    return null;
};

export const getPreviousHabitDate = (habit: Habit): DateOnlyString => {
    const activeDate = getActiveHabitDate(habit);
    const previousDate = new Date(activeDate + 'T00:00:00');
    previousDate.setDate(previousDate.getDate() - 1);
    return toDateOnlyString(previousDate);
};

// Time remaining utilities
export interface TimeRemaining {
    hours: number;
    minutes: number;
    totalMinutes: number;
    percentage: number; // 0-100, how much of the day has passed
    isOverdue: boolean;
}

export const getTimeRemainingUntilRollover = (startOffsetMinutes: number, endOffsetMinutes: number): TimeRemaining => {
    const now = new Date();
    let date = getYesterdayDate();

    // Find the current active habit period
    for (let i = 0; i < 2; i++) {
        const habitStart = new Date(date.getTime() + startOffsetMinutes * 60 * 1000);
        const habitEnd = new Date(date.getTime() + endOffsetMinutes * 60 * 1000);

        if (now >= habitStart && now <= habitEnd) {
            // We're in the active period, calculate time until end
            const diffMs = habitEnd.getTime() - now.getTime();
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            // Calculate percentage of period passed
            const periodDurationMs = habitEnd.getTime() - habitStart.getTime();
            const elapsedMs = now.getTime() - habitStart.getTime();
            const percentage = Math.min(100, Math.max(0, (elapsedMs / periodDurationMs) * 100));

            return {
                hours: Math.max(0, hours),
                minutes: Math.max(0, minutes),
                totalMinutes: Math.max(0, totalMinutes),
                percentage,
                isOverdue: totalMinutes < 0
            };
        }

        date.setDate(date.getDate() + 1);
    }

    // Not in an active period - find the next one
    date = getYesterdayDate();
    for (let i = 0; i < 3; i++) {
        const habitStart = new Date(date.getTime() + startOffsetMinutes * 60 * 1000);

        if (now < habitStart) {
            // Found the next period
            const diffMs = habitStart.getTime() - now.getTime();
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            return {
                hours: Math.max(0, hours),
                minutes: Math.max(0, minutes),
                totalMinutes: Math.max(0, totalMinutes),
                percentage: 0, // Not in active period
                isOverdue: false
            };
        }

        date.setDate(date.getDate() + 1);
    }

    // Fallback - shouldn't reach here
    return {
        hours: 0,
        minutes: 0,
        totalMinutes: 0,
        percentage: 100,
        isOverdue: true
    };
};

export const formatTimeRemaining = (timeRemaining: TimeRemaining): string => {
    if (timeRemaining.isOverdue) {
        return 'Overdue';
    }
    
    if (timeRemaining.hours > 0) {
        return `${timeRemaining.hours}h ${timeRemaining.minutes}m left`;
    } else if (timeRemaining.minutes > 0) {
        return `${timeRemaining.minutes}m left`;
    } else {
        return 'Less than 1m left';
    }
};