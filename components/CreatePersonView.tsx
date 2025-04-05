import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonProperty, PersonNote } from '../models';
import { PersonManager } from '../managers';

interface CreatePersonViewProps {
    visible: boolean;
    onDismiss: () => void;
    onPersonCreated?: () => void;
}

const CreatePersonView: React.FC<CreatePersonViewProps> = ({
    visible,
    onDismiss,
    onPersonCreated,
}) => {
    const [name, setName] = useState('');
    const [properties, setProperties] = useState<PersonProperty[]>([]);
    const [notes, setNotes] = useState<PersonNote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [newPropertyKey, setNewPropertyKey] = useState('');
    const [newPropertyValue, setNewPropertyValue] = useState('');
    const [newNote, setNewNote] = useState('');

    const personManager = PersonManager.getInstance();

    const handleCreatePerson = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await personManager.createPerson(name, properties, notes);
            setName('');
            setProperties([]);
            setNotes([]);
            onPersonCreated?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create person');
        } finally {
            setIsLoading(false);
        }
    };

    const addProperty = () => {
        if (!newPropertyKey || !newPropertyValue) return;

        const newProp: PersonProperty = {
            id: Date.now().toString(),
            key: newPropertyKey,
            value: newPropertyValue,
        };

        setProperties([...properties, newProp]);
        setNewPropertyKey('');
        setNewPropertyValue('');
    };

    const addNote = () => {
        if (!newNote) return;

        const now = new Date();
        const newNoteItem: PersonNote = {
            id: Date.now().toString(),
            content: newNote,
            createdAt: now,
            updatedAt: now,
        };

        setNotes([...notes, newNoteItem]);
        setNewNote('');
    };

    const deleteProperty = (id: string) => {
        setProperties(properties.filter(prop => prop.id !== id));
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onDismiss}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>New Person</Text>

                    <TouchableOpacity
                        onPress={handleCreatePerson}
                        disabled={!name.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#007AFF" />
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
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Name</Text>
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Person Name"
                        />
                    </View>

                    {/* Properties Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Properties</Text>

                        {properties.map(property => (
                            <View key={property.id} style={styles.propertyItem}>
                                <View style={styles.propertyContent}>
                                    <Text style={styles.propertyKey}>{property.key}</Text>
                                    <Text style={styles.propertyValue}>{property.value}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => deleteProperty(property.id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={18} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <View style={styles.addPropertyContainer}>
                            <View style={styles.addPropertyInputs}>
                                <View style={styles.propertyKeyInput}>
                                    <Text style={styles.inputLabel}>Key</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newPropertyKey}
                                        onChangeText={setNewPropertyKey}
                                        placeholder="Property Key"
                                    />
                                </View>

                                <View style={styles.propertyValueInput}>
                                    <Text style={styles.inputLabel}>Value</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newPropertyValue}
                                        onChangeText={setNewPropertyValue}
                                        placeholder="Property Value"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={addProperty}
                                disabled={!newPropertyKey || !newPropertyValue}
                                style={styles.addIconButton}
                            >
                                <Ionicons
                                    name="add-circle"
                                    size={24}
                                    color={(!newPropertyKey || !newPropertyValue) ? "#CCCCCC" : "#007AFF"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Notes Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notes</Text>

                        {notes.map(note => (
                            <View key={note.id} style={styles.noteItem}>
                                <View style={styles.noteContent}>
                                    <Text style={styles.noteText}>{note.content}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => deleteNote(note.id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={18} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <View style={styles.addNoteContainer}>
                            <TextInput
                                style={styles.addNoteInput}
                                value={newNote}
                                onChangeText={setNewNote}
                                placeholder="Add a note..."
                                multiline
                            />

                            <TouchableOpacity
                                onPress={addNote}
                                disabled={!newNote}
                                style={styles.addIconButton}
                            >
                                <Ionicons
                                    name="add-circle"
                                    size={24}
                                    color={!newNote ? "#CCCCCC" : "#007AFF"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
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
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    nameInput: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
    },
    propertyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    propertyContent: {
        flex: 1,
    },
    propertyKey: {
        fontSize: 12,
        color: '#666',
    },
    propertyValue: {
        fontSize: 16,
    },
    addPropertyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    addPropertyInputs: {
        flex: 1,
        flexDirection: 'row',
    },
    propertyKeyInput: {
        flex: 1,
        marginRight: 8,
    },
    propertyValueInput: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 8,
    },
    addIconButton: {
        marginLeft: 8,
        padding: 4,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    noteContent: {
        flex: 1,
    },
    noteText: {
        fontSize: 16,
    },
    addNoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    addNoteInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 8,
        minHeight: 60,
    },
    deleteButton: {
        padding: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorText: {
        color: 'red',
        padding: 16,
        textAlign: 'center',
    },
});

export default CreatePersonView;