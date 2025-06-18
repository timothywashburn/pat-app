import {
    HabitData,
    HabitEntryData,
    HabitEntryStatus,
    HabitStats
} from "@timothyw/pat-common/src/types/models/habit-data";
import { DateOnlyString, fromDateString, Habit } from "@timothyw/pat-common";

export const parseDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
};

export const calculateHabitStats = (habit: Habit): HabitStats => {
    const completedDays = habit.entries.filter(entry => entry.status === HabitEntryStatus.COMPLETED).length;
    const excusedDays = habit.entries.filter(entry => entry.status === HabitEntryStatus.EXCUSED).length;
    const totalDays = getDaysBetweenInclusive(fromDateOnlyString(habit.firstDay), getTodayDate());
    const missedDays = totalDays - completedDays - excusedDays;
    const completionRate = completedDays / (totalDays - excusedDays) * 100;

    return {
        totalDays,
        completedDays,
        excusedDays,
        missedDays,
        completionRate,
    };
};

export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
};

export const getDaysBetweenInclusive = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffMs = Math.abs(end.getTime() - start.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

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

export const getActiveHabitDate = (habit: Habit): Date => {
    const shouldRollover = shouldRolloverToNextDay(habit.rolloverTime);
    
    if (shouldRollover) {
        return new Date();
    } else {
        return getYesterdayDate();
    }
};

export const getPreviousHabitDate = (habit: Habit): Date => {
    const activeDate = getActiveHabitDate(habit);
    const previousDate = new Date(activeDate);
    previousDate.setDate(previousDate.getDate() - 1);
    return previousDate;
};

// Time remaining utilities
export interface TimeRemaining {
    hours: number;
    minutes: number;
    totalMinutes: number;
    percentage: number; // 0-100, how much of the day has passed
    isOverdue: boolean;
}

export const getTimeRemainingUntilRollover = (rolloverTime: string): TimeRemaining => {
    const now = new Date();
    const [rolloverHours, rolloverMinutes] = rolloverTime.split(':').map(Number);
    
    // Create rollover time for today
    const todayRollover = new Date();
    todayRollover.setHours(rolloverHours, rolloverMinutes, 0, 0);
    
    // Create rollover time for tomorrow (in case we're past today's rollover)
    const tomorrowRollover = new Date(todayRollover);
    tomorrowRollover.setDate(tomorrowRollover.getDate() + 1);
    
    // Determine which rollover time to use
    const targetRollover = now > todayRollover ? tomorrowRollover : todayRollover;
    
    // Calculate time difference
    const diffMs = targetRollover.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Calculate percentage of day passed (24 hours = 100%)
    const minutesSinceLastRollover = now > todayRollover 
        ? Math.floor((now.getTime() - todayRollover.getTime()) / (1000 * 60))
        : Math.floor((now.getTime() - (todayRollover.getTime() - 24 * 60 * 60 * 1000)) / (1000 * 60));
    
    const percentage = Math.min(100, Math.max(0, (minutesSinceLastRollover / (24 * 60)) * 100));
    
    return {
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        totalMinutes: Math.max(0, totalMinutes),
        percentage,
        isOverdue: totalMinutes < 0
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