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
import { usePeople } from "@/src/hooks/usePeople";
import { usePersonNotes } from "@/src/hooks/usePersonNotes";
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
    const [pendingNotes, setPendingNotes] = useState<{ content: string; tempId: PersonNoteId; isNew?: boolean }[]>([]);
    const [modifiedNoteIds, setModifiedNoteIds] = useState<Set<PersonNoteId>>(new Set());
    const [deletedNoteIds, setDeletedNoteIds] = useState<Set<PersonNoteId>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // For adding new properties and notes
    const [newPropertyKey, setNewPropertyKey] = useState('');
    const [newPropertyValue, setNewPropertyValue] = useState('');
    const [newNote, setNewNote] = useState('');

    // For editing existing properties and notes
    // No separate editing state needed with direct editing

    const personManager = usePeople();
    const personNoteManager = usePersonNotes();

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
                // Save person data first, but don't auto-refresh until all note operations complete
                await personManager.updatePerson(existingPerson._id, personData, false);
                
                // Handle all note operations in parallel
                const noteOperations = [];
                
                // Delete notes that were marked for deletion
                for (const noteId of deletedNoteIds) {
                    noteOperations.push(personNoteManager.deletePersonNote(noteId));
                }
                
                // Update modified existing notes
                for (const note of notes) {
                    if (note._id && modifiedNoteIds.has(note._id)) {
                        noteOperations.push(personNoteManager.updatePersonNote(note._id, note.content));
                    }
                }
                
                // Create new notes
                for (const pendingNote of pendingNotes) {
                    noteOperations.push(personNoteManager.createPersonNote(existingPerson._id, pendingNote.content));
                }
                
                // Wait for all note operations to complete
                if (noteOperations.length > 0) {
                    await Promise.all(noteOperations);
                }
            } else {
                // For new person, create person first then create notes
                const newPerson = await personManager.createPerson({
                    ...personData,
                    notes: [],
                });
                
                // Create all pending notes for the new person in parallel
                if (pendingNotes.length > 0) {
                    const noteCreationPromises = pendingNotes.map(pendingNote =>
                        personNoteManager.createPersonNote(newPerson._id, pendingNote.content)
                    );
                    await Promise.all(noteCreationPromises);
                }
            }

            if (!isEditMode) {
                setName('');
                setProperties([]);
                setNotes([]);
                setPendingNotes([]);
                setModifiedNoteIds(new Set());
                setDeletedNoteIds(new Set());
                setNewPropertyKey('');
                setNewPropertyValue('');
                setNewNote('');
            }

            // Only call onPersonSaved after ALL operations (including notes) are complete
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

        // Create a temporary ID for the pending note
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const newPendingNote = {
            content: newNote,
            tempId: tempId as PersonNoteId,
            isNew: true
        };

        setPendingNotes([newPendingNote, ...pendingNotes]);
        setNewNote('');
    };

    const deleteProperty = (key: string) => {
        setProperties(properties.filter(prop => prop.key !== key));
    };

    const deleteNote = (id: PersonNoteId) => {
        // Check if it's an existing note or a pending note
        if (typeof id === 'string' && id.startsWith('temp_')) {
            // Remove from pending notes
            setPendingNotes(pendingNotes.filter(note => note.tempId !== id));
        } else {
            // Mark existing note for deletion and remove from display
            setDeletedNoteIds(prev => new Set(prev).add(id));
            setNotes(notes.filter(note => note._id !== id));
        }
    };

    const updatePropertyValue = (key: string, newValue: string) => {
        setProperties(properties.map(prop =>
            prop.key === key ? { ...prop, value: newValue } : prop
        ));
    };

    const updateNoteContent = (id: PersonNoteId, newContent: string) => {
        // Check if it's an existing note or a pending note
        if (typeof id === 'string' && id.startsWith('temp_')) {
            // Update pending note content
            setPendingNotes(pendingNotes.map(note =>
                note.tempId === id ? { ...note, content: newContent } : note
            ));
        } else {
            // Update existing note content and mark as modified
            setNotes(notes.map(note =>
                note._id === id ? { ...note, content: newContent } : note
            ));
            setModifiedNoteIds(prev => new Set(prev).add(id));
        }
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
        setPendingNotes([]);
        setModifiedNoteIds(new Set());
        setDeletedNoteIds(new Set());
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

                    {/* Display existing notes */}
                    {notes.filter(note => !deletedNoteIds.has(note._id!)).map(note => (
                        <View key={note._id} className="bg-surface border border-outline mb-2 p-2.5 rounded-lg">
                            <View className="flex-row items-center">
                                <View className="flex-1">
                                    <TextInput
                                        className="text-on-surface text-base mb-1"
                                        value={note.content}
                                        onChangeText={(newContent) => updateNoteContent(note._id!, newContent)}
                                        placeholder="Note content"
                                        placeholderTextColor={getColor("on-surface-variant")}
                                        multiline
                                    />
                                    <Text className="text-on-surface-variant text-xs">
                                        {new Date(note.updatedAt).toLocaleDateString()}
                                        {modifiedNoteIds.has(note._id!) && <Text className="text-primary"> • Modified</Text>}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteNote(note._id!)}
                                    className="p-2"
                                >
                                    <Ionicons name="trash-outline" size={18} color={getColor("on-error")} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {/* Display pending notes */}
                    {pendingNotes.map(note => (
                        <View key={note.tempId} className="bg-surface border border-outline mb-2 p-2.5 rounded-lg">
                            <View className="flex-row items-center">
                                <View className="flex-1">
                                    <TextInput
                                        className="text-on-surface text-base mb-1"
                                        value={note.content}
                                        onChangeText={(newContent) => updateNoteContent(note.tempId, newContent)}
                                        placeholder="Note content"
                                        placeholderTextColor={getColor("on-surface-variant")}
                                        multiline
                                    />
                                    <Text className="text-on-surface-variant text-xs">
                                        <Text className="text-primary">• New note (will be saved)</Text>
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteNote(note.tempId)}
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