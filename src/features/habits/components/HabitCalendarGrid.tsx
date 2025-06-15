import React, { useState, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { HabitWithEntries, HabitEntry, HabitEntryStatus, getDateRange, formatDate } from '@/src/features/habits/models';
import { useTheme } from '@/src/controllers/ThemeManager';

interface HabitCalendarGridProps {
    habit: HabitWithEntries;
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
        const habitStartYear = habit.createdAt.getFullYear();
        const currentYearNum = new Date().getFullYear();
        const years = [];
        for (let year = currentYearNum; year >= habitStartYear; year--) {
            years.push(year);
        }
        setAvailableYears(years);
    }, [habit.createdAt]);

    // Calculate date range based on view mode
    let startDate: Date, endDate: Date;
    
    if (currentViewMode === 'weeks') {
        // Last 52 weeks
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - (52 * 7 - 1));
        
        // Adjust start date to begin on a Sunday (like GitHub)
        const startDayOfWeek = startDate.getDay();
        if (startDayOfWeek !== 0) { // If not Sunday
            startDate.setDate(startDate.getDate() - startDayOfWeek);
        }
    } else {
        // Specific year
        startDate = new Date(currentYear, 0, 1); // Jan 1
        endDate = new Date(currentYear, 11, 31); // Dec 31
        
        // Adjust to start on Sunday for the week containing Jan 1
        const startDayOfWeek = startDate.getDay();
        if (startDayOfWeek !== 0) {
            startDate.setDate(startDate.getDate() - startDayOfWeek);
        }
        
        // Adjust end to end on Saturday for the week containing Dec 31
        const endDayOfWeek = endDate.getDay();
        if (endDayOfWeek !== 6) {
            endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
        }
    }

    const dateRange = getDateRange(startDate, endDate);
    
    // Create a map of entries for quick lookup
    const entryMap = new Map<string, HabitEntry>();
    habit.entries.forEach(entry => {
        entryMap.set(entry.date, entry);
    });

    // Helper function to get display text for a date
    const getDateDisplayText = (date: string, entry?: HabitEntry): string => {
        const dateObj = new Date(date + 'T00:00:00');
        const isBeforeCreation = dateObj < habit.createdAt;
        
        if (isBeforeCreation) {
            return `Habit not created yet on ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        if (!entry || entry.status === HabitEntryStatus.MISSED) {
            return `Habit missed on ${formattedDate}`;
        }
        
        switch (entry.status) {
            case HabitEntryStatus.COMPLETED:
                return `Habit completed on ${formattedDate}`;
            case HabitEntryStatus.EXCUSED:
                return `Habit excused on ${formattedDate}`;
            default:
                return `Habit on ${formattedDate}`;
        }
    };

    // Helper function to get border style for clear squares
    const getSquareBorderStyle = (date: string, entry?: HabitEntry) => {
        const dateObj = new Date(date + 'T00:00:00');
        const isBeforeCreation = dateObj < habit.createdAt;
        
        if (isBeforeCreation) {
            return {}; // No border for before creation
        }
        
        if (!entry || entry.status === HabitEntryStatus.MISSED) {
            return {
                borderWidth: 1,
                borderColor: getColor('outline'),
            };
        }
        
        return {}; // No border for completed/excused
    };

    // Get color for a specific date
    const getSquareColor = (date: string): string => {
        const entry = entryMap.get(date);
        
        // Check if this date is before the habit was created
        const dateObj = new Date(date + 'T00:00:00');
        if (dateObj < habit.createdAt) {
            return getColor('surface-variant'); // Light gray for before habit creation
        }
        
        if (!entry) {
            return getColor('background'); // Clear for no entry (missed)
        }
        
        switch (entry.status) {
            case HabitEntryStatus.COMPLETED:
                return getColor('primary');
            case HabitEntryStatus.EXCUSED:
                return getColor('warning');
            case HabitEntryStatus.MISSED:
                return getColor('background');
            default:
                return getColor('background');
        }
    };

    // Get opacity for a specific date (to show intensity like GitHub)
    const getSquareOpacity = (date: string): number => {
        const entry = entryMap.get(date);
        const dateObj = new Date(date + 'T00:00:00');
        
        // Before habit creation
        if (dateObj < habit.createdAt) {
            return 0.1;
        }
        
        if (!entry || entry.status === HabitEntryStatus.MISSED) {
            return 0.1;
        }
        
        return 1.0; // Full opacity for completed/excused
    };

    // Group dates into weeks
    const weeks: string[][] = [];
    for (let i = 0; i < dateRange.length; i += 7) {
        weeks.push(dateRange.slice(i, i + 7));
    }

    // Month labels
    const getMonthLabels = (): { month: string; weekIndex: number }[] => {
        const labels: { month: string; weekIndex: number }[] = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let lastShownMonth = -1;
        let lastShownYear = -1;
        
        weeks.forEach((week, weekIndex) => {
            const firstDayOfWeek = new Date(week[0] + 'T00:00:00');
            const monthIndex = firstDayOfWeek.getMonth();
            const yearIndex = firstDayOfWeek.getFullYear();
            
            // Check if any day in this week is the first few days of a new month
            const hasEarlyDaysOfMonth = week.some(date => {
                const dayDate = new Date(date + 'T00:00:00');
                return dayDate.getMonth() === monthIndex && dayDate.getDate() <= 7;
            });
            
            // Show month label if:
            // 1. This week contains early days of a month AND
            // 2. We haven't shown this month+year combination yet AND  
            // 3. Either it's the first week OR we have reasonable spacing (at least 3 weeks)
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

    // Scroll to current day on mount
    useEffect(() => {
        if (scrollViewRef.current && currentViewMode === 'weeks') {
            // Find the current day's position
            const today = new Date().toISOString().split('T')[0];
            const todayIndex = dateRange.findIndex(date => date === today);
            if (todayIndex !== -1) {
                const weekIndex = Math.floor(todayIndex / 7);
                const scrollPosition = Math.max(0, weekIndex * (squareSize + gapSize) - 100);
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: false });
                }, 100);
            }
        }
    }, [currentViewMode, dateRange]);

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
                                Last 52 weeks
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
                            ? 'Last 52 weeks' 
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
                                    Last 52 weeks
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

            {/* Calendar container with horizontal scroll */}
            <ScrollView 
                ref={scrollViewRef}
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="mb-2"
            >
                <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                    {/* Month labels */}
                    <View className="flex-row mb-4" style={{ marginLeft: 24, height: 16 }}>
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

                    {/* Day labels and calendar grid */}
                    <View className="flex-row">
                        <View style={{ width: 20 }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                <View key={day} style={{ height: squareSize + (index < 6 ? gapSize : 0), justifyContent: 'center' }}>
                                    {[1, 3, 5].includes(index) && ( // Only show Mon, Wed, Fri to avoid crowding
                                        <Text className="text-on-surface-variant text-xs">
                                            {day[0]}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Calendar grid */}
                        <View style={{ marginLeft: 4 }}>
                            <View className="flex-row">
                                {weeks.map((week, weekIndex) => (
                                    <View key={weekIndex} style={{ marginRight: gapSize }}>
                                        {week.map((date, dayIndex) => {
                                            const entry = entryMap.get(date);
                                            return (
                                                <TouchableOpacity
                                                    key={date}
                                                    style={{
                                                        width: squareSize,
                                                        height: squareSize,
                                                        backgroundColor: getSquareColor(date),
                                                        opacity: getSquareOpacity(date),
                                                        marginBottom: dayIndex < 6 ? gapSize : 0,
                                                        borderRadius: 2,
                                                        ...getSquareBorderStyle(date, entry),
                                                    }}
                                                    onPress={() => {
                                                        // Show GitHub-style tooltip (read-only)
                                                        Alert.alert(
                                                            habit.name,
                                                            getDateDisplayText(date, entry),
                                                            [
                                                                { text: 'OK', style: 'default' }
                                                            ]
                                                        );
                                                    }}
                                                    activeOpacity={0.7}
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
                    {/* Missed */}
                    <View className="flex-row items-center mr-4">
                        <View 
                            style={{
                                width: 12,
                                height: 12,
                                backgroundColor: getColor('background'),
                                borderWidth: 1,
                                borderColor: getColor('outline'),
                                marginRight: 4,
                                borderRadius: 2,
                            }}
                        />
                        <Text className="text-on-surface-variant text-xs">
                            Missed
                        </Text>
                    </View>
                    
                    {/* Excused */}
                    <View className="flex-row items-center mr-4">
                        <View 
                            style={{
                                width: 12,
                                height: 12,
                                backgroundColor: getColor('warning'),
                                marginRight: 4,
                                borderRadius: 2,
                            }}
                        />
                        <Text className="text-on-surface-variant text-xs">
                            Excused
                        </Text>
                    </View>
                    
                    {/* Completed */}
                    <View className="flex-row items-center">
                        <View 
                            style={{
                                width: 12,
                                height: 12,
                                backgroundColor: getColor('primary'),
                                marginRight: 4,
                                borderRadius: 2,
                            }}
                        />
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