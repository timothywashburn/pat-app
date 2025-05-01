import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';

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
    const { getColor } = useTheme();
    const [newItem, setNewItem] = useState('');

    const handleAddItem = async () => {
        if (newItem.trim() === '') return;

        try {
            const updatedItems = [...items, newItem.trim()];
            await onUpdateItems(updatedItems);
            setNewItem('');
        } catch (error) {
            console.log(`failed to add item: ${error}`);
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
                            console.log(`failed to delete item: ${error}`);
                            Alert.alert('Error', `Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-2.5">{title}</Text>

            {items.map((item, index) => (
                <View key={`${item}-${index}`} className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg mb-2">
                    <Text className="text-on-surface text-base">{item}</Text>

                    {editMode && (
                        <TouchableOpacity
                            onPress={() => handleDeleteItem(item)}
                            className="p-1"
                        >
                            <Ionicons name="remove-circle" size={24} color={getColor("error")} />
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            {editMode && (
                <View className="flex-row items-center mt-2">
                    <TextInput
                        className="bg-surface text-on-surface flex-1 h-10 border border-outline rounded-lg px-3 mr-2"
                        placeholder={`New ${title.slice(0, -1)}`}
                        placeholderTextColor={getColor("on-surface-variant")}
                        value={newItem}
                        onChangeText={setNewItem}
                    />
                    <TouchableOpacity
                        onPress={handleAddItem}
                        disabled={newItem.trim() === ''}
                        className={`p-1 ${newItem.trim() === '' ? 'opacity-40' : ''}`}
                    >
                        <Ionicons name="add-circle" size={24} color={getColor("primary")} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};