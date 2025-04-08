import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsListProps {
    title: string;
    items: string[];
    onUpdateItems: (updatedItems: string[]) => Promise<void>;
    editMode: boolean;
}

export const SettingsList: React.FC<SettingsListProps> = ({
    title,
    items,
    onUpdateItems,
    editMode,
}) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = async () => {
        if (newItem.trim() === '') return;

        try {
            const updatedItems = [...items, newItem.trim()];
            await onUpdateItems(updatedItems);
            setNewItem('');
        } catch (error) {
            console.error(`failed to add item: ${error}`);
            Alert.alert('Error', `Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDeleteItem = async (itemToDelete: string) => {
        Alert.alert(
            `Delete ${title.slice(0, -1)}`,
            `Are you sure you want to delete '${itemToDelete}'?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedItems = items.filter(item => item !== itemToDelete);
                            await onUpdateItems(updatedItems);
                        } catch (error) {
                            console.error(`failed to delete item: ${error}`);
                            Alert.alert('Error', `Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {items.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.itemContainer}>
                    <Text style={styles.itemText}>{item}</Text>

                    {editMode && (
                        <TouchableOpacity
                            onPress={() => handleDeleteItem(item)}
                            style={styles.deleteButton}
                        >
                            <Ionicons name="remove-circle" size={24} color="red" />
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            {editMode && (
                <View style={styles.addContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={`New ${title.slice(0, -1)}`}
                        value={newItem}
                        onChangeText={setNewItem}
                    />
                    <TouchableOpacity
                        onPress={handleAddItem}
                        disabled={newItem.trim() === ''}
                        style={[
                            styles.addButton,
                            newItem.trim() === '' && styles.disabledButton
                        ]}
                    >
                        <Ionicons name="add-circle" size={24} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 8,
    },
    itemText: {
        fontSize: 16,
    },
    deleteButton: {
        padding: 4,
    },
    addContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    addButton: {
        padding: 4,
    },
    disabledButton: {
        opacity: 0.5,
    },
});