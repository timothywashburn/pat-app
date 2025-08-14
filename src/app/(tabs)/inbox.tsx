import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList, LayoutAnimation,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/src/controllers/ThemeManager';
import ThoughtView from '@/src/features/inbox/components/ThoughtView';
import { useThoughts, useInboxNotifications } from '@/src/hooks/useThoughts';
import CustomHeader from '@/src/components/CustomHeader';
import AgendaItemFormView from '@/src/features/agenda/components/AgendaItemFormView';
import TaskFormView from '@/src/features/tasks/components/TaskFormView';
import { useTasks } from '@/src/hooks/useTasks';
import { TaskListWithTasks } from '@/src/features/tasks/models';
import { useToast } from "@/src/components/toast/ToastContext";
import { ModuleType, ThoughtData } from "@timothyw/pat-common";
import { NotificationConfigView } from '@/src/features/notifications/components/NotificationConfigView';

export const InboxPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const thoughtsHook = useThoughts();
    const { thoughts, isLoading, error } = thoughtsHook;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [newThought, setNewThought] = useState('');
    const [selectedThought, setSelectedThought] = useState<ThoughtData | null>(null);
    const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
    const [editingThought, setEditingThought] = useState<ThoughtData | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [showingCreateAgendaForm, setShowingCreateAgendaForm] = useState(false);
    const [showingCreateTaskForm, setShowingCreateTaskForm] = useState(false);
    const [taskLists, setTaskLists] = useState<TaskListWithTasks[]>([]);
    const [showingNotificationConfig, setShowingNotificationConfig] = useState(false);

    const inboxNotifications = useInboxNotifications(thoughts);
    const tasksHook = useTasks();

    useEffect(() => {
        loadThoughts();
        loadTaskLists();
    }, []);

    // Refresh task lists when tab is focused (e.g., after creating task list in tasks tab)
    useFocusEffect(
        React.useCallback(() => {
            loadTaskLists();
        }, [])
    );

    const loadThoughts = async () => {
        if (isRefreshing) return;

        try {
            await thoughtsHook.loadThoughts();
            
            // Register inbox notifications when thoughts are loaded
            await inboxNotifications.registerInboxNotifications();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to load thoughts';
            errorToast(errorMsg);
        }
    };

    const loadTaskLists = async () => {
        try {
            await tasksHook.loadTaskLists();
            setTaskLists(tasksHook.taskListsWithTasks);
        } catch (error) {
            console.error('Failed to load task lists:', error);
            // Don't show error toast here since this is background loading
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await thoughtsHook.loadThoughts();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to refresh thoughts';
            errorToast(errorMsg);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddThought = async () => {
        if (newThought.trim() === '') return;

        try {
            await thoughtsHook.createThought(newThought);
            setNewThought('');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to create thought';
            errorToast(errorMsg);
        }
    };

    const handleEditThought = async () => {
        if (!editingThought || editedContent.trim() === editingThought.content) {
            setEditingThought(null);
            return;
        }

        try {
            await thoughtsHook.updateThought(editingThought._id, editedContent);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to update thought';
            errorToast(errorMsg);
        } finally {
            setEditingThought(null);
            // Keep the expandedThoughtId as is (don't collapse the menu after saving)
        }
    };

    const handleDeleteThought = async (id: string) => {
        try {
            await thoughtsHook.deleteThought(id);
            setExpandedThoughtId(null);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to delete thought';
            errorToast(errorMsg);
        }
    };


    const handleAgendaFormDismiss = () => {
        setShowingCreateAgendaForm(false);
        setSelectedThought(null);
    };

    const handleTaskFormDismiss = () => {
        setShowingCreateTaskForm(false);
        setSelectedThought(null);
    };

    const handleItemCreated = () => {
        if (selectedThought) {
            handleDeleteThought(selectedThought._id);
            setSelectedThought(null);
        }
    };

    const handleTaskCreated = async () => {
        if (selectedThought) {
            // Reload task lists to get fresh data (this will update any TaskManager instance)
            await loadTaskLists();
            handleDeleteThought(selectedThought._id);
            setSelectedThought(null);
        }
    };

    const toggleThoughtExpansion = (thought: ThoughtData) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // If there's an active edit, cancel it when clicking on a different thought
        if (editingThought && editingThought._id !== thought._id) {
            setEditingThought(null);
        }

        if (expandedThoughtId === thought._id) {
            setExpandedThoughtId(null);
        } else {
            setExpandedThoughtId(thought._id);
            setSelectedThought(thought);
        }
    };

    const handleMoveToAgenda = (thought: ThoughtData) => {
        setSelectedThought(thought);
        setShowingCreateAgendaForm(true);
        setExpandedThoughtId(null);
    };

    const handleMoveToTasks = (thought: ThoughtData) => {
        if (taskLists.length === 0) {
            errorToast('No task lists available. Create a task list first in the Tasks tab.');
            setExpandedThoughtId(null);
            return;
        }
        
        setSelectedThought(thought);
        setShowingCreateTaskForm(true);
        setExpandedThoughtId(null);
    };

    const handleStartEdit = (thought: ThoughtData) => {
        setEditingThought(thought);
        setEditedContent(thought.content);
        // Keep the menu expanded when editing starts
        setExpandedThoughtId(thought._id);
    };

    const handleConfirmDelete = (thought: ThoughtData) => {
        // If in edit mode, treat delete action as cancel edit
        if (editingThought && editingThought._id === thought._id) {
            setEditingThought(null);
        } else {
            handleDeleteThought(thought._id);
        }
    };

    return (
        <>
            <CustomHeader
                moduleType={ModuleType.INBOX}
                title="Inbox"
                showAddButton={true}
                onAddTapped={() => setShowingCreateAgendaForm(true)}
                showNotificationsButton={true}
                onNotificationsTapped={() => setShowingNotificationConfig(true)}
            />

            <View className="flex-row p-4 py-2 items-center">
                <TextInput
                    className="bg-surface text-on-surface flex-1 border border-outline rounded-lg p-2.5 mr-2"
                    placeholder="Add a thought..."
                    placeholderTextColor={getColor("on-surface-variant")}
                    value={newThought}
                    onChangeText={setNewThought}
                    onSubmitEditing={handleAddThought}
                />
                <TouchableOpacity
                    className={`bg-primary rounded-lg p-2.5 items-center justify-center ${newThought.trim() === '' ? 'opacity-40' : ''}`}
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
                        <TouchableOpacity
                            onPress={() => {
                                if (!editingThought || editingThought._id !== item._id) {
                                    toggleThoughtExpansion(item);
                                }
                            }}
                            activeOpacity={0.8}
                        >
                            <ThoughtView
                                thought={item}
                                isEditing={editingThought?._id === item._id}
                                isExpanded={expandedThoughtId === item._id}
                                editedContent={editedContent}
                                onChangeEditContent={setEditedContent}
                                onCommitEdit={handleEditThought}
                                onMoveToAgenda={() => handleMoveToAgenda(item)}
                                onMoveToTasks={() => handleMoveToTasks(item)}
                                onEdit={() => handleStartEdit(item)}
                                onDelete={() => handleConfirmDelete(item)}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item._id}
                    contentContainerClassName="px-4 pt-3"
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
                isPresented={showingCreateAgendaForm}
                onDismiss={handleAgendaFormDismiss}
                onItemSaved={handleItemCreated}
                initialName={selectedThought?.content || ''}
                isEditMode={false}
            />

            {showingCreateTaskForm && (
                <TaskFormView
                    isPresented={showingCreateTaskForm}
                    onDismiss={handleTaskFormDismiss}
                    onTaskSaved={handleTaskCreated}
                    taskLists={taskLists}
                    initialName={selectedThought?.content || ''}
                    isEditMode={false}
                />
            )}

            {showingNotificationConfig && (
                <NotificationConfigView
                    entityType="inbox"
                    entityName="Inbox"
                    onClose={() => setShowingNotificationConfig(false)}
                />
            )}
        </>
    );
}

export default InboxPanel;