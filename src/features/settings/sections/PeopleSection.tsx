import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { useUserDataStore } from "@/src/stores/useUserDataStore";

interface PeopleSectionProps {
    editMode: boolean;
    onDataChange: (data: { propertyKeys: string[] }) => void;
}

export const PeopleSection: React.FC<PeopleSectionProps> = ({
    editMode,
    onDataChange
}) => {
    const { data } = useUserDataStore();
    const [localPropertyKeys, setLocalPropertyKeys] = useState(data.config.people.propertyKeys);

    useEffect(() => {
        if (editMode) {
            setLocalPropertyKeys([...data.config.people.propertyKeys]);
        }
    }, [editMode, data.config.people.propertyKeys]);

    const handlePropertyKeysUpdate = (updatedItems: string[]) => {
        setLocalPropertyKeys(updatedItems);
        onDataChange({ propertyKeys: updatedItems });
    };
    return (
        <View className="mb-5">
            <Text className="text-on-background text-lg font-bold mb-4">People</Text>

            <SettingsList
                title="Property Keys"
                items={editMode ? localPropertyKeys : data.config.people.propertyKeys}
                onUpdateItems={handlePropertyKeysUpdate}
                editMode={editMode}
            />
        </View>
    );
};