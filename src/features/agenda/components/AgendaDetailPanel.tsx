import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgendaItem } from '@/src/models';
import { SettingsManager } from "@/src/features/settings/controllers/SettingsManager";
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";

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
            style={[
                styles.container,
                { paddingTop: insets.top }
            ]}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onDismiss}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>

                <Text style={styles.title}>Edit Item</Text>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!name.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                        <Text
                            style={[
                                styles.saveButton,
                                !name.trim() && styles.disabledButton
                            ]}
                        >
                            Save
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <ScrollView style={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Item Name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Date</Text>
                    <View style={styles.dateContainer}>
                        {date ? (
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateText}>
                                    {date.toLocaleDateString()} at {date.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.addDateButton}
                                onPress={() => {
                                    setDate(new Date());
                                    setShowDatePicker(true);
                                }}
                            >
                                <Text style={styles.addDateText}>Add Date</Text>
                                <Ionicons name="add-circle" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        )}

                        {date && (
                            <TouchableOpacity
                                style={styles.clearDateButton}
                                onPress={() => setDate(undefined)}
                            >
                                <Ionicons name="close-circle" size={24} color="#999" />
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

                <View style={styles.formGroup}>
                    <View style={styles.urgentRow}>
                        <Text style={[styles.label, styles.urgentLabel]}>Urgent</Text>
                        <Switch
                            value={urgent}
                            onValueChange={setUrgent}
                            trackColor={{ false: "#d3d3d3", true: "#FF3B30" }}
                            thumbColor={urgent ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#d3d3d3"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Category</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryContainer}
                    >
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                category === undefined && styles.selectedChip
                            ]}
                            onPress={() => setCategory(undefined)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    category === undefined && styles.selectedChipText
                                ]}
                            >
                                None
                            </Text>
                        </TouchableOpacity>

                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    category === cat && styles.selectedChip
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        category === cat && styles.selectedChipText
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Type</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryContainer}
                    >
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                type === undefined && styles.selectedChip
                            ]}
                            onPress={() => setType(undefined)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    type === undefined && styles.selectedChipText
                                ]}
                            >
                                None
                            </Text>
                        </TouchableOpacity>

                        {types.map(t => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.categoryChip,
                                    type === t && styles.selectedChip
                                ]}
                                onPress={() => setType(t)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        type === t && styles.selectedChipText
                                    ]}
                                >
                                    {t}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add notes..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={handleToggleCompleted}
                    >
                        <Ionicons name={item.completed ? "refresh-circle" : "checkmark-circle"} size={20}
                                  color="white" />
                        <Text style={styles.completeButtonText}>
                            {item.completed ? "Mark as Incomplete" : "Mark as Complete"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text style={styles.deleteButtonText}>Delete Item</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    urgentLabel: {
        color: '#FF3B30',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        fontSize: 16,
    },
    addDateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f8f8f8',
    },
    addDateText: {
        fontSize: 16,
        color: '#007AFF',
        marginRight: 8,
    },
    clearDateButton: {
        marginLeft: 8,
        padding: 4,
    },
    urgentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryContainer: {
        paddingVertical: 4,
        gap: 8,
    },
    categoryChip: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f8f8f8',
    },
    selectedChip: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        fontSize: 14,
    },
    selectedChipText: {
        color: '#fff',
    },
    actionButtons: {
        marginTop: 20,
        gap: 10,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CD964',
        borderRadius: 8,
        padding: 12,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        padding: 12,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorText: {
        color: 'red',
        padding: 16,
        textAlign: 'center',
    },
    bottomPadding: {
        height: 40,
    },
});

export default AgendaDetailPanel;