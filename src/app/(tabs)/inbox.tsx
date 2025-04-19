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
import { useToast } from "@/src/components/toast/ToastContext";

export default function InboxPanel() {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [newThought, setNewThought] = useState('');
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

        try {
            await thoughtManager.loadThoughts();
            setThoughts(thoughtManager.thoughts);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to load thoughts';
            errorToast(errorMsg);
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
            const errorMsg = error instanceof Error ? error.message : 'Failed to refresh thoughts';
            errorToast(errorMsg);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddThought = async () => {
        if (newThought.trim() === '') return;

        setIsLoading(true);

        try {
            await thoughtManager.createThought(newThought);
            setThoughts(thoughtManager.thoughts);
            setNewThought('');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to create thought';
            errorToast(errorMsg);
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
            const errorMsg = error instanceof Error ? error.message : 'Failed to update thought';
            errorToast(errorMsg);
        } finally {
            setEditingThought(null);
        }
    };

    const handleDeleteThought = async (id: string) => {
        try {
            await thoughtManager.deleteThought(id);
            setThoughts(thoughtManager.thoughts);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to delete thought';
            errorToast(errorMsg);
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
                    className="bg-surface flex-1 border border-outline rounded-lg p-2.5 mr-2"
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