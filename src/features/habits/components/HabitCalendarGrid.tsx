import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';
import { fromDateString, Habit, HabitEntry } from "@timothyw/pat-common";
import { HabitEntryStatus } from "@timothyw/pat-common/src/types/models/habit-data";

interface HabitCalendarGridProps {
    habit: Habit;
    selectedYear?: number; // Which year to show (default current year)
    viewMode?: 'weeks' | 'year'; // 'weeks' shows last 52 weeks, 'year' shows specific year
}

const HabitCalendarGrid: React.FC<HabitCalendarGridProps> = ({ 
    habit, 
    selectedYear,
    viewMode = 'weeks'
}) => {
    const { getColor } = useTheme();
    const { width } = useWindowDimensions();
    const scrollViewRef = useRef<ScrollView>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [currentViewMode, setCurrentViewMode] = useState<'weeks' | 'year'>(viewMode);
    const [currentYear, setCurrentYear] = useState(selectedYear || new Date().getFullYear());
    
    // Fixed small square size like GitHub
    const squareSize = 11;
    const gapSize = 2;

    // Calculate available years based on habit creation date
    useEffect(() => {
        const habitStartYear = fromDateString(habit.createdAt).getFullYear();
        const currentYearNum = new Date().getFullYear();
        const years = [];
        for (let year = currentYearNum; year >= habitStartYear; year--) {
            years.push(year);
        }
        setAvailableYears(years);
    }, [habit.createdAt]);

    let gridStartDate: Date, gridEndDate: Date, filterStartDate: Date, filterEndDate: Date;
    
    if (currentViewMode === 'weeks') {
        const today = new Date();

        // start from first day of current week, one year ago
        filterStartDate = new Date(today);
        filterStartDate.setFullYear(today.getFullYear() - 1);
        while (filterStartDate.getDay() !== 0) {
            const previousDay = new Date(filterStartDate);
            previousDay.setDate(previousDay.getDate() - 1);
            if (previousDay.getMonth() !== filterStartDate.getMonth()) break;
            filterStartDate = previousDay;
        }

        filterEndDate = new Date();

        // Sunday of the week containing filterStartDate
        gridStartDate = new Date(filterStartDate);
        gridStartDate.setDate(gridStartDate.getDate() - gridStartDate.getDay());
        
        // Grid end should cover today + complete the week
        gridEndDate = new Date(today);
        const endDayOfWeek = gridEndDate.getDay();
        if (endDayOfWeek !== 6) { // If not Saturday, go to next Saturday
            gridEndDate.setDate(gridEndDate.getDate() + (6 - endDayOfWeek));
        }
    } else {
        filterStartDate = new Date(currentYear, 0, 1);
        filterEndDate = new Date(currentYear, 11, 31);
        
        // Grid starts from Sunday of week containing Jan 1
        gridStartDate = new Date(filterStartDate);
        const startDayOfWeek = gridStartDate.getDay();
        if (startDayOfWeek !== 0) {
            gridStartDate.setDate(gridStartDate.getDate() - startDayOfWeek);
        }
        
        // Grid ends at Saturday of week containing Dec 31
        gridEndDate = new Date(filterEndDate);
        const endDayOfWeek = gridEndDate.getDay();
        if (endDayOfWeek !== 6) {
            gridEndDate.setDate(gridEndDate.getDate() + (6 - endDayOfWeek));
        }
    }

    const entryMap = new Map<string, HabitEntry>();
    habit.entries.forEach(entry => {
        const key = fromDateString(entry.date).toISOString().split('T')[0];
        entryMap.set(key, entry);
    });
    const getEntry = (date: Date): HabitEntry | undefined => {
        const key = date.toISOString().split('T')[0];
        return entryMap.get(key);
    }

    // Helper function to get display text for a date
    const getDateDisplayText = (date: Date, entry?: HabitEntry): string => {
        const isBeforeCreation = date < fromDateString(habit.createdAt);
        
        if (isBeforeCreation) {
            return `Habit not created yet on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        
        const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        if (!entry) return `Habit missed on ${formattedDate}`;
        
        switch (entry.status) {
            case HabitEntryStatus.COMPLETED:
                return `Habit completed on ${formattedDate}`;
            case HabitEntryStatus.EXCUSED:
                return `Habit excused on ${formattedDate}`;
            default:
                return `Habit on ${formattedDate}`;
        }
    };

    const getSquareBorderStyle = (date: Date, entry?: HabitEntry) => {
        const isBeforeCreation = date < fromDateString(habit.createdAt);
        if (isBeforeCreation || !entry) return 'border border-outline-variant';
        return '';
    };

    const getSquareColorClass = (date: Date): string => {
        const entry = getEntry(date);
        
        if (!entry) return 'bg-background';
        
        switch (entry.status) {
            case HabitEntryStatus.COMPLETED:
                return 'bg-primary';
            case HabitEntryStatus.EXCUSED:
                return 'bg-warning';
            default:
                return 'bg-background';
        }
    };

    // Get opacity for a specific date (to show intensity like GitHub)
    const getSquareOpacity = (date: Date): number => {
        const entry = getEntry(date);

        if (date < fromDateString(habit.createdAt)) return 0.15;
        if (!entry) return 0.3;
        return 1.0;
    };

    interface Day {
        date: Date;
        visible: boolean;
    }

    const createWeeksFromDateRange = (startDate: Date, endDate: Date, filterStart: Date, filterEnd: Date): Day[][] => {
        const weeks: Day[][] = [];
        let currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);
        
        while (currentDate <= endDate) {
            const week: Day[] = [];

            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());

            for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + dayOffset);

                if (dayDate >= startDate && dayDate <= endDate) {
                    const visible = dayDate >= filterStart && dayDate <= filterEnd;
                    week.push({ date: dayDate, visible });
                }
            }
            
            if (week.length > 0) weeks.push(week);
            currentDate.setDate(currentDate.getDate() + 7 - currentDate.getDay());
        }
        
        return weeks;
    };

    const weeks = createWeeksFromDateRange(gridStartDate, gridEndDate, filterStartDate, filterEndDate);

    const getMonthLabels = (): { month: string; weekIndex: number }[] => {
        const labels: { month: string; weekIndex: number }[] = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let lastShownMonth = -1;
        let lastShownYear = -1;
        
        weeks.forEach((week, weekIndex) => {
            // Find first visible day in week to determine month
            const firstVisibleDay = week.find(day => day.visible);
            if (!firstVisibleDay) return; // Skip weeks with no visible days

            const monthIndex = firstVisibleDay.date.getMonth();
            const yearIndex = firstVisibleDay.date.getFullYear();
            
            // Check if this week contains early days of the month (1-7)
            const hasEarlyDaysOfMonth = week.some(day => {
                if (!day.visible) return false;
                return day.date.getMonth() === monthIndex && day.date.getDate() <= 7;
            });
            
            // Always show month for first week, or when month changes with sufficient spacing
            const monthYearKey = `${monthIndex}-${yearIndex}`;
            const lastMonthYearKey = `${lastShownMonth}-${lastShownYear}`;
            
            if (hasEarlyDaysOfMonth &&
                monthYearKey !== lastMonthYearKey &&
                (weekIndex === 0 || weekIndex - (labels[labels.length - 1]?.weekIndex || 0) >= 3)) {
                labels.push({
                    month: monthNames[monthIndex],
                    weekIndex
                });
                lastShownMonth = monthIndex;
                lastShownYear = yearIndex;
            }
        });
        
        return labels;
    };

    const monthLabels = getMonthLabels();
    const isTablet = width >= 768;

    return (
        <View className="bg-surface rounded-lg p-4">
            {/* Header with view mode selection */}
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-on-surface text-lg font-semibold">
                    {habit.name} Activity
                </Text>
                
                {isTablet ? (
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className={`px-3 py-1 rounded-md mr-2 ${
                                currentViewMode === 'weeks' ? 'bg-primary' : 'bg-surface-variant'
                            }`}
                            onPress={() => setCurrentViewMode('weeks')}
                        >
                            <Text className={`text-sm ${
                                currentViewMode === 'weeks' ? 'text-on-primary' : 'text-on-surface-variant'
                            }`}>
                                Last year
                            </Text>
                        </TouchableOpacity>
                        
                        {availableYears.map(year => (
                            <TouchableOpacity
                                key={year}
                                className={`px-3 py-1 rounded-md mr-2 ${
                                    currentViewMode === 'year' && currentYear === year 
                                        ? 'bg-primary' : 'bg-surface-variant'
                                }`}
                                onPress={() => {
                                    setCurrentViewMode('year');
                                    setCurrentYear(year);
                                }}
                            >
                                <Text className={`text-sm ${
                                    currentViewMode === 'year' && currentYear === year 
                                        ? 'text-on-primary' : 'text-on-surface-variant'
                                }`}>
                                    {year}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <Text className="text-on-surface-variant text-sm">
                        {currentViewMode === 'weeks' 
                            ? 'Last year' 
                            : currentYear.toString()}
                    </Text>
                )}
            </View>
            
            {/* Mobile view mode selector */}
            {!isTablet && (
                <View className="mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row">
                            <TouchableOpacity
                                className={`px-3 py-2 rounded-md mr-2 ${
                                    currentViewMode === 'weeks' ? 'bg-primary' : 'bg-surface-variant'
                                }`}
                                onPress={() => setCurrentViewMode('weeks')}
                            >
                                <Text className={`text-sm ${
                                    currentViewMode === 'weeks' ? 'text-on-primary' : 'text-on-surface-variant'
                                }`}>
                                    Last year
                                </Text>
                            </TouchableOpacity>
                            
                            {availableYears.map(year => (
                                <TouchableOpacity
                                    key={year}
                                    className={`px-3 py-2 rounded-md mr-2 ${
                                        currentViewMode === 'year' && currentYear === year 
                                            ? 'bg-primary' : 'bg-surface-variant'
                                    }`}
                                    onPress={() => {
                                        setCurrentViewMode('year');
                                        setCurrentYear(year);
                                    }}
                                >
                                    <Text className={`text-sm ${
                                        currentViewMode === 'year' && currentYear === year 
                                            ? 'text-on-primary' : 'text-on-surface-variant'
                                    }`}>
                                        {year}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            <ScrollView 
                ref={scrollViewRef}
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="mb-2"
            >
                <View className="px-4">
                    {/* Month labels */}
                    <View className="flex-row mb-4 ml-6 h-4">
                        {monthLabels.map((label) => (
                            <Text 
                                key={`${label.month}-${label.weekIndex}`}
                                className="text-on-surface-variant text-xs"
                                style={{ 
                                    position: 'absolute',
                                    left: label.weekIndex * (squareSize + gapSize),
                                    width: squareSize * 4,
                                    top: 0,
                                }}
                            >
                                {label.month}
                            </Text>
                        ))}
                    </View>

                    <View className="flex-row">
                        {/* Weekday labels */}
                        <View className={isTablet ? "w-7.5" : "w-5"}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                <View key={day} className="justify-center" style={{ height: squareSize + (index < 6 ? gapSize : 0) }}>
                                    {[1, 3, 5].includes(index) && (
                                        <Text className="text-on-surface-variant text-xs">
                                            {isTablet ? day : day[0]}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Calendar grid */}
                        <View className="ml-1">
                            <View className="flex-row">
                                {weeks.map((week, weekIndex) => (
                                    <View key={weekIndex} className="mr-0.5">
                                        {week.map((day, dayIndex) => {
                                            const entry = getEntry(day.date);
                                            return (
                                                <TouchableOpacity
                                                    key={day.date.toString()}
                                                    className={`rounded-sm ${
                                                        day.visible ? getSquareColorClass(day.date) : 'bg-transparent'
                                                    } ${
                                                        day.visible ? getSquareBorderStyle(day.date, entry) : ''
                                                    }`}
                                                    style={{
                                                        width: squareSize,
                                                        height: squareSize,
                                                        opacity: day.visible ? getSquareOpacity(day.date) : 0,
                                                        marginBottom: dayIndex < 6 ? gapSize : 0,
                                                    }}
                                                    onPress={() => {
                                                        if (day.visible) {
                                                            // Show GitHub-style tooltip (read-only)
                                                            Alert.alert(
                                                                habit.name,
                                                                getDateDisplayText(day.date, entry),
                                                                [
                                                                    { text: 'OK', style: 'default' }
                                                                ]
                                                            );
                                                        }
                                                    }}
                                                    activeOpacity={day.visible ? 0.7 : 1}
                                                    disabled={!day.visible}
                                                />
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Legend */}
            <View className="mt-3 pt-3 border-t border-surface-variant">
                <View className="flex-row items-center justify-center">
                    <View className="flex-row items-center mr-4">
                        <View className="w-3 h-3 mr-1 rounded-sm border bg-background border-outline" />
                        <Text className="text-on-surface-variant text-xs">
                            Missed
                        </Text>
                    </View>

                    <View className="flex-row items-center mr-4">
                        <View className="w-3 h-3 mr-1 rounded-sm bg-warning" />
                        <Text className="text-on-surface-variant text-xs">
                            Excused
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <View className="w-3 h-3 mr-1 rounded-sm bg-primary" />
                        <Text className="text-on-surface-variant text-xs">
                            Completed
                        </Text>
                    </View>
                </View>
            </View>

            {/* Activity summary */}
            <View className="mt-3">
                <Text className="text-on-surface-variant text-xs text-center">
                    {habit.stats.completedDays} days completed • {habit.stats.excusedDays} days excused • {habit.stats.completionRate.toFixed(1)}% success rate
                </Text>
            </View>
        </View>
    );
};

export default HabitCalendarGrid;