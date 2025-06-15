import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import { HabitManager } from '@/src/features/habits/controllers/HabitManager';
import { Habit } from "@timothyw/pat-common";
import { HabitFrequency } from "@timothyw/pat-common/src/types/models/habit-data";

interface HabitFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onHabitSaved?: () => void;
    existingHabit?: Habit;
    isEditMode?: boolean;
}

const HabitFormView: React.FC<HabitFormViewProps> = ({
    isPresented,
    onDismiss,
    onHabitSaved,
    existingHabit,
    isEditMode = false
}) => {
    const insets = useSafeAreaInsets();
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

    const handleDelete = () => {
        if (!existingHabit) return;

        Alert.alert(
            'Delete Habit',
            'Are you sure you want to delete this habit? All tracking data will be lost. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
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
                    }
                },
            ]
        );
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
        onDismiss();
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
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
                <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
                    <Text className="text-primary text-base font-medium">
                        Cancel
                    </Text>
                </TouchableOpacity>

                <Text className="text-on-surface text-lg font-bold">
                    {isEditMode ? 'Edit Habit' : 'New Habit'}
                </Text>

                <TouchableOpacity 
                    onPress={handleSaveHabit} 
                    disabled={isLoading || !name.trim()}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={getColor("primary")} />
                    ) : (
                        <Text 
                            className={`text-base font-semibold ${
                                name.trim() ? 'text-primary' : 'text-on-surface-variant'
                            }`}
                        >
                            Save
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <View className="bg-error-container p-4">
                    <Text className="text-on-error-container text-center">{errorMessage}</Text>
                </View>
            )}

            <ScrollView className="flex-1 p-4">
                <View className="bg-surface rounded-lg p-4 mb-5">
                    <Text className="text-on-surface text-lg font-semibold mb-3">
                        Habit Details
                    </Text>

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            Habit Name *
                        </Text>
                        <TextInput
                            className="bg-surface border border-outline rounded-lg p-3 text-on-surface text-base"
                            placeholder="e.g., Morning Exercise, Read for 20 minutes"
                            placeholderTextColor={getColor('on-surface-variant')}
                            value={name}
                            onChangeText={setName}
                            autoFocus={!isEditMode}
                            maxLength={100}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            Description
                        </Text>
                        <TextInput
                            className="bg-surface border border-outline rounded-lg p-3 text-on-surface text-base"
                            placeholder="Add details about your habit (optional)"
                            placeholderTextColor={getColor('on-surface-variant')}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            maxLength={300}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-on-surface text-base font-medium mb-2">
                            Frequency
                        </Text>
                        <View className="bg-surface border border-outline rounded-lg">
                            {frequencyOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={option.value}
                                    className={`flex-row items-center justify-between p-3 ${
                                        index < frequencyOptions.length - 1 ? 'border-b border-outline' : ''
                                    }`}
                                    onPress={() => setFrequency(option.value)}
                                >
                                    <View className="flex-1">
                                        <Text className="text-on-surface text-base">
                                            {option.label}
                                        </Text>
                                        <Text className="text-on-surface-variant text-sm">
                                            {option.description}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={frequency === option.value ? 'radio-button-on' : 'radio-button-off'}
                                        size={20}
                                        color={frequency === option.value ? getColor('primary') : getColor('on-surface-variant')}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

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
                </View>

                {isEditMode && existingHabit && (
                    <View className="mt-5">
                        <TouchableOpacity
                            className="bg-error flex-row items-center justify-center rounded-lg p-3"
                            onPress={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={getColor("on-error")} />
                            ) : (
                                <>
                                    <Text className="text-on-error text-base font-semibold mr-2">
                                        Delete Habit
                                    </Text>
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color={getColor("on-error")}
                                    />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default HabitFormView;