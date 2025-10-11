import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import CustomTextInput from '@/src/components/common/CustomTextInput';

interface SettingsListProps {
    title: string;
    items: string[];
    onUpdateItems: (updatedItems: string[]) => void;
    editMode: boolean;
    showNotificationButtons?: boolean;
    onNotificationPress?: (item: string) => void;
}

export const SettingsList: React.FC<SettingsListProps> = ({
    title,
    items,
    onUpdateItems,
    editMode,
    showNotificationButtons = false,
    onNotificationPress,
}) => {
    const { getColor } = useTheme();
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim() === '') return;

        const updatedItems = [...items, newItem.trim()];
        onUpdateItems(updatedItems);
        setNewItem('');
    };

    const handleDeleteItem = (itemToDelete: string) => {
        const updatedItems = items.filter(item => item !== itemToDelete);
        onUpdateItems(updatedItems);
        console.log(`item ${itemToDelete} marked for deletion`)
    };

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-2.5">{title}</Text>

            {items.map((item, index) => (
                <View key={`${item}-${index}`} className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg mb-2">
                    <Text className="text-on-surface text-base flex-1">{item}</Text>

                    <View className="flex-row items-center">
                        {showNotificationButtons && !editMode && (
                            <TouchableOpacity
                                onPress={() => onNotificationPress?.(item)}
                                className="p-1 mr-2"
                            >
                                <Ionicons name="notifications" size={20} color={getColor("secondary")} />
                            </TouchableOpacity>
                        )}

                        {editMode && (
                            <TouchableOpacity
                                onPress={() => handleDeleteItem(item)}
                                className="p-1"
                            >
                                <Ionicons name="remove-circle" size={24} color={getColor("on-error")} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}

            {editMode && (
                <View className="flex-row items-center mt-2">
                    <View className="flex-1 mr-2">
                        <CustomTextInput
                            placeholder={`New ${title.slice(0, -1)}`}
                            value={newItem}
                            onChangeText={setNewItem}
                        />
                    </View>
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