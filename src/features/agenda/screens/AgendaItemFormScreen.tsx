import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/src/context/ThemeContext';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import FormTextArea from '@/src/components/common/FormTextArea';
import { useAgendaStore } from "@/src/stores/useAgendaStore";
import WebDateTimePicker from '../components/WebDateTimePicker';
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { CreateAgendaItemRequest, AgendaItemData, UpdateAgendaItemRequest } from "@timothyw/pat-common";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";

interface AgendaItemFormViewProps {
    navigation: StackNavigationProp<MainStackParamList, 'AgendaItemForm'>;
    route: RouteProp<MainStackParamList, 'AgendaItemForm'>;
}

const AgendaItemFormScreen: React.FC<AgendaItemFormViewProps> = ({
    navigation,
    route,
}) => {
    const { getColor } = useTheme();

    const items = useAgendaStore(state => state.items);
    const currentItem = route.params.itemId ? items.find(item => item._id === route.params.itemId) : undefined;

    const currentIsEditMode = route.params.isEditing || false;
    const currentInitialName = route.params.initialName || '';
    const thoughtId = route.params.thoughtId;

    const getTonight = () => {
        const today = new Date();
        today.setHours(23, 59, 0, 0);
        return today;
    };

    const [name, setName] = useState(currentItem?.name || currentInitialName);
    const [date, setDate] = useState<Date | undefined>(currentItem?.dueDate);
    const [notes, setNotes] = useState(currentItem?.notes || '');
    const [urgent, setUrgent] = useState(currentItem?.urgent || false);
    const [category, setCategory] = useState<string | undefined>(currentItem?.category);
    const [type, setType] = useState<string | undefined>(currentItem?.type);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data } = useUserDataStore();
    const categories = data.config.agenda.itemCategories;
    const types = data.config.agenda.itemTypes;

    const { createItem, updateItem, deleteItem } = useAgendaStore();

    const handleSaveItem = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            if (currentIsEditMode && currentItem) {
                const itemData: UpdateAgendaItemRequest = {
                    name: name.trim(),
                    dueDate: date?.toISOString() || null,
                    notes: notes.trim() || null,
                    urgent: urgent,
                    category: category || null,
                    type: type || null,
                };

                await updateItem(currentItem._id, itemData);
            } else {
                const itemData: CreateAgendaItemRequest = {
                    name: name.trim(),
                    dueDate: date?.toISOString(),
                    notes: notes.trim(),
                    urgent: urgent,
                    category: category,
                    type: type,
                };

                await createItem(itemData);
            }

            if (!currentIsEditMode) {
                setName('');
                setDate(getTonight());
                setNotes('');
                setUrgent(false);
                setCategory(undefined);
                setType(undefined);
            }

            if (currentIsEditMode) {
                navigation.goBack();
            } else {
                // If this was created from a thought (inbox), navigate back to inbox with success info
                if (thoughtId) {
                    navigation.navigate('Inbox', {
                        thoughtProcessed: true, 
                        thoughtId: thoughtId 
                    });
                } else {
                    navigation.navigate('Agenda');
                }
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentItem) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await deleteItem(currentItem._id);
            navigation.navigate('Agenda');
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
            navigation={navigation}
            route={route}
            title={currentIsEditMode ? 'Edit Item' : 'New Item'}
            isEditMode={currentIsEditMode}
            saveText={currentIsEditMode ? 'Save' : 'Add'}
            onSave={handleSaveItem}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={currentItem}
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

export default AgendaItemFormScreen;