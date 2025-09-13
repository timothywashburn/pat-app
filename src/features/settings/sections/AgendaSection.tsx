import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { MainStackParamList } from '@/src/navigation/MainStack';

interface AgendaSectionProps {
    editMode: boolean;
    onDataChange: (data: { itemCategories: string[], itemTypes: string[] }) => void;
}

export const AgendaSection: React.FC<AgendaSectionProps> = ({
    editMode,
    onDataChange
}) => {
    const { data } = useUserDataStore();
    const { getColor } = useTheme();
    const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Settings'>>();
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

    const handleAgendaNotificationPress = () => {
        navigation.navigate('NotificationInfo', {
            targetEntityType: NotificationEntityType.AGENDA_PANEL,
            targetId: 'agenda_panel',
            targetLevel: NotificationTemplateLevel.ENTITY,
            entityName: 'Agenda Panel'
        });
    };

    const handleCategoryNotificationPress = (category: string) => {
        navigation.navigate('NotificationInfo', {
            targetEntityType: NotificationEntityType.AGENDA_ITEM,
            targetId: `agenda_item_${category}`,
            targetLevel: NotificationTemplateLevel.PARENT,
            entityName: `${category}`
        });
    };

    return (
        <View className="mb-5">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-on-background text-lg font-bold">Agenda</Text>
                {!editMode && (
                    <TouchableOpacity
                        onPress={handleAgendaNotificationPress}
                        className="p-1"
                    >
                        <Ionicons name="notifications" size={20} color={getColor("primary")} />
                    </TouchableOpacity>
                )}
            </View>

            <SettingsList
                title="Item Categories"
                items={editMode ? localItemCategories : data.config.agenda.itemCategories}
                onUpdateItems={handleCategoriesUpdate}
                editMode={editMode}
                showNotificationButtons={true}
                onNotificationPress={handleCategoryNotificationPress}
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