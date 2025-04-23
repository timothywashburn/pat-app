import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { PanelManagement } from '@/src/features/settings/components/PanelManagement';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';
import { useToast } from "@/src/components/toast/ToastContext";

export default function SettingsScreen() {
    const { getColor, colorScheme } = useTheme();
    const { errorToast } = useToast();
    const { signOut, userInfo } = useAuthStore();
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const settingsManager = SettingsManager.shared;

    const [panels, setPanels] = useState(settingsManager.panels);
    const [categories, setCategories] = useState(settingsManager.categories);
    const [types, setTypes] = useState(settingsManager.types);
    const [propertyKeys, setPropertyKeys] = useState(settingsManager.propertyKeys);

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);

            try {
                await settingsManager.loadSettings();
                setPanels([...settingsManager.panels]);
                setCategories([...settingsManager.categories]);
                setTypes([...settingsManager.types]);
                setPropertyKeys([...settingsManager.propertyKeys]);
            } catch (error) {
                console.error('failed to load settings:', error);
                const errorMsg = error instanceof Error ? error.message : 'Failed to load settings';
                errorToast(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleUpdatePanels = async (updatedPanels: typeof panels) => {
        setIsLoading(true);

        try {
            settingsManager.panels = updatedPanels;
            await settingsManager.updatePanelSettings();
            setPanels([...updatedPanels]);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to update panels';
            errorToast(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategories = async (updatedCategories: string[]) => {
        setIsLoading(true);

        try {
            await settingsManager.updateItemCategories(updatedCategories);
            setCategories([...updatedCategories]);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to update categories';
            errorToast(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTypes = async (updatedTypes: string[]) => {
        setIsLoading(true);

        try {
            await settingsManager.updateItemTypes(updatedTypes);
            setTypes([...updatedTypes]);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to update types';
            errorToast(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePropertyKeys = async (updatedKeys: string[]) => {
        setIsLoading(true);

        try {
            await settingsManager.updatePropertyKeys(updatedKeys);
            setPropertyKeys([...updatedKeys]);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to update property keys';
            errorToast(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !settingsManager.isLoaded) {
        return (
            <SafeAreaView className="bg-background flex-1">
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <CustomHeader
                    title="Settings"
                    showAddButton={false}
                />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={getColor("primary")} />
                    <Text className="mt-3 text-base text-on-background-variant">Loading settings...</Text>
                </View>
            </SafeAreaView>
        );
    }

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

            {isLoading && (
                <View className="absolute inset-0 justify-center items-center z-50">
                    <ActivityIndicator size="large" color={getColor("primary")} />
                </View>
            )}

            <ScrollView className="flex-1">
                <View className="p-4">
                    <PanelManagement
                        panels={panels}
                        onUpdatePanels={handleUpdatePanels}
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Item Categories"
                        items={categories}
                        onUpdateItems={handleUpdateCategories}
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Item Types"
                        items={types}
                        onUpdateItems={handleUpdateTypes}
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Property Keys"
                        items={propertyKeys}
                        onUpdateItems={handleUpdatePropertyKeys}
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
                        onPress={() => signOut()}
                    >
                        Sign Out
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}