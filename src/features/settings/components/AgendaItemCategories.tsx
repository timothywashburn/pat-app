import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DraggableList } from '@/src/components/common/DraggableList';
import { useToast } from '@/src/components/toast/ToastContext';
import { useUserDataStore } from '@/src/stores/useUserDataStore';
import { NotificationEntityType, NotificationTemplateLevel } from '@timothyw/pat-common';
import { MainStackParamList } from '@/src/navigation/MainStack';
import NotificationService from '@/src/services/NotificationService';
import CustomTextInput from '@/src/components/common/CustomTextInput';

interface CategoryItem {
    id: string;
    value: string;
    sortOrder: number;
}

const itemsToCategories = (items: string[]): CategoryItem[] => {
    return items.map((item, index) => ({
        id: item,
        value: item,
        sortOrder: index
    }));
};

const categoriesToItems = (categories: CategoryItem[]): string[] => {
    return categories.map(cat => cat.value);
};

export const AgendaItemCategories: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast, successToast } = useToast();
    const { data, updateUserData } = useUserDataStore();
    const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Settings'>>();

    const savedCategories = useMemo(() =>
        itemsToCategories(data.config.agenda.itemCategories),
        [data.config.agenda.itemCategories]
    );

    const [localCategories, setLocalCategories] = useState<CategoryItem[]>(savedCategories);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        setLocalCategories(savedCategories);
    }, [savedCategories]);

    const handleReorder = (newData: CategoryItem[]) => {
        setLocalCategories(newData);
    };

    const handleAddItem = () => {
        if (newItem.trim() === '') return;

        const updatedCategories = [
            ...localCategories,
            {
                id: newItem.trim(),
                value: newItem.trim(),
                sortOrder: localCategories.length
            }
        ];
        setLocalCategories(updatedCategories);
        setNewItem('');
    };

    const handleDeleteItem = (categoryId: string) => {
        const updatedCategories = localCategories.filter(cat => cat.id !== categoryId);
        setLocalCategories(updatedCategories);
    };

    const handleSave = async () => {
        try {
            const itemsToSave = categoriesToItems(localCategories);
            await updateUserData({
                config: {
                    agenda: {
                        itemCategories: itemsToSave
                    }
                }
            });
            successToast('Item categories saved successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (message.includes('Network error')) {
                errorToast('Network error. Please check your connection and try again.');
            } else {
                errorToast(`Failed to save item categories: ${message}`);
            }

            throw error;
        }
    };

    const handleCancel = async () => {
        setLocalCategories(savedCategories);
        setNewItem('');
    };

    const handleCategoryNotificationPress = async (category: string) => {
        const shouldNavigate = await NotificationService.shared.checkAndPromptForNotifications();

        if (shouldNavigate) {
            navigation.navigate('NotificationInfo', {
                targetEntityType: NotificationEntityType.AGENDA_ITEM,
                targetId: `agenda_item_${category}`,
                targetLevel: NotificationTemplateLevel.PARENT,
                entityName: `${category}`
            });
        }
    };

    const renderCategoryItem = ({ item }: { item: CategoryItem }) => {
        return (
            <View className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg">
                <Text className="text-on-surface text-base flex-1">{item.value}</Text>

                <View className="flex-row items-center">
                    {!isEditMode && (
                        <TouchableOpacity
                            onPress={() => handleCategoryNotificationPress(item.value)}
                            className="p-1 mr-2"
                        >
                            <Ionicons name="notifications" size={20} color={getColor('secondary')} />
                        </TouchableOpacity>
                    )}

                    {isEditMode && (
                        <TouchableOpacity
                            onPress={() => handleDeleteItem(item.id)}
                            className="p-1"
                        >
                            <Ionicons name="remove-circle" size={24} color={getColor('on-error')} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (savedCategories.length === 0 && !isEditMode) {
        return (
            <View className="mb-5">
                <Text className="text-on-background text-base font-bold mb-2.5">
                    Item Categories
                </Text>
                <Text className="text-on-surface-variant text-center py-4">
                    No categories configured
                </Text>
            </View>
        );
    }

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-2.5">
                Item Categories
            </Text>

            <DraggableList
                data={localCategories}
                keyExtractor={(category) => category.id}
                renderItem={renderCategoryItem}
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
                            placeholder="New Category"
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
