import React, { useState } from 'react';
import {
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
import { useTheme } from '@/src/context/ThemeContext';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormTextArea from '@/src/components/common/FormTextArea';
import { useAgenda, useAgendaNotifications } from "@/src/features/agenda/hooks/useAgenda";
import WebDateTimePicker from './WebDateTimePicker';
import { useUserDataStore } from "@/src/features/settings/controllers/useUserDataStore";
import { CreateItemRequest, ItemData, UpdateItemRequest } from "@timothyw/pat-common";

interface AgendaItemFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onCancel?: () => void;
    onItemSaved?: () => void;
    initialName?: string;
    existingItem?: ItemData;
    isEditMode?: boolean;
}

const AgendaItemFormView: React.FC<AgendaItemFormViewProps> = ({
    isPresented,
    onDismiss,
    onCancel,
    onItemSaved,
    initialName = '',
    existingItem,
    isEditMode = false
}) => {
    const { getColor } = useTheme();

    const getTonight = () => {
        const today = new Date();
        today.setHours(23, 59, 0, 0);
        return today;
    };

    const [name, setName] = useState(existingItem?.name || initialName);
    const [date, setDate] = useState<Date | undefined>(existingItem?.dueDate);
    const [notes, setNotes] = useState(existingItem?.notes || '');
    const [urgent, setUrgent] = useState(existingItem?.urgent || false);
    const [category, setCategory] = useState<string | undefined>(existingItem?.category);
    const [type, setType] = useState<string | undefined>(existingItem?.type);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data } = useUserDataStore();
    const categories = data.config.agenda.itemCategories;
    const types = data.config.agenda.itemTypes;

    const agendaHook = useAgenda();
    const agendaNotifications = useAgendaNotifications();

    if (!isPresented) {
        return null;
    }

    const handleSaveItem = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            if (isEditMode && existingItem) {
                const itemData: UpdateItemRequest = {
                    name: name.trim(),
                    dueDate: date?.toISOString() || null,
                    notes: notes.trim() || null,
                    urgent: urgent,
                    category: category || null,
                    type: type || null,
                };

                await agendaHook.updateAgendaItem(existingItem._id, itemData);
            } else {
                const itemData: CreateItemRequest = {
                    name: name.trim(),
                    dueDate: date?.toISOString(),
                    notes: notes.trim(),
                    urgent: urgent,
                    category: category,
                    type: type,
                };

                const newItem = await agendaHook.createAgendaItem(itemData);
                
                // Register notifications for the new item
                await agendaNotifications.registerItemNotifications(newItem);
            }

            if (!isEditMode) {
                setName('');
                setDate(getTonight());
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

    const handleDelete = async () => {
        if (!existingItem) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Remove notifications before deleting
            await agendaNotifications.removeItemNotifications(existingItem._id);
            
            await agendaHook.deleteAgendaItem(existingItem._id);
            onItemSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete item');
            setIsLoading(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            if (Platform.OS === 'android') {
                setShowDatePicker(false);
                setShowTimePicker(false);
            } else {
                setShowDatePicker(false);
            }
            return;
        }

        const currentDate = selectedDate || date || getTonight();

        if (Platform.OS === 'android') {
            if (showDatePicker) {
                if (date) {
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    currentDate.setHours(hours, minutes, 0, 0);
                }

                setShowDatePicker(false);
                setShowTimePicker(true);
            } else if (showTimePicker) {
                setShowTimePicker(false);
            }
        } else {
            setShowDatePicker(false);
        }

        setDate(currentDate);
    };

    const handleWebDateChange = (selectedDate: Date) => {
        setDate(selectedDate);
    };

    const showDateTimePickerModal = () => {
        setShowDatePicker(true);
    };

    return (
        <BaseFormView
            isPresented={isPresented}
            onDismiss={onDismiss}
            onCancel={onCancel}
            title={isEditMode ? 'Edit Item' : 'New Item'}
            isEditMode={isEditMode}
            saveText={isEditMode ? 'Save' : 'Add'}
            onSave={handleSaveItem}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={existingItem}
            onDelete={handleDelete}
            deleteButtonText="Delete Item"
            deleteConfirmTitle="Delete Item"
            deleteConfirmMessage="Are you sure you want to delete this item? This action cannot be undone."
        >
            {Platform.OS === 'web' && showDatePicker && (
                <View className="absolute inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center">
                    <TouchableOpacity
                        className="absolute inset-0"
                        onPress={() => setShowDatePicker(false)}
                        activeOpacity={1}
                    />
                    <View className="z-20">
                        <WebDateTimePicker
                            date={date}
                            onDateChange={handleWebDateChange}
                            onDismiss={() => setShowDatePicker(false)}
                        />
                    </View>
                </View>
            )}
                <FormField
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Item Name"
                    required
                />

                <View className="mb-5">
                    <Text className="text-on-background text-base font-medium mb-2">Date</Text>
                    <View className="flex-row items-center">
                        {date ? (
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-between border border-outline rounded-lg p-3"
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
                                className="bg-surface flex-1 flex-row items-center justify-center border border-outline rounded-lg p-3"
                                onPress={() => {
                                    setDate(getTonight());
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

                    {/* iOS Date Time Picker */}
                    {Platform.OS === 'ios' && showDatePicker && (
                        <DateTimePicker
                            value={date || getTonight()}
                            mode="datetime"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}

                    {/* Android Date Picker */}
                    {Platform.OS === 'android' && showDatePicker && (
                        <DateTimePicker
                            value={date || getTonight()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}

                    {/* Android Time Picker */}
                    {Platform.OS === 'android' && showTimePicker && (
                        <DateTimePicker
                            value={date || getTonight()}
                            mode="time"
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
                            trackColor={{ false: getColor("surface"), true: getColor("error") }}
                            thumbColor={getColor("on-background")}
                            ios_backgroundColor={getColor("surface")}
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
                            className={`border rounded-2xl px-3 py-1.5 ${category === undefined ? 'bg-primary border-outline' : 'bg-surface border-outline'}`}
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
                                className={`border rounded-2xl px-3 py-1.5 ${category === cat ? 'bg-primary border-outline' : 'bg-surface border-outline'}`}
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
                            className={`border rounded-2xl px-3 py-1.5 ${type === undefined ? 'bg-primary border-outline' : 'bg-surface border-outline'}`}
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
                                className={`border rounded-2xl px-3 py-1.5 ${type === t ? 'bg-primary border-outline' : 'bg-surface border-outline'}`}
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

                <FormTextArea
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add notes..."
                    numberOfLines={4}
                    minHeight={100}
                />

        </BaseFormView>
    );
};

export default AgendaItemFormView;