import React from 'react';
import { Text, TextInput, View } from 'react-native';
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
    const { colors } = useTheme();

    return (
        <View className="w-full p-4 bg-surface rounded-lg mb-3">
            {isEditing ? (
                <TextInput
                    className="text-base border border-accent rounded-lg p-2"
                    value={editedContent}
                    onChangeText={onChangeEditContent}
                    onBlur={onCommitEdit}
                    onSubmitEditing={onCommitEdit}
                    autoFocus
                    multiline
                />
            ) : (
                <Text className="text-base text-primary">{thought.content}</Text>
            )}
        </View>
    );
};

export default ThoughtView;