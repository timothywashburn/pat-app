import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DatePickerProps {
    selectedDate: Date;
    onDateSelected: (date: Date) => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
};

const WebDatePicker: React.FC<DatePickerProps> = ({
    selectedDate,
    onDateSelected
}) => {
    const [currentMonth, setCurrentMonth] = React.useState(selectedDate.getMonth());
    const [currentYear, setCurrentYear] = React.useState(selectedDate.getFullYear());

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prevYear => prevYear - 1);
        } else {
            setCurrentMonth(prevMonth => prevMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prevYear => prevYear + 1);
        } else {
            setCurrentMonth(prevMonth => prevMonth + 1);
        }
    };

    const selectDay = (day: number | null) => {
        if (day === null) return;

        const newDate = new Date(selectedDate);
        newDate.setFullYear(currentYear);
        newDate.setMonth(currentMonth);
        newDate.setDate(day);
        onDateSelected(newDate);
    };

    const isToday = (day: number | null) => {
        if (day === null) return false;

        const today = new Date();
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    const isSelected = (day: number | null) => {
        if (day === null) return false;

        return day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear();
    };

    const generateCalendarWeeks = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

        const weeks = [];
        let week = [];

        for (let i = 0; i < firstDay; i++) week.push(null);

        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);

            if (week.length === 7) {
                weeks.push([...week]);
                week = [];
            }
        }

        if (week.length > 0) {
            while (week.length < 7) week.push(null);
            weeks.push(week);
        }

        return weeks;
    };

    const weeks = generateCalendarWeeks();

    return (
        <View className="p-4">
            {/* Month and year navigation */}
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={goToPrevMonth} className="p-2">
                    <Text className="text-primary font-bold">←</Text>
                </TouchableOpacity>

                <Text className="text-on-background font-bold">
                    {MONTHS[currentMonth]} {currentYear}
                </Text>

                <TouchableOpacity onPress={goToNextMonth} className="p-2">
                    <Text className="text-primary font-bold">→</Text>
                </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View className="flex-row mb-2">
                {DAYS.map((day, index) => (
                    <View key={index} className="flex-1 items-center">
                        <Text className="text-on-background-variant font-medium">{day}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid with proper table layout */}
            {weeks.map((week, weekIndex) => (
                <View key={weekIndex} className="flex-row h-10">
                    {week.map((day, dayIndex) => (
                        <TouchableOpacity
                            key={dayIndex}
                            onPress={() => selectDay(day)}
                            className="flex-1 items-center justify-center"
                            disabled={day === null}
                        >
                            <View className={`h-8 w-8 items-center justify-center rounded-full
                                ${isSelected(day) ? 'bg-primary' : isToday(day) ? 'bg-primary-container' : 'bg-transparent'}`}
                            >
                                <Text className={`
                                    ${isSelected(day) ? 'text-on-primary' : isToday(day) ? 'text-on-primary-container' : 'text-on-background'}
                                    ${day === null ? 'opacity-0' : ''}
                                `}>
                                    {day || ' '}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

export default WebDatePicker;