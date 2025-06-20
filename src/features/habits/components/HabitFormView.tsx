import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormTextArea from '@/src/components/common/FormTextArea';
import SelectionList from '@/src/components/common/SelectionList';
import FormSection from '@/src/components/common/FormSection';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import { Habit } from "@timothyw/pat-common";
import { HabitFrequency } from "@timothyw/pat-common/src/types/models/habit-data";

interface HabitFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onCancel?: () => void;
    onHabitSaved?: () => void;
    existingHabit?: Habit;
    isEditMode?: boolean;
}

const HabitFormView: React.FC<HabitFormViewProps> = ({
    isPresented,
    onDismiss,
    onCancel,
    onHabitSaved,
    existingHabit,
    isEditMode = false
}) => {
    const { getColor } = useTheme();

    const [name, setName] = useState(existingHabit?.name || '');
    const [description, setDescription] = useState(existingHabit?.description || '');
    const [frequency, setFrequency] = useState(existingHabit?.frequency || HabitFrequency.DAILY);
    const [rolloverTime, setRolloverTime] = useState(existingHabit?.rolloverTime || '00:00');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const habitManager = HabitManager.getInstance();

    if (!isPresented) {
        return null;
    }

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
                description: description.trim() || undefined,
                frequency,
                rolloverTime,
            };

            if (isEditMode && existingHabit) {
                await habitManager.updateHabit(existingHabit._id, habitData);
            } else {
                await habitManager.createHabit(habitData);
            }

            if (!isEditMode) {
                setName('');
                setDescription('');
                setFrequency(HabitFrequency.DAILY);
                setRolloverTime('00:00');
            }

            onHabitSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save habit');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingHabit) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await habitManager.deleteHabit(existingHabit._id);
            onHabitSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete habit');
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isEditMode && existingHabit) {
            setName(existingHabit.name);
            setDescription(existingHabit.description || '');
            setFrequency(existingHabit.frequency);
            setRolloverTime(existingHabit.rolloverTime);
        } else {
            setName('');
            setDescription('');
            setFrequency(HabitFrequency.DAILY);
            setRolloverTime('00:00');
        }
        setErrorMessage(null);
        
        // Use onCancel if provided (for edit mode navigation back to detail view)
        // Otherwise use onDismiss (for create mode navigation back to list)
        if (onCancel) {
            onCancel();
        } else {
            onDismiss();
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
            isPresented={isPresented}
            onDismiss={handleCancel}
            title={isEditMode ? 'Edit Habit' : 'New Habit'}
            isEditMode={isEditMode}
            onSave={handleSaveHabit}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={existingHabit}
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
                        autoFocus={!isEditMode}
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
                </FormSection>

        </BaseFormView>
    );
};

export default HabitFormView;