import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";

interface CreateAgendaItemViewProps {
    visible: boolean;
    onDismiss: () => void;
    onItemCreated?: () => void;
}

const CreateAgendaItemView: React.FC<CreateAgendaItemViewProps> = ({
    visible,
    onDismiss,
    onItemCreated,
}) => {
    const [name, setName] = useState('');
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
            <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onDismiss}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>New Item</Text>

                    <TouchableOpacity
                        onPress={handleCreateItem}
                        disabled={!name.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#007AFF"/>
                        ) : (
                            <Text
                                style={[
                                    styles.addButton,
                                    !name.trim() && styles.disabledButton
                                ]}
                            >
                                Add
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
                                    <Ionicons name="calendar" size={20} color="#007AFF"/>
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
                                    <Ionicons name="add-circle" size={20} color="#007AFF"/>
                                </TouchableOpacity>
                            )}

                            {date && (
                                <TouchableOpacity
                                    style={styles.clearDateButton}
                                    onPress={() => setDate(undefined)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#999"/>
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
                                trackColor={{false: "#d3d3d3", true: "#FF3B30"}}
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

                    <View style={styles.bottomPadding}/>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
    cancelButton: {
        color: '#007AFF',
        fontSize: 16,
    },
    addButton: {
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

export default CreateAgendaItemView;