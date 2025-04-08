import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '@/src/components/CustomHeader';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { PanelManagement } from '@/src/features/settings/components/PanelManagement';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import { SettingsManager } from '@/src/features/settings/controllers/SettingsManager';

export default function SettingsScreen() {
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
            <SafeAreaView style={styles.container}>
                <StatusBar style="auto" />
                <CustomHeader
                    title="Settings"
                    showAddButton={false}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />

            <CustomHeader
                title="Settings"
                showAddButton={false}
                trailing={() => (
                    <Text
                        style={styles.editButton}
                        onPress={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Done' : 'Edit'}
                    </Text>
                )}
            />

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <PanelManagement
                        panels={panels}
                        onUpdatePanels={handleUpdatePanels}
                        editMode={editMode}
                    />

                    <View style={styles.divider} />

                    <SettingsList
                        title="Item Categories"
                        items={categories}
                        onUpdateItems={handleUpdateCategories}
                        editMode={editMode}
                    />

                    <View style={styles.divider} />

                    <SettingsList
                        title="Item Types"
                        items={types}
                        onUpdateItems={handleUpdateTypes}
                        editMode={editMode}
                    />

                    <View style={styles.divider} />

                    <SettingsList
                        title="Property Keys"
                        items={propertyKeys}
                        onUpdateItems={handleUpdatePropertyKeys}
                        editMode={editMode}
                    />

                    {userInfo && (
                        <View style={styles.userInfoContainer}>
                            <Text style={styles.sectionTitle}>User Info</Text>
                            <Text>Name: {userInfo.name}</Text>
                            <Text>Email: {userInfo.email}</Text>
                            <Text>Email Verified: {userInfo.isEmailVerified ? 'Yes' : 'No'}</Text>
                        </View>
                    )}

                    <Text
                        style={styles.signOutButton}
                        onPress={() => signOut()}
                    >
                        Sign Out
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    errorText: {
        color: 'red',
        padding: 16,
        textAlign: 'center',
    },
    editButton: {
        color: '#007AFF',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
    },
    userInfoContainer: {
        width: '100%',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    signOutButton: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});