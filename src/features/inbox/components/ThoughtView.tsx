import React from 'react';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme/ThemeManager';
import { Thought } from '../controllers/ThoughtManager';

interface ThoughtViewProps {
    thought: Thought;
    isEditing: boolean;
    editedContent: string;
    onChangeEditContent: (content: string) => void;
    onCommitEdit: () => void;
}

const ThoughtView: React.FC<ThoughtViewProps> = ({
    thought,
    isEditing,
    editedContent,
    onChangeEditContent,
    onCommitEdit
}) => {
    const { getColor } = useTheme();

    return (
        <View className="w-full p-4 bg-surface rounded-lg mb-3">
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
    );
};

export default ThoughtView;