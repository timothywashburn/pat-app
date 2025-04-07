import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ThoughtView from '@/src/features/inbox/components/ThoughtView';
import ThoughtManager, { Thought } from '@/src/features/inbox/controllers/ThoughtManager';
import CustomHeader from '@/src/components/CustomHeader';
import CreateAgendaItemView from '@/src/features/agenda/components/CreateAgendaItemView';

export default function InboxPanel() {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [newThought, setNewThought] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
    const [editingThought, setEditingThought] = useState<Thought | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [showingCreateAgendaSheet, setShowingCreateAgendaSheet] = useState(false);

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

    const handleShowActionSheet = (thought: Thought) => {
        setSelectedThought(thought);
        Alert.alert(
            'Choose Action',
            'What would you like to do with this thought?',
            [
                {
                    text: 'Move to Agenda',
                    onPress: () => {
                        setShowingCreateAgendaSheet(true);
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
        <SafeAreaView style={styles.container}>
            <CustomHeader
                title="Inbox"
                showAddButton={true}
                onAddTapped={() => setShowingCreateAgendaSheet(true)}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a thought..."
                    value={newThought}
                    onChangeText={setNewThought}
                    onSubmitEditing={handleAddThought}
                />
                <TouchableOpacity
                    style={[styles.addButton, newThought.trim() === '' && styles.disabledButton]}
                    onPress={handleAddThought}
                    disabled={newThought.trim() === '' || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.addButtonText}>Add</Text>
                    )}
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {isLoading && thoughts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : thoughts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No thoughts added yet</Text>
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
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                />
            )}

            {showingCreateAgendaSheet && (
                <CreateAgendaItemView
                    visible={showingCreateAgendaSheet}
                    onDismiss={() => setShowingCreateAgendaSheet(false)}
                    onItemCreated={() => {
                        // If this was created from a thought, delete the thought
                        if (selectedThought) {
                            handleDeleteThought(selectedThought.id);
                            setSelectedThought(null);
                        }
                    }}
                    initialName={selectedThought?.content || ''}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 8,
        paddingBottom: 8,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginRight: 8,
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorText: {
        color: 'red',
        padding: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
    listContent: {
        padding: 16,
    },
});