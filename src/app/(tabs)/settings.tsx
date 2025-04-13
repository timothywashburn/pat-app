import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/theme/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { PanelManagement } from '@/src/features/settings/components/PanelManagement';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';

export default function SettingsScreen() {
    const { colors, colorScheme } = useTheme();
    const { signOut, userInfo } = useAuthStore();
    const [editMode, setEditMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const settingsManager = SettingsManager.shared;

    // Local state to track settings
    const [panels, setPanels] = useState(settingsManager.panels);
    const [categories, setCategories] = useState(settingsManager.categories);
    const [types, setTypes] = useState(settingsManager.types);
    const [propertyKeys, setPropertyKeys] = useState(settingsManager.propertyKeys);

    // Initialize and load settings
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                await settingsManager.loadSettings();
                setPanels([...settingsManager.panels]);
                setCategories([...settingsManager.categories]);
                setTypes([...settingsManager.types]);
                setPropertyKeys([...settingsManager.propertyKeys]);
            } catch (error) {
                console.error('failed to load settings:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []); // Empty dependency array means this only runs once

    const handleUpdatePanels = async (updatedPanels: typeof panels) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            settingsManager.panels = updatedPanels;
            await settingsManager.updatePanelSettings();
            setPanels([...updatedPanels]); // Make sure to use a new array reference
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update panels');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategories = async (updatedCategories: string[]) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await settingsManager.updateItemCategories(updatedCategories);
            setCategories([...updatedCategories]); // Make sure to use a new array reference
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTypes = async (updatedTypes: string[]) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await settingsManager.updateItemTypes(updatedTypes);
            setTypes([...updatedTypes]); // Make sure to use a new array reference
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update types');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePropertyKeys = async (updatedKeys: string[]) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await settingsManager.updatePropertyKeys(updatedKeys);
            setPropertyKeys([...updatedKeys]); // Make sure to use a new array reference
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update property keys');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !settingsManager.isLoaded) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <CustomHeader
                    title="Settings"
                    showAddButton={false}
                />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text className="mt-3 text-base text-secondary">Loading settings...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <CustomHeader
                title="Settings"
                showAddButton={false}
                trailing={() => (
                    <Text
                        className="text-accent text-base"
                        onPress={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Done' : 'Edit'}
                    </Text>
                )}
            />

            {errorMessage && (
                <Text className="text-red-500 p-4 text-center">{errorMessage}</Text>
            )}

            {isLoading && (
                <View className="absolute inset-0 bg-background/70 justify-center items-center z-50">
                    <ActivityIndicator size="large" color={colors.accent} />
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
                        <View className="w-full p-4 bg-surface rounded-lg mt-5 mb-5">
                            <Text className="text-base font-bold text-primary mb-2.5">User Info</Text>
                            <Text className="text-primary">Name: {userInfo.name}</Text>
                            <Text className="text-primary">Email: {userInfo.email}</Text>
                            <Text className="text-primary">Email Verified: {userInfo.isEmailVerified ? 'Yes' : 'No'}</Text>
                        </View>
                    )}

                    <Text
                        className="text-red-500 text-base font-bold text-center py-3"
                        onPress={() => signOut()}
                    >
                        Sign Out
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}