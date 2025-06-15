export enum HabitFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    EVERY_N_DAYS = 'every_n_days',
    WEEKDAYS_ONLY = 'weekdays_only',
    CUSTOM = 'custom'
}

export enum HabitEntryStatus {
    COMPLETED = 'completed',
    EXCUSED = 'excused',
    MISSED = 'missed'
}

export interface Habit {
    id: string;
    name: string;
    description?: string;
    frequency: HabitFrequency;
    rolloverTime: string; // "HH:MM" format (24-hour)
    createdAt: Date;
    updatedAt: Date;
}

export interface HabitEntry {
    id: string;
    habitId: string;
    date: Date;
    status: HabitEntryStatus;
    completedAt?: Date;
    excusedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface HabitStats {
    totalDays: number;
    completedDays: number;
    excusedDays: number;
    missedDays: number;
    completionRate: number; // 0-100 percentage
    completionRateExcludingExcused: number; // 0-100 percentage
}

export interface HabitWithEntries extends Habit {
    entries: HabitEntry[];
    stats: HabitStats;
}

export const parseDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
};

export const calculateHabitStats = (entries: HabitEntry[]): HabitStats => {
    const totalDays = entries.length;
    const completedDays = entries.filter(entry => entry.status === HabitEntryStatus.COMPLETED).length;
    const excusedDays = entries.filter(entry => entry.status === HabitEntryStatus.EXCUSED).length;
    const missedDays = entries.filter(entry => entry.status === HabitEntryStatus.MISSED).length;
    
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    const completionRateExcludingExcused = (totalDays - excusedDays) > 0 
        ? (completedDays / (totalDays - excusedDays)) * 100 
        : 0;

    return {
        totalDays,
        completedDays,
        excusedDays,
        missedDays,
        completionRate,
        completionRateExcludingExcused
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