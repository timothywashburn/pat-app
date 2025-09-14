import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormTextArea from '@/src/components/common/FormTextArea';
import SelectionList from '@/src/components/common/SelectionList';
import FormSection from '@/src/components/common/FormSection';
import HabitResetTimeSlider from '@/src/components/common/HabitResetTimeSlider';
import { useHabitsStore } from '@/src/stores/useHabitsStore';
import { Habit, HabitFrequency } from "@timothyw/pat-common";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";

interface HabitFormViewProps {
    navigation: StackNavigationProp<MainStackParamList, 'HabitForm'>;
    route: RouteProp<MainStackParamList, 'HabitForm'>;
}

const HabitFormScreen: React.FC<HabitFormViewProps> = ({
    navigation,
    route,
}) => {
    const { getColor } = useTheme();
    
    const { createHabit, updateHabit, deleteHabit, habits } = useHabitsStore();
    const currentHabit = route.params.habitId ? habits.find(habit => habit._id === route.params.habitId) : undefined;
    const currentIsEditMode = route.params.isEditing || false;

    const [name, setName] = useState(currentHabit?.name || '');
    const [description, setDescription] = useState(currentHabit?.description || '');
    const [notes, setNotes] = useState(currentHabit?.notes || '');
    const [frequency, setFrequency] = useState(currentHabit?.frequency || HabitFrequency.DAILY);
    const [rolloverTime, setRolloverTime] = useState(currentHabit?.rolloverTime || '00:00');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [startOffsetMinutes, setStartOffsetMinutes] = useState(currentHabit?.startOffsetMinutes || 0);
    const [endOffsetMinutes, setEndOffsetMinutes] = useState(currentHabit?.endOffsetMinutes || 60 * 24);

    const handleSaveHabit = async () => {
        if (!name.trim()) {
            setErrorMessage('Habit name is required');
            return;
        }

        // Validate rollover time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(rolloverTime)) {
            setErrorMessage('Rollover time must be in HH:MM format (24-hour)');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const habitData = {
                name: name.trim(),
                description: description.trim() || null,
                notes: notes.trim() || null,
                frequency,
                rolloverTime,
                startOffsetMinutes,
                endOffsetMinutes,
            };

            if (currentIsEditMode && currentHabit) {
                await updateHabit(currentHabit._id, habitData);
            } else {
                await createHabit({
                    ...habitData,
                    description: habitData.description || undefined,
                    notes: habitData.notes || undefined
                });
            }

            if (!currentIsEditMode) {
                setName('');
                setDescription('');
                setFrequency(HabitFrequency.DAILY);
                setRolloverTime('00:00');
            }

            if (currentIsEditMode) {
                navigation.goBack();
            } else {
                navigation.navigate('Habits');
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save habit');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentHabit) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await deleteHabit(currentHabit._id);
            navigation.navigate('Habits');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete habit');
            setIsLoading(false);
        }
    };


    const frequencyOptions = [
        { value: HabitFrequency.DAILY, label: 'Daily', description: 'Every day' },
        // Future frequencies (disabled for now)
        // { value: HabitFrequency.WEEKDAYS_ONLY, label: 'Weekdays Only', description: 'Monday through Friday' },
        // { value: HabitFrequency.WEEKLY, label: 'Weekly', description: 'Once per week' },
        // { value: HabitFrequency.EVERY_N_DAYS, label: 'Every N Days', description: 'Customizable interval' },
    ];

    const commonRolloverTimes = [
        { value: '00:00', label: 'Midnight (00:00)' },
        { value: '06:00', label: 'Morning (06:00)' },
        { value: '12:00', label: 'Noon (12:00)' },
        { value: '18:00', label: 'Evening (18:00)' },
        { value: '22:00', label: 'Night (22:00)' },
    ];

    return (
        <BaseFormView
            navigation={navigation}
            route={route}
            title={currentIsEditMode ? 'Edit Habit' : 'New Habit'}
            isEditMode={currentIsEditMode}
            onSave={handleSaveHabit}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={currentHabit}
            onDelete={handleDelete}
            deleteButtonText="Delete Habit"
            deleteConfirmTitle="Delete Habit"
            deleteConfirmMessage="Are you sure you want to delete this habit? All tracking data will be lost. This action cannot be undone."
        >
                <FormSection title="Habit Details">
                    <FormField
                        label="Habit Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Morning Exercise, Read for 20 minutes"
                        required
                        autoFocus={!currentIsEditMode}
                        maxLength={100}
                    />

                    <FormTextArea
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add details about your habit (optional)"
                        maxLength={300}
                        numberOfLines={3}
                    />

                    <FormTextArea
                        label="Notes"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add other notes about your habit (optional)"
                        maxLength={300}
                        numberOfLines={3}
                    />

                    <SelectionList
                        label="Frequency"
                        options={frequencyOptions}
                        selectedValue={frequency}
                        onSelectionChange={(value) => setFrequency(value as any)}
                    />

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            Day Rollover Time
                        </Text>
                        <Text className="text-on-surface-variant text-sm mb-3">
                            When should your habit day reset? This affects when you can mark habits as completed.
                        </Text>

                        {/* Quick select buttons */}
                        <View className="flex-row flex-wrap mb-3">
                            {commonRolloverTimes.map((time) => (
                                <TouchableOpacity
                                    key={time.value}
                                    className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                                        rolloverTime === time.value
                                            ? 'bg-primary border-primary'
                                            : 'bg-surface border-outline'
                                    }`}
                                    onPress={() => setRolloverTime(time.value)}
                                >
                                    <Text className={`text-sm ${
                                        rolloverTime === time.value
                                            ? 'text-on-primary font-medium'
                                            : 'text-on-surface'
                                    }`}>
                                        {time.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom time input */}
                        <Text className="text-on-surface-variant text-sm mb-2">
                            Or enter custom time (24-hour format):
                        </Text>
                        <TextInput
                            className="bg-surface border border-outline rounded-lg p-3 text-on-surface text-base"
                            placeholder="HH:MM (e.g., 06:30)"
                            placeholderTextColor={getColor('on-surface-variant')}
                            value={rolloverTime}
                            onChangeText={setRolloverTime}
                            maxLength={5}
                        />
                    </View>

                    {/* MOCKUP: Habit Reset Time Slider */}
                    <HabitResetTimeSlider
                        startOffsetMinutes={startOffsetMinutes}
                        endOffsetMinutes={endOffsetMinutes}
                        onStartOffsetChange={setStartOffsetMinutes}
                        onEndOffsetChange={setEndOffsetMinutes}
                    />
                </FormSection>

        </BaseFormView>
    );
};

export default HabitFormScreen;