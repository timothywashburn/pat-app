import React, { useState } from 'react';
import {
    ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeManager';
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";

interface CreateAgendaItemViewProps {
    visible: boolean;
    onDismiss: () => void;
    onItemCreated?: () => void;
    initialName?: string;
}

const CreateAgendaItemView: React.FC<CreateAgendaItemViewProps> = ({
    visible,
    onDismiss,
    onItemCreated,
    initialName = ''
}) => {
    const { colors } = useTheme();
    const [name, setName] = useState(initialName);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [notes, setNotes] = useState('');
    const [urgent, setUrgent] = useState(false);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [type, setType] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Get categories and types from settings
    const settingsManager = SettingsManager.shared;
    const categories = settingsManager.categories;
    const types = settingsManager.types;

    const agendaManager = AgendaManager.getInstance();

    const handleCreateItem = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await agendaManager.createAgendaItem({
                name: name.trim(),
                date: date,
                notes: notes.trim() || undefined,
                urgent: urgent,
                category: category,
                type: type,
            });

            // Reset form
            setName('');
            setDate(new Date());
            setNotes('');
            setUrgent(false);
            setCategory(undefined);
            setType(undefined);

            onItemCreated?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <SafeAreaView className="flex-1 bg-surface" edges={['top', 'right', 'left']}>
                <View className="flex-row justify-between items-center px-4 py-4 border-b border-unset">
                    <TouchableOpacity onPress={onDismiss}>
                        <Text className="text-accent text-base">Cancel</Text>
                    </TouchableOpacity>

                    <Text className="text-lg font-bold text-primary">New Item</Text>

                    <TouchableOpacity
                        onPress={handleCreateItem}
                        disabled={!name.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={colors.accent} />
                        ) : (
                            <Text
                                className={`text-accent text-base font-semibold ${!name.trim() ? 'opacity-50' : ''}`}
                            >
                                Add
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {errorMessage && (
                    <Text className="text-red-500 p-4 text-center">{errorMessage}</Text>
                )}

                <ScrollView className="flex-1 p-4">
                    <View className="mb-5">
                        <Text className="text-base font-medium text-primary mb-2">Name</Text>
                        <TextInput
                            className="border border-unset rounded-lg p-3 text-primary"
                            value={name}
                            onChangeText={setName}
                            placeholder="Item Name"
                            placeholderTextColor={colors.secondary}
                        />
                    </View>

                    <View className="mb-5">
                        <Text className="text-base font-medium text-primary mb-2">Date</Text>
                        <View className="flex-row items-center">
                            {date ? (
                                <TouchableOpacity
                                    className="flex-1 flex-row items-center justify-between border border-unset rounded-lg p-3"
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text className="text-base text-primary">
                                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </Text>
                                    <Ionicons name="calendar" size={20} color={colors.accent} />
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
                                    <Ionicons name="add-circle" size={20} color={colors.accent} />
                                </TouchableOpacity>
                            )}

                            {date && (
                                <TouchableOpacity
                                    className="ml-2 p-1"
                                    onPress={() => setDate(undefined)}
                                >
                                    <Ionicons name="close-circle" size={24} color={colors.secondary} />
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
                            <Text className="text-base font-medium text-red-500">Urgent</Text>
                            <Switch
                                value={urgent}
                                onValueChange={setUrgent}
                                trackColor={{ false: "#d3d3d3", true: "#FF3B30" }}
                                thumbColor={urgent ? "#fff" : "#f4f3f4"}
                                ios_backgroundColor="#d3d3d3"
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-base font-medium text-primary mb-2">Category</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
                        >
                            <TouchableOpacity
                                className={`border rounded-2xl px-3 py-1.5 ${category === undefined ? 'bg-accent border-accent' : 'bg-background border-unset'}`}
                                onPress={() => setCategory(undefined)}
                            >
                                <Text
                                    className={`text-sm ${category === undefined ? 'text-white' : 'text-primary'}`}
                                >
                                    None
                                </Text>
                            </TouchableOpacity>

                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    className={`border rounded-2xl px-3 py-1.5 ${category === cat ? 'bg-accent border-accent' : 'bg-background border-unset'}`}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text
                                        className={`text-sm ${category === cat ? 'text-white' : 'text-primary'}`}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="mb-5">
                        <Text className="text-base font-medium text-primary mb-2">Type</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
                        >
                            <TouchableOpacity
                                className={`border rounded-2xl px-3 py-1.5 ${type === undefined ? 'bg-accent border-accent' : 'bg-background border-unset'}`}
                                onPress={() => setType(undefined)}
                            >
                                <Text
                                    className={`text-sm ${type === undefined ? 'text-white' : 'text-primary'}`}
                                >
                                    None
                                </Text>
                            </TouchableOpacity>

                            {types.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    className={`border rounded-2xl px-3 py-1.5 ${type === t ? 'bg-accent border-accent' : 'bg-background border-unset'}`}
                                    onPress={() => setType(t)}
                                >
                                    <Text
                                        className={`text-sm ${type === t ? 'text-white' : 'text-primary'}`}
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
                            className="border border-unset rounded-lg p-3 text-base text-primary min-h-[100px]"
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Add notes..."
                            placeholderTextColor={colors.secondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="h-10" />
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

export default CreateAgendaItemView;