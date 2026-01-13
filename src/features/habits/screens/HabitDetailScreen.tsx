import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    InteractionManager,
    Text,
    View,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import HabitCalendarGrid from '../components/HabitCalendarGrid';
import HabitActionButtons from '../components/HabitActionButtons';
import TimeRemainingIndicator from '../components/TimeRemainingIndicator';
import { fromDateOnlyString, getActiveHabitDate, getPreviousHabitDate } from "@/src/features/habits/models";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";
import { NotificationsSection } from "@/src/features/notifications/components/NotificationsSection";
import { NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import HabitResetTimeSlider from "@/src/components/common/HabitResetTimeSlider";

interface HabitDetailViewProps {
    navigation: StackNavigationProp<MainStackParamList, 'HabitDetail'>;
    route: RouteProp<MainStackParamList, 'HabitDetail'>;
}

const HabitDetailScreen: React.FC<HabitDetailViewProps> = ({
    navigation,
    route,
}) => {
    const { getColor } = useTheme();
    const { habits } = useHabitsStore();
    const [showCalendar, setShowCalendar] = useState(false);

    const currentHabit = habits.find(habit => habit._id === route.params.habitId);

    // Defer calendar rendering until after screen transition
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setShowCalendar(true);
        });

        return () => task.cancel();
    }, []);

    if (!currentHabit) {
        return null;
    }

    const currentDate = getActiveHabitDate(currentHabit);
    const previousDate = getPreviousHabitDate(currentHabit);

    const sections = [
        // Habit Info Section
        {
            content: (
                <>
                    <Text className="text-on-surface text-2xl font-bold mb-2">
                        {currentHabit.name}
                    </Text>

                    {currentHabit.description && (
                        <Text className="text-on-surface-variant text-base mb-4">
                            {currentHabit.description}
                        </Text>
                    )}

                    {currentHabit.notes && (
                        <Text className="text-on-surface-variant text-base mb-4">
                            {currentHabit.notes}
                        </Text>
                    )}

                    <View className="flex-row justify-between mb-4">
                        <View>
                            <Text className="text-on-surface-variant text-xs">
                                Frequency: {currentHabit.frequency}
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-primary text-xl font-bold">
                                {currentHabit.stats.completedDays}/{currentHabit.stats.totalDays - currentHabit.stats.excusedDays} Completions
                            </Text>
                        </View>
                    </View>

                    <TimeRemainingIndicator habit={currentHabit} />
                </>
            )
        },
        // Calendar Grid Section
        {
            content: showCalendar ? (
                <HabitCalendarGrid
                    habit={currentHabit}
                    viewMode="weeks" // Default to last 52 weeks
                />
            ) : (
                <View className="items-center justify-center py-[104px]">
                    <ActivityIndicator size="large" color={getColor("primary")} />
                    <Text className="text-on-surface-variant text-sm mt-2">Loading calendar...</Text>
                </View>
            )
        },
        // Action Buttons Section
        {
            content: (
                <>
                    <Text className="text-on-surface text-medium font-semibold mb-4">
                        Completion Status
                    </Text>

                    {/* Today's Actions */}
                    {currentDate && (
                        <View className="mb-4">
                            <HabitActionButtons
                                habit={currentHabit}
                                targetDate={currentDate}
                                showDateInfo={true}
                            />
                        </View>
                    )}

                    {/* Yesterday's Actions */}
                    {previousDate && (
                        <View>
                            <HabitActionButtons
                                habit={currentHabit}
                                targetDate={previousDate}
                                showDateInfo={true}
                            />
                        </View>
                    )}
                </>
            )
        },
        // Reset Time Section
        {
            content: (
                <HabitResetTimeSlider
                    startOffsetMinutes={currentHabit.startOffsetMinutes}
                    endOffsetMinutes={currentHabit.endOffsetMinutes}
                    readOnly={true}
                />
            )
        },
        // Notifications
        {
            content: (
                <NotificationsSection
                    targetEntityType={NotificationEntityType.HABIT}
                    targetId={currentHabit._id}
                    targetLevel={NotificationTemplateLevel.ENTITY}
                    entityName={currentHabit.name}
                />
            )
        },
        // Habit Details Section
        {
            content: (
                <>
                    <Text className="text-on-surface text-medium font-semibold mb-3">
                        Details
                    </Text>
                    
                    <View className="space-y-2">
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Success Rate</Text>
                            <Text className="text-on-surface">{currentHabit.stats.completionRate == -1 ? "-" : currentHabit.stats.completionRate.toFixed(1) + "%"}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Completed</Text>
                            <Text className="text-on-surface">{currentHabit.stats.completedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Excused</Text>
                            <Text className="text-on-surface">{currentHabit.stats.excusedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Missed</Text>
                            <Text className="text-on-surface">{currentHabit.stats.missedDays}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Created</Text>
                            <Text className="text-on-surface">
                                {fromDateOnlyString(currentHabit.firstDay).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-on-surface-variant">Total Days</Text>
                            <Text className="text-on-surface">{currentHabit.stats.totalDays}</Text>
                        </View>
                    </View>
                </>
            )
        }
    ];

    return (
        <BaseDetailView
            navigation={navigation}
            route={route}
            title={currentHabit.name}
            onEditRequest={() => navigation.navigate('HabitForm', {
                habitId: currentHabit._id,
                isEditing: true
            })}
            sections={sections}
        />
    );
};

export default HabitDetailScreen;