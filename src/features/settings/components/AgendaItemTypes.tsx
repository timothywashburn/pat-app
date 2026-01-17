import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { DraggableList } from '@/src/components/common/DraggableList';
import { useToast } from '@/src/components/toast/ToastContext';
import { useUserDataStore } from '@/src/stores/useUserDataStore';
import CustomTextInput from '@/src/components/common/CustomTextInput';

interface TypeItem {
    id: string;
    value: string;
    sortOrder: number;
}

const itemsToTypes = (items: string[]): TypeItem[] => {
    return items.map((item, index) => ({
        id: item,
        value: item,
        sortOrder: index
    }));
};

const typesToItems = (types: TypeItem[]): string[] => {
    return types.map(type => type.value);
};

export const AgendaItemTypes: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast, successToast } = useToast();
    const { data, updateUserData } = useUserDataStore();

    const savedTypes = useMemo(() =>
        itemsToTypes(data.config.agenda.itemTypes),
        [data.config.agenda.itemTypes]
    );

    const [localTypes, setLocalTypes] = useState<TypeItem[]>(savedTypes);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        setLocalTypes(savedTypes);
    }, [savedTypes]);

    const handleReorder = (newData: TypeItem[]) => {
        setLocalTypes(newData);
    };

    const handleAddItem = () => {
        if (newItem.trim() === '') return;

        const updatedTypes = [
            ...localTypes,
            {
                id: newItem.trim(),
                value: newItem.trim(),
                sortOrder: localTypes.length
            }
        ];
        setLocalTypes(updatedTypes);
        setNewItem('');
    };

    const handleDeleteItem = (typeId: string) => {
        const updatedTypes = localTypes.filter(type => type.id !== typeId);
        setLocalTypes(updatedTypes);
    };

    const handleSave = async () => {
        try {
            const itemsToSave = typesToItems(localTypes);
            await updateUserData({
                config: {
                    agenda: {
                        itemTypes: itemsToSave
                    }
                }
            });
            successToast('Item types saved successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (message.includes('Network error')) {
                errorToast('Network error. Please check your connection and try again.');
            } else {
                errorToast(`Failed to save item types: ${message}`);
            }

            throw error;
        }
    };

    const handleCancel = async () => {
        setLocalTypes(savedTypes);
        setNewItem('');
    };

    const renderTypeItem = ({ item }: { item: TypeItem }) => {
        return (
            <View className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg">
                <Text className="text-on-surface text-base flex-1">{item.value}</Text>

                {isEditMode && (
                    <TouchableOpacity
                        onPress={() => handleDeleteItem(item.id)}
                        className="p-1"
                    >
                        <Ionicons name="remove-circle" size={24} color={getColor('on-error')} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (savedTypes.length === 0 && !isEditMode) {
        return (
            <View className="mb-5">
                <Text className="text-on-background text-base font-bold mb-2.5">
                    Item Types
                </Text>
                <Text className="text-on-surface-variant text-center py-4">
                    No types configured
                </Text>
            </View>
        );
    }

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-2.5">
                Item Types
            </Text>

            <DraggableList
                data={localTypes}
                keyExtractor={(type) => type.id}
                renderItem={renderTypeItem}
                onReorder={handleReorder}
                onSaveChanges={handleSave}
                onCancelChanges={handleCancel}
                onEditModeChange={setIsEditMode}
                reorderable={false}
            />

            {isEditMode && (
                <View className="flex-row items-center mt-2">
                    <View className="flex-1 mr-2">
                        <CustomTextInput
                            placeholder="New Type"
                            value={newItem}
                            onChangeText={setNewItem}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleAddItem}
                        disabled={newItem.trim() === ''}
                        className={`p-1 ${newItem.trim() === '' ? 'opacity-40' : ''}`}
                    >
                        <Ionicons name="add-circle" size={24} color={getColor('primary')} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
