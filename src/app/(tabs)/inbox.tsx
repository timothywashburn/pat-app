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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/src/context/ThemeContext';
import ThoughtView from '@/src/features/inbox/components/ThoughtView';
import { useThoughtsStore } from '@/src/stores/useThoughtsStore';
import CustomHeader from '@/src/components/CustomHeader';
import { useListsStore } from '@/src/stores/useListsStore';
import { useToast } from "@/src/components/toast/ToastContext";
import { ModuleType, ThoughtData, NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { NotificationConfigView } from '@/src/features/notifications/components/NotificationConfigView';
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { InboxStackParamList } from '@/src/navigation/InboxStack';

type InboxNavigationProp = StackNavigationProp<InboxStackParamList, 'InboxList'>;

export const InboxPanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const navigation = useNavigation<InboxNavigationProp>();
    const { thoughts, isInitialized, loadThoughts, createThought, updateThought, deleteThought } = useThoughtsStore();
    const { refreshControl } = useRefreshControl(loadThoughts, 'Failed to refresh thoughts');

    useEffect(() => {
        if (!isInitialized) {
            loadThoughts();
        }
    }, [isInitialized, loadThoughts]);
    const [newThought, setNewThought] = useState('');
    const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
    const [editingThought, setEditingThought] = useState<ThoughtData | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [showingNotificationConfig, setShowingNotificationConfig] = useState(false);

    const { getListsWithItems } = useListsStore();
    const listsWithItems = getListsWithItems();

    const handleAddThought = async () => {
        if (newThought.trim() === '') return;

        try {
            await createThought(newThought);
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
            await updateThought(editingThought._id, {
                content: editedContent,
            });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to update thought';
            errorToast(errorMsg);
        } finally {
            setEditingThought(null);
        }
    };

    const handleDeleteThought = async (id: string) => {
        try {
            await deleteThought(id);
            setExpandedThoughtId(null);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to delete thought';
            errorToast(errorMsg);
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
        }
    };

    const handleMoveToAgenda = (thought: ThoughtData) => {
        navigation.navigate('AgendaItemForm', {
            initialName: thought.content
        });
        setExpandedThoughtId(null);
        // TODO: I think this is probably wrong now, it probably needs to be called from the callback of successful creation
        handleDeleteThought(thought._id);
    };

    const handleMoveToLists = (thought: ThoughtData) => {
        if (listsWithItems.length === 0) {
            errorToast('No lists available. Create a list first in the Lists tab.');
            setExpandedThoughtId(null);
            return;
        }

        navigation.navigate('ListItemForm', {
            initialName: thought.content
        });
        setExpandedThoughtId(null);
        // TODO: I think this is probably wrong now, it probably needs to be called from the callback of successful creation
        handleDeleteThought(thought._id);
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
                showAddButton={false}
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
                    disabled={newThought.trim() === '' || !isInitialized}
                >
                    {!isInitialized ? (
                        <ActivityIndicator size="small" color={getColor("on-primary")} />
                    ) : (
                        <Text className="text-on-primary font-bold">Add</Text>
                    )}
                </TouchableOpacity>
            </View>

            {!isInitialized && thoughts.length === 0 ? (
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
                                onMoveToLists={() => handleMoveToLists(item)}
                                onEdit={() => handleStartEdit(item)}
                                onDelete={() => handleConfirmDelete(item)}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item._id}
                    contentContainerClassName="px-4 pt-3"
                    refreshControl={refreshControl}
                />
            )}

            {showingNotificationConfig && (
                <NotificationConfigView
                    targetEntityType={NotificationEntityType.INBOX_PANEL}
                    targetId="inbox_panel"
                    targetLevel={NotificationTemplateLevel.PARENT}
                    entityName="Inbox"
                    onClose={() => setShowingNotificationConfig(false)}
                />
            )}
        </>
    );
}

export default InboxPanel;