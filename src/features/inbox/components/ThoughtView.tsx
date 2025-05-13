import React from 'react';
import { Text, TextInput, View, TouchableOpacity, Animated } from 'react-native';
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
        <View className={`w-full bg-surface rounded-lg mb-3 overflow-hidden`}>
            <View className="p-4">
                {isEditing ? (
                    <View className="flex-row">
                        <TextInput
                            className="text-base border border-primary rounded-lg p-2 flex-1 mr-2"
                            value={editedContent}
                            onChangeText={onChangeEditContent}
                            autoFocus
                            multiline
                        />
                        <TouchableOpacity
                            className="bg-primary rounded-lg px-3 justify-center"
                            onPress={onCommitEdit}
                        >
                            <Text className="text-on-primary font-bold">Save</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text className="text-on-surface text-base">{thought.content}</Text>
                )}
            </View>

            {isExpanded && !isEditing && (
                <View className="border-t border-outline-variant bg-surface-container">
                    <View className="flex-row flex-wrap">
                        <TouchableOpacity
                            className="flex-1 py-3 flex-row items-center justify-center"
                            onPress={onMoveToAgenda}
                        >
                            <Text className="text-primary mr-2 font-medium">Agenda</Text>
                            <Ionicons name="calendar-outline" size={16} color={getColor("primary")} />
                        </TouchableOpacity>

                        <View className="w-px h-full bg-outline-variant" />

                        <TouchableOpacity
                            className="flex-1 py-3 flex-row items-center justify-center"
                            onPress={onMoveToTasks}
                        >
                            <Text className="text-primary mr-2 font-medium">Tasks</Text>
                            <Ionicons name="checkbox-outline" size={16} color={getColor("primary")} />
                        </TouchableOpacity>
                    </View>

                    <View className="h-px w-full bg-outline-variant" />

                    <View className="flex-row flex-wrap">
                        <TouchableOpacity
                            className="flex-1 py-3 flex-row items-center justify-center"
                            onPress={onEdit}
                        >
                            <Text className="text-primary mr-2 font-medium">Edit</Text>
                            <Ionicons name="pencil-outline" size={16} color={getColor("primary")} />
                        </TouchableOpacity>

                        <View className="w-px h-full bg-outline-variant" />

                        <TouchableOpacity
                            className="flex-1 py-3 flex-row items-center justify-center"
                            onPress={onDelete}
                        >
                            <Text className="text-error mr-2 font-medium">Delete</Text>
                            <Ionicons name="trash-outline" size={16} color={getColor("error")} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default ThoughtView;