import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeManager';
import { PersonNote, PersonProperty } from '@/src/features/people/models';
import { PersonManager } from "@/src/features/people/controllers/PersonManager";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
    const { getColor } = useTheme();
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
            <SafeAreaProvider>
                <SafeAreaView className="bg-background flex-1" edges={['top', 'right', 'left']}>
                    <View className="flex-row justify-between items-center px-4 py-4 border-b border-unset">
                        <TouchableOpacity onPress={onDismiss}>
                            <Text className="text-accent text-base">Cancel</Text>
                        </TouchableOpacity>

                        <Text className="text-lg font-bold text-primary">New Person</Text>

                        <TouchableOpacity
                            onPress={handleCreatePerson}
                            disabled={!name.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={getColor("primary")} />
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

                    <ScrollView className="flex-1">
                        <View className="p-4 border-b border-unset">
                            <Text className="text-sm text-secondary mb-1">Name</Text>
                            <TextInput
                                className="text-base border border-unset rounded-lg p-2.5"
                                value={name}
                                onChangeText={setName}
                                placeholder="Person Name"
                                placeholderTextColor={getColor("unknown")}
                            />
                        </View>

                        {/* Properties Section */}
                        <View className="p-4 border-b border-unset">
                            <Text className="text-lg font-semibold text-primary mb-3">Properties</Text>

                            {properties.map(property => (
                                <View key={property.id} className="flex-row items-center mb-2 p-2.5 bg-background rounded-lg">
                                    <View className="flex-1">
                                        <Text className="text-xs text-secondary">{property.key}</Text>
                                        <Text className="text-base text-primary">{property.value}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => deleteProperty(property.id)}
                                        className="p-2"
                                    >
                                        <Ionicons name="trash-outline" size={18} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <View className="flex-row items-center mt-3">
                                <View className="flex-1 flex-row">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-xs text-secondary mb-1">Key</Text>
                                        <TextInput
                                            className="border border-unset rounded-lg p-2"
                                            value={newPropertyKey}
                                            onChangeText={setNewPropertyKey}
                                            placeholder="Property Key"
                                            placeholderTextColor={getColor("unknown")}
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-xs text-secondary mb-1">Value</Text>
                                        <TextInput
                                            className="border border-unset rounded-lg p-2"
                                            value={newPropertyValue}
                                            onChangeText={setNewPropertyValue}
                                            placeholder="Property Value"
                                            placeholderTextColor={getColor("unknown")}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={addProperty}
                                    disabled={!newPropertyKey || !newPropertyValue}
                                    className="ml-2 p-1"
                                >
                                    {/*TODO: hex code*/}
                                    <Ionicons
                                        name="add-circle"
                                        size={24}
                                        color={(!newPropertyKey || !newPropertyValue) ? "#CCCCCC" : getColor("primary")}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Notes Section */}
                        <View className="p-4 border-b border-unset">
                            <Text className="text-lg font-semibold text-primary mb-3">Notes</Text>

                            {notes.map(note => (
                                <View key={note.id} className="flex-row items-center mb-2 p-2.5 bg-background rounded-lg">
                                    <View className="flex-1">
                                        <Text className="text-base text-primary">{note.content}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => deleteNote(note.id)}
                                        className="p-2"
                                    >
                                        <Ionicons name="trash-outline" size={18} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <View className="flex-row items-center mt-3">
                                <TextInput
                                    className="flex-1 border border-unset rounded-lg p-2 min-h-[60px]"
                                    value={newNote}
                                    onChangeText={setNewNote}
                                    placeholder="Add a note..."
                                    placeholderTextColor={getColor("unknown")}
                                    multiline
                                />

                                <TouchableOpacity
                                    onPress={addNote}
                                    disabled={!newNote}
                                    className="ml-2 p-1"
                                >
                                    {/*TODO: hex code*/}
                                    <Ionicons
                                        name="add-circle"
                                        size={24}
                                        color={!newNote ? "#CCCCCC" : getColor("primary")}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    );
};

export default CreatePersonView;