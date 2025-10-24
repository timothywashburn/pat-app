import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { ModuleManagement } from '@/src/features/settings/components/ModuleManagement';
import { UserModuleData } from "@timothyw/pat-common";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useUserDataStore } from "@/src/stores/useUserDataStore";

interface GeneralSectionProps {
    editMode: boolean;
    onSignOut: () => void;
    onDataChange: (data: { modules: UserModuleData[] }) => void;
}

export const GeneralSection: React.FC<GeneralSectionProps> = ({
    editMode,
    onSignOut,
    onDataChange
}) => {
    const { authData } = useAuthStore();
    const { data } = useUserDataStore();
    const [localModules, setLocalModules] = useState(data.config.modules);

    useEffect(() => {
        if (editMode) {
            setLocalModules([...data.config.modules]);
        }
    }, [editMode, data.config.modules]);

    const handleModulesUpdate = (updatedModules: UserModuleData[]) => {
        setLocalModules(updatedModules);
        onDataChange({ modules: updatedModules });
    };

    return (
        <View className="mb-5">
            <Text className="text-on-background text-lg font-bold mb-4">General</Text>

            <ModuleManagement
                editMode={editMode}
                modules={editMode ? localModules : data.config.modules}
                onUpdateModules={handleModulesUpdate}
            />

            <View className="h-px bg-surface my-4" />

            {authData && (
                <View className="bg-surface w-full p-4 rounded-lg mb-4">
                    <Text className="text-on-surface text-base font-bold mb-2.5">User Info</Text>
                    <Text className="text-on-surface">Email: {authData.email}</Text>
                </View>
            )}

            <Text
                className="text-error-on-bg text-base font-bold text-center py-3"
                onPress={onSignOut}
            >
                Sign Out
            </Text>
        </View>
    );
};