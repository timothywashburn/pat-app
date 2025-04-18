import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeManager';
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";
import { AgendaItem } from "@/src/features/agenda/models";
// Import the WebDateTimePicker component
import WebDateTimePicker from './WebDateTimePicker';

interface AgendaItemFormViewProps {
    visible: boolean;
    onDismiss: () => void;
    onItemSaved?: () => void;
    initialName?: string;
    existingItem?: AgendaItem;
    isEditMode?: boolean;
}

const AgendaItemFormView: React.FC<AgendaItemFormViewProps> = ({
    visible,
    onDismiss,
    onItemSaved,
    initialName = '',
    existingItem,
    isEditMode = false
}) => {
    const { getColor } = useTheme();

    const [name, setName] = useState(existingItem?.name || initialName);
    const [date, setDate] = useState<Date | undefined>(existingItem?.date || new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [notes, setNotes] = useState(existingItem?.notes || '');
    const [urgent, setUrgent] = useState(existingItem?.urgent || false);
    const [category, setCategory] = useState<string | undefined>(existingItem?.category);
    const [type, setType] = useState<string | undefined>(existingItem?.type);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const settingsManager = SettingsManager.shared;
    const categories = settingsManager.categories;
    const types = settingsManager.types;

    const agendaManager = AgendaManager.getInstance();

    const handleSaveItem = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const itemData = {
                name: name.trim(),
                date: date,
                notes: notes.trim() || undefined,
                urgent: urgent,
                category: category,
                type: type,
            };

            if (isEditMode && existingItem) {
                await agendaManager.updateAgendaItem(existingItem.id, itemData);
            } else {
                await agendaManager.createAgendaItem(itemData);
            }

            if (!isEditMode) {
                setName('');
                setDate(new Date());
                setNotes('');
                setUrgent(false);
                setCategory(undefined);
                setType(undefined);
            }

            onItemSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleCompleted = async () => {
        if (!existingItem) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await agendaManager.setCompleted(existingItem.id, !existingItem.completed);
            onItemSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update item');
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (!existingItem) return;

        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        setErrorMessage(null);

                        try {
                            await agendaManager.deleteAgendaItem(existingItem.id);
                            onItemSaved?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete item');
                            setIsLoading(false);
                        }
                    }
                },
            ]
        );
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date || new Date();

        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleWebDateChange = (selectedDate: Date) => {
        setDate(selectedDate);
    };

    const showDateTimePickerModal = () => {
        setShowDatePicker(true);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <SafeAreaProvider>
                <SafeAreaView className="bg-background flex-1" edges={['top', 'right', 'left']}>
                    <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-unset">
                        <TouchableOpacity onPress={onDismiss}>
                            <Text className="text-error text-base">Cancel</Text>
                        </TouchableOpacity>

                        <Text className="text-on-surface text-lg font-bold">
                            {isEditMode ? 'Edit Item' : 'New Item'}
                        </Text>

                        <TouchableOpacity
                            onPress={handleSaveItem}
                            disabled={!name.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={getColor("primary")} />
                            ) : (
                                <Text
                                    className={`text-primary text-base font-semibold ${!name.trim() ? 'opacity-50' : ''}`}
                                >
                                    {isEditMode ? 'Save' : 'Add'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {errorMessage && (
                        <Text className="text-unknown p-4 text-center">{errorMessage}</Text>
                    )}

                    {/* Web Date Picker Modal */}
                    {Platform.OS === 'web' && showDatePicker && (
                        <View className="absolute z-10 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                            <WebDateTimePicker
                                date={date}
                                onDateChange={handleWebDateChange}
                                onDismiss={() => setShowDatePicker(false)}
                            />
                        </View>
                    )}

                    <ScrollView className="flex-1 p-4">
                        <View className="mb-5">
                            <Text className="text-on-background text-base font-medium mb-2">Name</Text>
                            <TextInput
                                className="bg-surface text-on-surface border border-unset rounded-lg p-3"
                                value={name}
                                onChangeText={setName}
                                placeholder="Item Name"
                                placeholderTextColor={getColor("on-surface-variant")}
                            />
                        </View>

                        <View className="mb-5">
                            <Text className="text-on-background text-base font-medium mb-2">Date</Text>
                            <View className="flex-row items-center">
                                {date ? (
                                    <TouchableOpacity
                                        className="flex-1 flex-row items-center justify-between border border-unset rounded-lg p-3"
                                        onPress={showDateTimePickerModal}
                                    >
                                        <Text className="text-base text-primary">
                                            {date.toLocaleDateString()} at {date.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </Text>
                                        <Ionicons name="calendar" size={20} color={getColor("primary")} />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        className="bg-surface flex-1 flex-row items-center justify-center border border-unset rounded-lg p-3"
                                        onPress={() => {
                                            setDate(new Date());
                                            showDateTimePickerModal();
                                        }}
                                    >
                                        <Text className="text-on-surface text-base mr-2">Add Date</Text>
                                        <Ionicons name="add-circle" size={20} color={getColor("primary")} />
                                    </TouchableOpacity>
                                )}

                                {date && (
                                    <TouchableOpacity
                                        className="ml-2 p-1"
                                        onPress={() => setDate(undefined)}
                                    >
                                        <Ionicons name="close-circle" size={24} color={getColor("error")} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {Platform.OS !== 'web' && showDatePicker && (
                                <DateTimePicker
                                    value={date || new Date()}
                                    mode="datetime"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                        </View>

                        <View className="mb-5">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-on-surface text-base font-medium">Urgent</Text>
                                <Switch
                                    value={urgent}
                                    onValueChange={setUrgent}
                                    trackColor={{ false: getColor("unknown"), true: getColor("error") }}
                                    thumbColor={getColor("on-error")}
                                    ios_backgroundColor={getColor("unknown")}
                                />
                            </View>
                        </View>

                        <View className="mb-5">
                            <Text className="text-on-background text-base font-medium mb-2">Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
                            >
                                <TouchableOpacity
                                    className={`border rounded-2xl px-3 py-1.5 ${category === undefined ? 'bg-primary border-unknown' : 'bg-surface border-unset'}`}
                                    onPress={() => setCategory(undefined)}
                                >
                                    <Text
                                        className={`text-sm ${category === undefined ? 'text-on-primary' : 'text-primary'}`}
                                    >
                                        None
                                    </Text>
                                </TouchableOpacity>

                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        className={`border rounded-2xl px-3 py-1.5 ${category === cat ? 'bg-primary border-unknown' : 'bg-surface border-unset'}`}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text
                                            className={`text-sm ${category === cat ? 'text-on-primary' : 'text-primary'}`}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View className="mb-5">
                            <Text className="text-on-background text-base font-medium mb-2">Type</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
                            >
                                <TouchableOpacity
                                    className={`border rounded-2xl px-3 py-1.5 ${type === undefined ? 'bg-primary border-unknown' : 'bg-surface border-unset'}`}
                                    onPress={() => setType(undefined)}
                                >
                                    <Text
                                        className={`text-sm ${type === undefined ? 'text-on-primary' : 'text-primary'}`}
                                    >
                                        None
                                    </Text>
                                </TouchableOpacity>

                                {types.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        className={`border rounded-2xl px-3 py-1.5 ${type === t ? 'bg-primary border-unknown' : 'bg-surface border-unset'}`}
                                        onPress={() => setType(t)}
                                    >
                                        <Text
                                            className={`text-sm ${type === t ? 'text-on-primary' : 'text-primary'}`}
                                        >
                                            {t}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View className="mb-5">
                            <Text className="text-base font-medium text-primary mb-2">Notes</Text>
                            <TextInput
                                className="text-on-surface border border-unset rounded-lg p-3 text-base min-h-[100px]"
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add notes..."
                                placeholderTextColor={getColor("on-surface-variant")}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Additional actions for edit mode */}
                        {isEditMode && existingItem && (
                            <View className="mt-5 gap-2.5">
                                <TouchableOpacity
                                    className="bg-primary flex-row items-center justify-center rounded-lg p-3"
                                    onPress={handleToggleCompleted}
                                >
                                    <Ionicons name={existingItem.completed ? "refresh-circle" : "checkmark-circle"} size={20} color={getColor("on-primary")} />
                                    <Text className="text-on-primary text-base font-semibold ml-2">
                                        {existingItem.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-error flex-row items-center justify-center rounded-lg p-3"
                                    onPress={handleDelete}
                                >
                                    <Ionicons name="trash-outline" size={20} color={getColor("on-error")} />
                                    <Text className="text-on-error text-base font-semibold ml-2">Delete Item</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View className="h-10" />
                    </ScrollView>
                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    );
};

export default AgendaItemFormView;