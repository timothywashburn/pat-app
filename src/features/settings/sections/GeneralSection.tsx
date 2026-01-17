import React from 'react';
import { View, Text } from 'react-native';
import { ModuleManagement } from '@/src/features/settings/components/ModuleManagement';
import { useAuthStore } from "@/src/stores/useAuthStore";

interface GeneralSectionProps {
    onSignOut: () => void;
}

export const GeneralSection: React.FC<GeneralSectionProps> = ({
    onSignOut
}) => {
    const { authData } = useAuthStore();

    return (
        <View className="mb-5">
            <Text className="text-on-background text-lg font-bold mb-4">General</Text>

            <ModuleManagement />

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
