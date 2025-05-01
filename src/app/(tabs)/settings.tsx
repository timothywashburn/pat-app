import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { PanelManagement } from '@/src/features/settings/components/PanelManagement';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import { useToast } from "@/src/components/toast/ToastContext";
import { useConfigStore } from "@/src/features/settings/controllers/DataStore";

export default function SettingsScreen() {
    const { getColor, colorScheme } = useTheme();
    const { errorToast } = useToast();
    const { logout, userInfo } = useAuthStore();
    const [editMode, setEditMode] = useState(false);

    const { data } = useConfigStore();
    const [itemCategories, setItemCategories] = useState(data.config.agenda.itemCategories);
    const [itemTypes, setItemTypes] = useState(data.config.agenda.itemTypes);
    const [propertyKeys, setPropertyKeys] = useState(data.config.people.propertyKeys);

    return (
        <SafeAreaView className="bg-background flex-1">
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <CustomHeader
                title="Settings"
                showAddButton={false}
                trailing={() => (
                    <Text
                        className="text-primary text-base"
                        onPress={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Done' : 'Edit'}
                    </Text>
                )}
            />

            <ScrollView className="flex-1">
                <View className="p-4">
                    <PanelManagement
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Item Categories"
                        items={itemCategories}
                        onUpdateItems={async (): Promise<void> => {}}
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Item Types"
                        items={itemTypes}
                        onUpdateItems={async (): Promise<void> => {}}
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Property Keys"
                        items={propertyKeys}
                        onUpdateItems={async (): Promise<void> => {}}
                        editMode={editMode}
                    />

                    {userInfo && (
                        <View className="bg-surface w-full p-4 rounded-lg mt-5 mb-5">
                            <Text className="text-on-surface text-base font-bold mb-2.5">User Info</Text>
                            <Text className="text-on-surface">Name: {userInfo.name}</Text>
                            <Text className="text-on-surface">Email: {userInfo.email}</Text>
                            <Text className="text-on-surface">Email Verified: {userInfo.isEmailVerified ? 'Yes' : 'No'}</Text>
                        </View>
                    )}

                    <Text
                        className="text-unknown text-base font-bold text-center py-3"
                        onPress={() => logout()}
                    >
                        Sign Out
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}