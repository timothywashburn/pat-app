import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { useUserDataStore } from "@/src/stores/useUserDataStore";

interface AgendaSectionProps {
    editMode: boolean;
    onCategoryNotificationPress: (category: string) => void;
    onDataChange: (data: { itemCategories: string[], itemTypes: string[] }) => void;
}

export const AgendaSection: React.FC<AgendaSectionProps> = ({
    editMode,
    onCategoryNotificationPress,
    onDataChange
}) => {
    const { data } = useUserDataStore();
    const [localItemCategories, setLocalItemCategories] = useState(data.config.agenda.itemCategories);
    const [localItemTypes, setLocalItemTypes] = useState(data.config.agenda.itemTypes);

    useEffect(() => {
        if (editMode) {
            setLocalItemCategories([...data.config.agenda.itemCategories]);
            setLocalItemTypes([...data.config.agenda.itemTypes]);
        }
    }, [editMode, data.config.agenda]);

    const handleCategoriesUpdate = (updatedItems: string[]) => {
        setLocalItemCategories(updatedItems);
        onDataChange({ itemCategories: updatedItems, itemTypes: localItemTypes });
    };

    const handleTypesUpdate = (updatedItems: string[]) => {
        setLocalItemTypes(updatedItems);
        onDataChange({ itemCategories: localItemCategories, itemTypes: updatedItems });
    };
    return (
        <View className="mb-5">
            <Text className="text-on-background text-lg font-bold mb-4">Agenda</Text>

            <SettingsList
                title="Item Categories"
                items={editMode ? localItemCategories : data.config.agenda.itemCategories}
                onUpdateItems={handleCategoriesUpdate}
                editMode={editMode}
                showNotificationButtons={true}
                onNotificationPress={onCategoryNotificationPress}
            />

            <View className="h-px bg-surface my-4" />

            <SettingsList
                title="Item Types"
                items={editMode ? localItemTypes : data.config.agenda.itemTypes}
                onUpdateItems={handleTypesUpdate}
                editMode={editMode}
            />
        </View>
    );
};