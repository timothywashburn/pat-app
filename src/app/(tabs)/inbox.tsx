import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeManager';
import ThoughtView from '@/src/features/inbox/components/ThoughtView';
import ThoughtManager, { Thought } from '@/src/features/inbox/controllers/ThoughtManager';
import CustomHeader from '@/src/components/CustomHeader';
import AgendaItemFormView from '@/src/features/agenda/components/AgendaItemFormView';

export default function InboxPanel() {
    const { getColor } = useTheme();
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [newThought, setNewThought] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
    const [editingThought, setEditingThought] = useState<Thought | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [showingCreateAgendaForm, setShowingCreateAgendaForm] = useState(false);

    const thoughtManager = ThoughtManager.getInstance();

    useEffect(() => {
        loadThoughts();
    }, []);

    const loadThoughts = async () => {
        if (isRefreshing) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await thoughtManager.loadThoughts();
            setThoughts(thoughtManager.thoughts);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to load thoughts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await thoughtManager.loadThoughts();
            setThoughts(thoughtManager.thoughts);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to refresh thoughts');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddThought = async () => {
        if (newThought.trim() === '') return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await thoughtManager.createThought(newThought);
            setThoughts(thoughtManager.thoughts);
            setNewThought('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create thought');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditThought = async () => {
        if (!editingThought || editedContent.trim() === editingThought.content) {
            setEditingThought(null);
            return;
        }

        try {
            await thoughtManager.updateThought(editingThought.id, editedContent);
            setThoughts(thoughtManager.thoughts);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update thought');
        } finally {
            setEditingThought(null);
        }
    };

    const handleDeleteThought = async (id: string) => {
        try {
            await thoughtManager.deleteThought(id);
            setThoughts(thoughtManager.thoughts);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete thought');
        }
    };

    const showTasksWIPAlert = () => {
        Alert.alert(
            'In Development',
            'This feature has not been implemented yet.',
            [{ text: 'OK' }]
        );
    };

    const handleAgendaFormDismiss = () => {
        setShowingCreateAgendaForm(false);
        setSelectedThought(null);
    };

    const handleItemCreated = () => {
        if (selectedThought) {
            handleDeleteThought(selectedThought.id);
            setSelectedThought(null);
        }
    };

    const handleShowActionSheet = (thought: Thought) => {
        setSelectedThought(thought);
        Alert.alert(
            'Choose Action',
            'What would you like to do with this thought?',
            [
                {
                    text: 'Move to Agenda',
                    onPress: () => {
                        setShowingCreateAgendaForm(true);
                    }
                },
                {
                    text: 'Move to Tasks (WIP)',
                    onPress: showTasksWIPAlert
                },
                {
                    text: 'Edit',
                    onPress: () => {
                        setEditingThought(thought);
                        setEditedContent(thought.content);
                    }
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Delete Thought',
                            'Are you sure you want to delete this thought?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => handleDeleteThought(thought.id)
                                }
                            ]
                        );
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                title="Inbox"
                showAddButton={true}
                onAddTapped={() => setShowingCreateAgendaForm(true)}
            />

            <View className="flex-row p-4 py-2 items-center">
                <TextInput
                    className="bg-surface flex-1 border border-unset rounded-lg p-2.5 mr-2"
                    placeholder="Add a thought..."
                    placeholderTextColor={getColor("on-surface-variant")}
                    value={newThought}
                    onChangeText={setNewThought}
                    onSubmitEditing={handleAddThought}
                />
                <TouchableOpacity
                    className={`bg-primary rounded-lg p-2.5 items-center justify-center ${newThought.trim() === '' ? 'opacity-50' : ''}`}
                    onPress={handleAddThought}
                    disabled={newThought.trim() === '' || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={getColor("on-primary")} />
                    ) : (
                        <Text className="text-on-primary font-bold">Add</Text>
                    )}
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <Text className="text-unknown p-4 text-center">{errorMessage}</Text>
            )}

            {isLoading && thoughts.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={getColor("primary")} />
                </View>
            ) : thoughts.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-on-background-variant text-base">No thoughts added yet</Text>
                </View>
            ) : (
                <FlatList
                    data={thoughts}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleShowActionSheet(item)}>
                            <ThoughtView
                                thought={item}
                                isEditing={editingThought?.id === item.id}
                                editedContent={editedContent}
                                onChangeEditContent={setEditedContent}
                                onCommitEdit={handleEditThought}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[getColor("primary")]}
                            tintColor={getColor("primary")}
                        />
                    }
                />
            )}

            <AgendaItemFormView
                visible={showingCreateAgendaForm}
                onDismiss={handleAgendaFormDismiss}
                onItemSaved={handleItemCreated}
                initialName={selectedThought?.content || ''}
                isEditMode={false}
            />
        </SafeAreaView>
    );
}