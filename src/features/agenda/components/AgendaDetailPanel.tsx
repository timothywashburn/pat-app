import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeManager';
import { SettingsManager } from "@/src/features/settings/controllers/SettingsManager";
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";
import { AgendaItem } from "@/src/features/agenda/models";

interface AgendaDetailPanelProps {
    item: AgendaItem;
    isPresented: boolean;
    onDismiss: () => void;
}

const AgendaDetailPanel: React.FC<AgendaDetailPanelProps> = ({
    item,
    isPresented,
    onDismiss,
}) => {
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();

    // State for edited values
    const [name, setName] = useState(item.name);
    const [date, setDate] = useState<Date | undefined>(item.date);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [notes, setNotes] = useState(item.notes || '');
    const [urgent, setUrgent] = useState(item.urgent);
    const [category, setCategory] = useState<string | undefined>(item.category);
    const [type, setType] = useState<string | undefined>(item.type);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Get categories and types from settings
    const settingsManager = SettingsManager.shared;
    const categories = settingsManager.categories;
    const types = settingsManager.types;

    const agendaManager = AgendaManager.getInstance();

    const handleSave = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await agendaManager.updateAgendaItem(
                item.id,
                {
                    name: name.trim(),
                    date: date,
                    notes: notes.trim() || undefined,
                    urgent: urgent,
                    category: category,
                    type: type,
                }
            );

            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update item');
            setIsLoading(false);
        }
    };

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await agendaManager.setCompleted(item.id, !item.completed);
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update item');
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
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
                            await agendaManager.deleteAgendaItem(item.id);
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
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    if (!isPresented) {
        return null;
    }

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-unset">
                <TouchableOpacity onPress={onDismiss}>
                    <Ionicons name="chevron-back" size={24} color={getColor("error")} />
                </TouchableOpacity>

                <Text className="text-on-surface text-lg font-bold">Edit Item</Text>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!name.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={getColor("primary")} />
                    ) : (
                        <Text
                            className={`text-primary text-base font-semibold ${!name.trim() ? 'opacity-50' : ''}`}
                        >
                            Save
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <Text className="text-unknown p-4 text-center">{errorMessage}</Text>
            )}

            <ScrollView className="flex-1 p-4">
                <View className="mb-5">
                    <Text className="text-on-background text-base font-medium mb-2">Name</Text>
                    <TextInput
                        className="text-on-surface border border-unset rounded-lg p-3"
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
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text className="text-on-surface text-base">
                                    {date.toLocaleDateString()} at {date.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                </Text>
                                <Ionicons name="calendar" size={20} color={getColor("primary")} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center border border-unset rounded-lg p-3 bg-background"
                                onPress={() => {
                                    setDate(new Date());
                                    setShowDatePicker(true);
                                }}
                            >
                                <Text className="text-base text-accent mr-2">Add Date</Text>
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

                    {showDatePicker && (
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
                        <Text className="text-on-background text-base font-medium">Urgent</Text>
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
                    <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
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

                <View className="mt-5 gap-2.5">
                    <TouchableOpacity
                        className="bg-primary flex-row items-center justify-center rounded-lg p-3"
                        onPress={handleToggleCompleted}
                    >
                        <Ionicons name={item.completed ? "refresh-circle" : "checkmark-circle"} size={20} color={getColor("on-primary")} />
                        <Text className="text-on-primary text-base font-semibold ml-2">
                            {item.completed ? "Mark as Incomplete" : "Mark as Complete"}
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

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default AgendaDetailPanel;