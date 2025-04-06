import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
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
    return (
        <View style={styles.container}>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={editedContent}
                    onChangeText={onChangeEditContent}
                    onBlur={onCommitEdit}
                    onSubmitEditing={onCommitEdit}
                    autoFocus
                    multiline
                />
            ) : (
                <Text style={styles.text}>{thought.content}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
    },
    input: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        padding: 8,
    }
});

export default ThoughtView;