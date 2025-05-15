import React from 'react';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Thought } from '../controllers/ThoughtManager';
import { Ionicons } from '@expo/vector-icons';

interface ThoughtViewProps {
    thought: Thought;
    isEditing: boolean;
    isExpanded: boolean;
    editedContent: string;
    onChangeEditContent: (content: string) => void;
    onCommitEdit: () => void;
    onMoveToAgenda: () => void;
    onMoveToTasks: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ThoughtView: React.FC<ThoughtViewProps> = ({
    thought,
    isEditing,
    isExpanded,
    editedContent,
    onChangeEditContent,
    onCommitEdit,
    onMoveToAgenda,
    onMoveToTasks,
    onEdit,
    onDelete
}) => {
    const { getColor } = useTheme();

    return (
        <View
            className={`w-full bg-surface rounded-lg mb-3 overflow-hidden ${isEditing ? 'border-2 border-primary' : ''}`}
            style={isEditing ? { borderColor: getColor("primary") } : {}}
        >
            <View className="p-4">
                {isEditing ? (
                    <TextInput
                        className="text-base text-on-surface"
                        value={editedContent}
                        onChangeText={onChangeEditContent}
                        autoFocus
                        multiline
                        style={{ padding: 0 }}
                    />
                ) : (
                    <Text className="text-on-surface text-base">{thought.content}</Text>
                )}
            </View>

            {isExpanded && (
                <View className="border-t border-outline-variant bg-surface-container">
                    <View className="flex-row flex-wrap">
                        <TouchableOpacity
                            className={`flex-1 py-3 flex-row items-center justify-center ${isEditing ? 'opacity-40' : ''}`}
                            onPress={onMoveToAgenda}
                            disabled={isEditing}
                        >
                            <Text className="text-primary mr-2 font-medium">To Agenda</Text>
                            <Ionicons name="calendar-outline" size={16} color={getColor("primary")} />
                        </TouchableOpacity>

                        <View className="w-px h-full bg-outline-variant" />

                        <TouchableOpacity
                            className={`flex-1 py-3 flex-row items-center justify-center ${isEditing ? 'opacity-40' : ''}`}
                            onPress={onMoveToTasks}
                            disabled={isEditing}
                        >
                            <Text className="text-primary mr-2 font-medium">To Tasks</Text>
                            <Ionicons name="checkbox-outline" size={16} color={getColor("primary")} />
                        </TouchableOpacity>
                    </View>

                    <View className="h-px w-full bg-outline-variant" />

                    <View className="flex-row flex-wrap">
                        {isEditing ? (
                            <TouchableOpacity
                                className="flex-1 py-3 flex-row items-center justify-center"
                                onPress={onCommitEdit}
                            >
                                <Text className="text-primary mr-2 font-medium">Save</Text>
                                <Ionicons name="checkmark-outline" size={16} color={getColor("primary")} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                className="flex-1 py-3 flex-row items-center justify-center"
                                onPress={onDelete}
                            >
                                <Text className="text-error mr-2 font-medium">Delete</Text>
                                <Ionicons name="trash-outline" size={16} color={getColor("error")} />
                            </TouchableOpacity>
                        )}

                        <View className="w-px h-full bg-outline-variant" />

                        {isEditing ? (
                            <TouchableOpacity
                                className="flex-1 py-3 flex-row items-center justify-center"
                                onPress={onDelete}
                            >
                                <Text className="text-error mr-2 font-medium">Cancel</Text>
                                <Ionicons name="close-outline" size={16} color={getColor("error")} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                className="flex-1 py-3 flex-row items-center justify-center"
                                onPress={onEdit}
                            >
                                <Text className="text-primary mr-2 font-medium">Edit</Text>
                                <Ionicons name="pencil-outline" size={16} color={getColor("primary")} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

export default ThoughtView;