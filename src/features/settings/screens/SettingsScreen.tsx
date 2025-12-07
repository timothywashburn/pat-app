import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useToast } from "@/src/components/toast/ToastContext";
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { UserModuleData, ModuleType, NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { LocalSection } from '@/src/features/settings/sections/LocalSection';
import { GeneralSection } from '@/src/features/settings/sections/GeneralSection';
import { NotificationsSection } from '@/src/features/settings/sections/NotificationsSection';
import { AgendaSection } from '@/src/features/settings/sections/AgendaSection';
import { PeopleSection } from '@/src/features/settings/sections/PeopleSection';
import { HabitsSection } from '@/src/features/settings/sections/HabitsSection';
import { InboxSection } from '@/src/features/settings/sections/InboxSection';
import { useNavStateLogger } from "@/src/hooks/useNavStateLogger";
import { useHeaderControls } from '@/src/context/HeaderControlsContext';

interface SettingsPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Settings'>;
    route: RouteProp<MainStackParamList, 'Settings'>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    navigation,
    route
}) => {
    const { errorToast, successToast } = useToast();
    const { signOut } = useAuthStore();
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { setHeaderControls } = useHeaderControls();

    const { data, updateUserData } = useUserDataStore();

    useNavStateLogger(navigation, 'settings');

    const [sectionData, setSectionData] = useState({
        modules: data.config.modules,
        itemCategories: data.config.agenda.itemCategories,
        itemTypes: data.config.agenda.itemTypes,
        propertyKeys: data.config.people.propertyKeys
    });

    const handleSaveChanges = useCallback(async () => {
        setIsSaving(true);
        try {
            await updateUserData({
                config: {
                    agenda: {
                        itemCategories: sectionData.itemCategories,
                        itemTypes: sectionData.itemTypes
                    },
                    people: {
                        propertyKeys: sectionData.propertyKeys
                    },
                    modules: sectionData.modules
                }
            });
            successToast("Settings saved successfully");
            setEditMode(false);
        } catch (error) {
            console.log(`failed to save settings: ${error}`)
            errorToast(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    }, [sectionData, updateUserData, successToast, errorToast]);

    const handleGeneralDataChange = (data: { modules: UserModuleData[] }) => {
        setSectionData(prev => ({ ...prev, modules: data.modules }));
    };

    const handleAgendaDataChange = (data: { itemCategories: string[], itemTypes: string[] }) => {
        setSectionData(prev => ({ ...prev, itemCategories: data.itemCategories, itemTypes: data.itemTypes }));
    };

    const handlePeopleDataChange = (data: { propertyKeys: string[] }) => {
        setSectionData(prev => ({ ...prev, propertyKeys: data.propertyKeys }));
    };

    useFocusEffect(
        useCallback(() => {
            setHeaderControls({
                trailing: () => (
                    <View className="flex-row">
                        {editMode && (
                            <TouchableOpacity
                                onPress={handleSaveChanges}
                                disabled={isSaving}
                                className="mr-4"
                            >
                                <Text className="text-primary text-base">
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                            <Text className={`text-base ${editMode ? "text-on-error" : "text-primary"}`}>
                                {editMode ? 'Cancel' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ),
            });

            return () => {
                setHeaderControls({});
            };
        }, [editMode, isSaving, handleSaveChanges])
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <MainViewHeader
                moduleType={ModuleType.SETTINGS}
                title="Settings"
                hideOnWeb
            />

            <ScrollView className="flex-1">
                <View className="p-4">
                    <GeneralSection
                        editMode={editMode}
                        onSignOut={() => signOut()}
                        onDataChange={handleGeneralDataChange}
                    />

                    <View className="h-px bg-surface my-6" />

                    <LocalSection />

                    <View className="h-px bg-surface my-6" />

                    <NotificationsSection />

                    <View className="h-px bg-surface my-6" />

                    <AgendaSection
                        editMode={editMode}
                        onDataChange={handleAgendaDataChange}
                    />

                    <View className="h-px bg-surface my-6" />

                    <PeopleSection
                        editMode={editMode}
                        onDataChange={handlePeopleDataChange}
                    />

                    <View className="h-px bg-surface my-6" />

                    <HabitsSection
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-6" />

                    <InboxSection
                        editMode={editMode}
                    />
                </View>
            </ScrollView>

        </GestureHandlerRootView>
    );
}

export default SettingsPanel;