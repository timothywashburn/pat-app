import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import BaseFormView from '@/src/components/common/BaseFormView';
import FormField from '@/src/components/common/FormField';
import { PersonManager } from "@/src/features/people/controllers/PersonManager";
import { Person, PersonNoteData, PersonNoteId, PersonProperty } from "@timothyw/pat-common";

interface PersonFormViewProps {
    isPresented: boolean;
    onDismiss: () => void;
    onCancel?: () => void;
    onPersonSaved?: () => void;
    existingPerson?: Person;
    isEditMode?: boolean;
}

const PersonFormView: React.FC<PersonFormViewProps> = ({
    isPresented,
    onDismiss,
    onCancel,
    onPersonSaved,
    existingPerson,
    isEditMode = false
}) => {
    const { getColor } = useTheme();

    const [name, setName] = useState(existingPerson?.name || '');
    const [properties, setProperties] = useState<PersonProperty[]>(existingPerson?.properties || []);
    const [notes, setNotes] = useState<PersonNoteData[]>(existingPerson?.notes || []);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // For adding new properties and notes
    const [newPropertyKey, setNewPropertyKey] = useState('');
    const [newPropertyValue, setNewPropertyValue] = useState('');
    const [newNote, setNewNote] = useState('');

    // For editing existing properties and notes
    // No separate editing state needed with direct editing

    const personManager = PersonManager.getInstance();

    if (!isPresented) {
        return null;
    }

    const handleSavePerson = async () => {
        if (!name.trim()) {
            setErrorMessage('Name is required');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const personData = {
                name: name.trim(),
                properties,
                notes,
            };

            if (isEditMode && existingPerson) {
                await personManager.updatePerson(existingPerson._id, personData);
            } else {
                await personManager.createPerson({
                    ...personData,
                    notes: notes.map(note => note._id),
                });
            }

            if (!isEditMode) {
                setName('');
                setProperties([]);
                setNotes([]);
                setNewPropertyKey('');
                setNewPropertyValue('');
                setNewNote('');
            }

            onPersonSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save person');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingPerson) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await personManager.deletePerson(existingPerson._id);
            onPersonSaved?.();
            onDismiss();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete person');
            setIsLoading(false);
        }
    };

    const addProperty = () => {
        if (!newPropertyKey || !newPropertyValue) return;

        const newProp: PersonProperty = {
            key: newPropertyKey,
            value: newPropertyValue,
        };

        setProperties([newProp, ...properties]); // Add to beginning of array
        setNewPropertyKey('');
        setNewPropertyValue('');
    };

    const addNote = () => {
        if (!newNote) return;

        const now = new Date();
        const newNoteItem: PersonNoteData = {
            id: Date.now().toString(),
            content: newNote,
            createdAt: now,
            updatedAt: now,
        };

        setNotes([newNoteItem, ...notes]);  // Add to beginning of array
        setNewNote('');
    };

    const deleteProperty = (key: string) => {
        setProperties(properties.filter(prop => prop.key !== key));
    };

    const deleteNote = (id: PersonNoteId) => {
        setNotes(notes.filter(note => note._id !== id));
    };

    const updatePropertyValue = (key: string, newValue: string) => {
        setProperties(properties.map(prop =>
            prop.key === key ? { ...prop, value: newValue } : prop
        ));
    };

    const updateNoteContent = (id: string, newContent: string) => {
        const now = new Date();
        setNotes(notes.map(note =>
            note._id === id ? { ...note, content: newContent, updatedAt: now } : note
        ));
    };

    const handleCancel = () => {
        if (isEditMode && existingPerson) {
            setName(existingPerson.name);
            setProperties(existingPerson.properties || []);
            setNotes(existingPerson.notes || []);
        } else {
            setName('');
            setProperties([]);
            setNotes([]);
        }
        setNewPropertyKey('');
        setNewPropertyValue('');
        setNewNote('');
        setErrorMessage(null);
        
        // Use onCancel if provided (for edit mode navigation back to detail view)
        // Otherwise use onDismiss (for create mode navigation back to list)
        if (onCancel) {
            onCancel();
        } else {
            onDismiss();
        }
    };

    return (
        <BaseFormView
            isPresented={isPresented}
            onDismiss={handleCancel}
            title={isEditMode ? 'Edit Person' : 'New Person'}
            isEditMode={isEditMode}
            saveText={isEditMode ? 'Save' : 'Add'}
            onSave={handleSavePerson}
            isSaveDisabled={!name.trim()}
            isLoading={isLoading}
            errorMessage={errorMessage}
            existingItem={existingPerson}
            onDelete={handleDelete}
            deleteButtonText="Delete Person"
            deleteConfirmTitle="Delete Person"
            deleteConfirmMessage="Are you sure you want to delete this person? This action cannot be undone."
        >
                <FormField
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Person Name"
                    required
                />

                {/* Properties Section */}
                <View className="mb-5">
                    <Text className="text-on-background text-base font-medium mb-2">Properties</Text>

                    <View className="flex-row items-center mb-3">
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
                            className={`ml-2 self-end mb-1 ${(!newPropertyKey || !newPropertyValue) ? 'opacity-40' : ''}`}
                        >
                            <Ionicons
                                name="add-circle"
                                size={24}
                                color={getColor("primary")}
                            />
                        </TouchableOpacity>
                    </View>

                    {properties.map(property => (
                        <View key={property.key} className="bg-surface border border-outline mb-2 p-2.5 rounded-lg">
                            <View className="flex-row items-center">
                                <View className="flex-1">
                                    <Text className="text-on-surface-variant text-xs">{property.key}</Text>
                                    <TextInput
                                        className="text-on-surface text-base"
                                        value={property.value}
                                        onChangeText={(newValue) => updatePropertyValue(property.key, newValue)}
                                        placeholder="Property Value"
                                        placeholderTextColor={getColor("on-surface-variant")}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteProperty(property.key)}
                                    className="p-2"
                                >
                                    <Ionicons name="trash-outline" size={18} color={getColor("on-error")} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                </View>

                {/* Notes Section */}
                <View className="mb-5">
                    <Text className="text-on-background text-base font-medium mb-2">Notes</Text>

                    <View className="flex-row items-center mb-3">
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
                            className={`ml-2 p-1 ${(!newNote) ? 'opacity-40' : ''}`}
                        >
                            <Ionicons
                                name="add-circle"
                                size={24}
                                color={getColor("primary")}
                            />
                        </TouchableOpacity>
                    </View>

                    {notes.map(note => (
                        <View key={note._id} className="bg-surface border border-outline mb-2 p-2.5 rounded-lg">
                            <View className="flex-row items-center">
                                <View className="flex-1">
                                    <TextInput
                                        className="text-on-surface text-base mb-1"
                                        value={note.content}
                                        onChangeText={(newContent) => updateNoteContent(note._id, newContent)}
                                        placeholder="Note content"
                                        placeholderTextColor={getColor("on-surface-variant")}
                                        multiline
                                    />
                                    <Text className="text-on-surface-variant text-xs">
                                        {new Date(note.updatedAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteNote(note._id)}
                                    className="p-2"
                                >
                                    <Ionicons name="trash-outline" size={18} color={getColor("on-error")} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

        </BaseFormView>
    );
};

export default PersonFormView;