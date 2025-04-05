import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Person, PersonProperty, PersonNote } from '../models';
import { PersonManager } from '../managers';
import { SettingsManager } from '../managers/SettingsManager';

interface PersonDetailPanelProps {
    person: Person;
    isPresented: boolean;
    onDismiss: () => void;
}

const PersonDetailPanel: React.FC<PersonDetailPanelProps> = ({
    person,
    isPresented,
    onDismiss,
}) => {
    const [name, setName] = useState(person.name);
    const [properties, setProperties] = useState<PersonProperty[]>(person.properties);
    const [notes, setNotes] = useState<PersonNote[]>(person.notes);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [newPropertyKey, setNewPropertyKey] = useState('');
    const [newPropertyValue, setNewPropertyValue] = useState('');
    const [newNote, setNewNote] = useState('');
    const [editingProperty, setEditingProperty] = useState<PersonProperty | null>(null);
    const [editingNote, setEditingNote] = useState<PersonNote | null>(null);
    const [editedValue, setEditedValue] = useState('');

    const personManager = PersonManager.getInstance();

    // Get predefined property keys from settings
    const predefinedKeys = ['Email', 'Phone', 'Company', 'Title']; // This would come from SettingsManager

    const handleSave = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await personManager.updatePerson(person.id, name, properties, notes);
            setIsEditing(false);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset to original values
        setName(person.name);
        setProperties([...person.properties]);
        setNotes([...person.notes]);
        setIsEditing(false);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Person',
            'Are you sure you want to delete this person? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await personManager.deletePerson(person.id);
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete person');
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
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
        <View style={[styles.container, { display: isPresented ? 'flex' : 'none' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={isEditing ? handleCancel : onDismiss}>
                    <Ionicons
                        name={isEditing ? 'close' : 'chevron-back'}
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : isEditing ? (
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={name.trim() === ''}
                        >
                            <Text
                                style={[
                                    styles.headerButton,
                                    name.trim() === '' && styles.disabledButton
                                ]}
                            >
                                Save
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Text style={styles.headerButton}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    {isEditing ? (
                        <>
                            <Text style={styles.sectionLabel}>Name</Text>
                            <TextInput
                                style={styles.nameInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="Person Name"
                            />
                        </>
                    ) : (
                        <Text style={styles.nameText}>{name}</Text>
                    )}
                </View>

                {/* Properties Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Properties</Text>

                    {properties.map(property => (
                        <View key={property.id} style={styles.propertyItem}>
                            {editingProperty?.id === property.id ? (
                                <View style={styles.editPropertyContainer}>
                                    <Text style={styles.propertyKey}>{property.key}</Text>
                                    <TextInput
                                        style={styles.editPropertyInput}
                                        value={editedValue}
                                        onChangeText={setEditedValue}
                                        onBlur={() => {
                                            if (editingProperty) {
                                                setProperties(props =>
                                                    props.map(p =>
                                                        p.id === editingProperty.id
                                                            ? { ...p, value: editedValue }
                                                            : p
                                                    )
                                                );
                                                setEditingProperty(null);
                                            }
                                        }}
                                        autoFocus
                                    />
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.propertyContent}
                                    onPress={() => {
                                        if (isEditing) {
                                            setEditingProperty(property);
                                            setEditedValue(property.value);
                                        }
                                    }}
                                    disabled={!isEditing}
                                >
                                    <Text style={styles.propertyKey}>{property.key}</Text>
                                    <Text style={styles.propertyValue}>{property.value}</Text>
                                </TouchableOpacity>
                            )}

                            {isEditing && (
                                <TouchableOpacity
                                    onPress={() => deleteProperty(property.id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={18} color="red" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {isEditing && (
                        <View style={styles.addPropertyContainer}>
                            <View style={styles.addPropertyInputs}>
                                <View style={styles.propertyKeyInput}>
                                    <Text style={styles.inputLabel}>Key</Text>
                                    {/* This could be a dropdown or segmented control with predefined keys */}
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
                                style={[
                                    styles.addButton,
                                    (!newPropertyKey || !newPropertyValue) && styles.disabledButton
                                ]}
                            >
                                <Ionicons name="add-circle" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Notes Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>

                    {notes.map(note => (
                        <View key={note.id} style={styles.noteItem}>
                            {editingNote?.id === note.id ? (
                                <TextInput
                                    style={styles.editNoteInput}
                                    value={editedValue}
                                    onChangeText={setEditedValue}
                                    multiline
                                    onBlur={() => {
                                        if (editingNote) {
                                            setNotes(notes =>
                                                notes.map(n =>
                                                    n.id === editingNote.id
                                                        ? {
                                                            ...n,
                                                            content: editedValue,
                                                            updatedAt: new Date()
                                                        }
                                                        : n
                                                )
                                            );
                                            setEditingNote(null);
                                        }
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (isEditing) {
                                            setEditingNote(note);
                                            setEditedValue(note.content);
                                        }
                                    }}
                                    disabled={!isEditing}
                                    style={styles.noteContent}
                                >
                                    <Text style={styles.noteText}>{note.content}</Text>
                                    <Text style={styles.noteDate}>
                                        {new Date(note.updatedAt).toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {isEditing && (
                                <TouchableOpacity
                                    onPress={() => deleteNote(note.id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={18} color="red" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {isEditing && (
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
                                style={[
                                    styles.addButton,
                                    !newNote && styles.disabledButton
                                ]}
                            >
                                <Ionicons name="add-circle" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {isEditing && (
                    <TouchableOpacity
                        style={styles.deletePersonButton}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text style={styles.deletePersonText}>Delete Person</Text>
                    </TouchableOpacity>
                )}

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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
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
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    nameInput: {
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 8,
    },
    propertyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 8,
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
    editPropertyContainer: {
        flex: 1,
    },
    editPropertyInput: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 4,
        padding: 4,
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
    addButton: {
        marginLeft: 8,
        padding: 8,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    noteContent: {
        flex: 1,
    },
    noteText: {
        fontSize: 16,
        marginBottom: 4,
    },
    noteDate: {
        fontSize: 12,
        color: '#666',
    },
    editNoteInput: {
        flex: 1,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 4,
        padding: 8,
        minHeight: 60,
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
    deletePersonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red',
        padding: 12,
        marginVertical: 20,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    deletePersonText: {
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

export default PersonDetailPanel;