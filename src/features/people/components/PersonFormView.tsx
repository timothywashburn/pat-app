import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeManager';
import { Person, PersonNote, PersonProperty } from '@/src/features/people/models';
import { PersonManager } from "@/src/features/people/controllers/PersonManager";

interface PersonFormViewProps {
    visible: boolean;
    onDismiss: () => void;
    onPersonSaved?: () => void;
    existingPerson?: Person;
    isEditMode?: boolean;
}

const PersonFormView: React.FC<PersonFormViewProps> = ({
    visible,
    onDismiss,
    onPersonSaved,
    existingPerson,
    isEditMode = false
}) => {
    const { getColor } = useTheme();

    const [name, setName] = useState(existingPerson?.name || '');
    const [properties, setProperties] = useState<PersonProperty[]>(existingPerson?.properties || []);
    const [notes, setNotes] = useState<PersonNote[]>(existingPerson?.notes || []);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // For adding new properties and notes
    const [newPropertyKey, setNewPropertyKey] = useState('');
    const [newPropertyValue, setNewPropertyValue] = useState('');
    const [newNote, setNewNote] = useState('');

    const personManager = PersonManager.getInstance();

    const handleSavePerson = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            if (isEditMode && existingPerson) {
                await personManager.updatePerson(existingPerson.id, name, properties, notes);
            } else {
                await personManager.createPerson(name, properties, notes);
            }

            if (!isEditMode) {
                setName('');
                setProperties([]);
                setNotes([]);
            }

            onPersonSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save person');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (!existingPerson) return;

        Alert.alert(
            'Delete Person',
            'Are you sure you want to delete this person? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        setErrorMessage(null);

                        try {
                            await personManager.deletePerson(existingPerson.id);
                            onPersonSaved?.();
                            onDismiss();
                        } catch (error) {
                            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete person');
                            setIsLoading(false);
                        }
                    }
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
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <SafeAreaProvider>
                <SafeAreaView className="bg-background flex-1" edges={['top', 'right', 'left']}>
                    <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
                        <TouchableOpacity onPress={onDismiss}>
                            <Text className="text-error text-base">Cancel</Text>
                        </TouchableOpacity>

                        <Text className="text-on-surface text-lg font-bold">
                            {isEditMode ? 'Edit Person' : 'New Person'}
                        </Text>

                        <TouchableOpacity
                            onPress={handleSavePerson}
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

                    <ScrollView className="flex-1 p-4">
                        <View className="mb-5">
                            <Text className="text-on-background text-base font-medium mb-2">Name</Text>
                            <TextInput
                                className="bg-surface text-on-surface border border-outline rounded-lg p-3"
                                value={name}
                                onChangeText={setName}
                                placeholder="Person Name"
                                placeholderTextColor={getColor("on-surface-variant")}
                            />
                        </View>

                        {/* Properties Section */}
                        <View className="mb-5">
                            <Text className="text-on-background text-base font-medium mb-2">Properties</Text>

                            {properties.map(property => (
                                <View key={property.id} className="bg-surface border border-outline flex-row items-center mb-2 p-2.5 rounded-lg">
                                    <View className="flex-1">
                                        <Text className="text-on-surface-variant text-xs">{property.key}</Text>
                                        <Text className="text-on-surface text-base">{property.value}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => deleteProperty(property.id)}
                                        className="p-2"
                                    >
                                        <Ionicons name="trash-outline" size={18} color={getColor("error")} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <View className="flex-row items-center mt-3">
                                <View className="flex-1 flex-row">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-on-background text-xs mb-1">Key</Text>
                                        <TextInput
                                            className="bg-surface text-on-surface border border-outline rounded-lg p-2"
                                            value={newPropertyKey}
                                            onChangeText={setNewPropertyKey}
                                            placeholder="Property Key"
                                            placeholderTextColor={getColor("on-surface-variant")}
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-on-background text-xs mb-1">Value</Text>
                                        <TextInput
                                            className="bg-surface text-on-surface border border-outline rounded-lg p-2"
                                            value={newPropertyValue}
                                            onChangeText={setNewPropertyValue}
                                            placeholder="Property Value"
                                            placeholderTextColor={getColor("on-surface-variant")}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={addProperty}
                                    disabled={!newPropertyKey || !newPropertyValue}
                                    className="ml-2 self-end mb-1"
                                >
                                    <Ionicons
                                        name="add-circle"
                                        size={24}
                                        color={(!newPropertyKey || !newPropertyValue) ? getColor("unknown") : getColor("primary")}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Notes Section */}
                        <View className="mb-5">
                            <Text className="text-on-background text-base font-medium mb-2">Notes</Text>

                            {notes.map(note => (
                                <View key={note.id} className="bg-surface border border-outline flex-row items-center mb-2 p-2.5 rounded-lg">
                                    <View className="flex-1">
                                        <Text className="text-on-surface text-base mb-1">{note.content}</Text>
                                        <Text className="text-on-surface-variant text-xs">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => deleteNote(note.id)}
                                        className="p-2"
                                    >
                                        <Ionicons name="trash-outline" size={18} color={getColor("error")} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <View className="flex-row items-center mt-3">
                                <TextInput
                                    className="bg-surface text-on-surface flex-1 border border-outline rounded-lg p-2 min-h-[60px]"
                                    value={newNote}
                                    onChangeText={setNewNote}
                                    placeholder="Add a note..."
                                    placeholderTextColor={getColor("on-surface-variant")}
                                    multiline
                                />

                                <TouchableOpacity
                                    onPress={addNote}
                                    disabled={!newNote}
                                    className="ml-2 p-1"
                                >
                                    <Ionicons
                                        name="add-circle"
                                        size={24}
                                        color={!newNote ? getColor("unknown") : getColor("primary")}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Delete button for edit mode */}
                        {isEditMode && existingPerson && (
                            <View className="mt-5 gap-2.5">
                                <TouchableOpacity
                                    className="bg-error flex-row items-center justify-center rounded-lg p-3"
                                    onPress={handleDelete}
                                >
                                    <Ionicons name="trash-outline" size={20} color={getColor("on-error")} />
                                    <Text className="text-on-error text-base font-semibold ml-2">Delete Person</Text>
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

export default PersonFormView;