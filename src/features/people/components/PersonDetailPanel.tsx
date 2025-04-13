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
import { useTheme } from '@/src/theme/ThemeManager';
import { Person, PersonNote, PersonProperty } from '@/src/features/people/models';
import { PersonManager } from "@/src/features/people/controllers/PersonManager";

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
    const { colors } = useTheme();
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

    const borderStyle = "border-surface";

    return (
        <View className={`absolute inset-0 bg-background z-50 ${isPresented ? 'flex' : 'hidden'}`}>
            <View className={`flex-row justify-between items-center px-4 py-3 border-b ${borderStyle}`}>
                <TouchableOpacity onPress={isEditing ? handleCancel : onDismiss}>
                    <Ionicons
                        name={isEditing ? 'close' : 'chevron-back'}
                        size={24}
                        color={colors.accent}
                    />
                </TouchableOpacity>

                <View className="flex-row items-center">
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                    ) : isEditing ? (
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={name.trim() === ''}
                        >
                            <Text
                                className={`text-accent text-base font-semibold ${name.trim() === '' ? 'opacity-50' : ''}`}
                            >
                                Save
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Text className="text-accent text-base font-semibold">Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {errorMessage && (
                <Text className="text-red-500 p-4 text-center">{errorMessage}</Text>
            )}

            <ScrollView className="flex-1">
                <View className={`p-4 border-b ${borderStyle}`}>
                    {isEditing ? (
                        <>
                            <Text className="text-sm text-secondary mb-1">Name</Text>
                            <TextInput
                                className="text-lg border border-unset rounded-lg p-2"
                                value={name}
                                onChangeText={setName}
                                placeholder="Person Name"
                                placeholderTextColor={colors.secondary}
                            />
                        </>
                    ) : (
                        <Text className="text-2xl font-bold text-primary">{name}</Text>
                    )}
                </View>

                {/* Properties Section */}
                <View className={`p-4 border-b ${borderStyle}`}>
                    <Text className="text-lg font-semibold text-primary mb-3">Properties</Text>

                    {properties.map(property => (
                        <View key={property.id} className="flex-row items-center mb-2 p-2 bg-surface rounded-lg">
                            {editingProperty?.id === property.id ? (
                                <View className="flex-1">
                                    <Text className="text-xs text-secondary">{property.key}</Text>
                                    <TextInput
                                        className="text-base border border-accent rounded p-1"
                                        value={editedValue}
                                        onChangeText={setEditedValue}
                                        onBlur={() => {
                                            if (editingProperty) {
                                                setProperties(props =>
                                                    props.map(p =>
                                                        p.id === editingProperty.id
                                                            ? {...p, value: editedValue}
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
                                    className="flex-1"
                                    onPress={() => {
                                        if (isEditing) {
                                            setEditingProperty(property);
                                            setEditedValue(property.value);
                                        }
                                    }}
                                    disabled={!isEditing}
                                >
                                    <Text className="text-xs text-secondary">{property.key}</Text>
                                    <Text className="text-base text-primary">{property.value}</Text>
                                </TouchableOpacity>
                            )}

                            {isEditing && (
                                <TouchableOpacity
                                    onPress={() => deleteProperty(property.id)}
                                    className="p-2"
                                >
                                    <Ionicons name="trash-outline" size={18} color="red" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {isEditing && (
                        <View className="flex-row items-center mt-3">
                            <View className="flex-1 flex-row">
                                <View className="flex-1 mr-2">
                                    <Text className="text-xs text-secondary mb-1">Key</Text>
                                    <TextInput
                                        className="border border-unset rounded-lg p-2"
                                        value={newPropertyKey}
                                        onChangeText={setNewPropertyKey}
                                        placeholder="Property Key"
                                        placeholderTextColor={colors.secondary}
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-xs text-secondary mb-1">Value</Text>
                                    <TextInput
                                        className="border border-unset rounded-lg p-2"
                                        value={newPropertyValue}
                                        onChangeText={setNewPropertyValue}
                                        placeholder="Property Value"
                                        placeholderTextColor={colors.secondary}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={addProperty}
                                disabled={!newPropertyKey || !newPropertyValue}
                                className={`ml-2 p-2 ${(!newPropertyKey || !newPropertyValue) ? 'opacity-50' : ''}`}
                            >
                                <Ionicons name="add-circle" size={24} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Notes Section */}
                <View className={`p-4 border-b ${borderStyle}`}>
                    <Text className="text-lg font-semibold text-primary mb-3">Notes</Text>

                    {notes.map(note => (
                        <View key={note.id} className="flex-row items-center mb-2 p-3 bg-surface rounded-lg">
                            {editingNote?.id === note.id ? (
                                <TextInput
                                    className="flex-1 text-base border border-accent rounded p-2 min-h-[60px]"
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
                                    className="flex-1"
                                >
                                    <Text className="text-base text-primary mb-1">{note.content}</Text>
                                    <Text className="text-xs text-secondary">
                                        {new Date(note.updatedAt).toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {isEditing && (
                                <TouchableOpacity
                                    onPress={() => deleteNote(note.id)}
                                    className="p-2"
                                >
                                    <Ionicons name="trash-outline" size={18} color="red" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {isEditing && (
                        <View className="flex-row items-center mt-3">
                            <TextInput
                                className="flex-1 border border-unset rounded-lg p-2 min-h-[60px]"
                                value={newNote}
                                onChangeText={setNewNote}
                                placeholder="Add a note..."
                                placeholderTextColor={colors.secondary}
                                multiline
                            />

                            <TouchableOpacity
                                onPress={addNote}
                                disabled={!newNote}
                                className={`ml-2 p-2 ${!newNote ? 'opacity-50' : ''}`}
                            >
                                <Ionicons name="add-circle" size={24} color={colors.accent} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {isEditing && (
                    <TouchableOpacity
                        className="flex-row items-center justify-center bg-red-500 p-3 mx-4 my-5 rounded-lg"
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text className="text-white text-base font-semibold ml-2">Delete Person</Text>
                    </TouchableOpacity>
                )}

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default PersonDetailPanel;