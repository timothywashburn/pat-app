import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import CustomHeader from '@/src/components/CustomHeader';
import { SettingsList } from '@/src/features/settings/components/SettingsList';
import { ModuleManagement } from '@/src/features/settings/components/ModuleManagement';
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useToast } from "@/src/components/toast/ToastContext";
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { UserModuleData, ModuleType, NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationConfigView } from '@/src/features/notifications/components/NotificationConfigView';
import { MainStackParamList } from '@/src/navigation/MainStack';

interface SettingsPanelProps {
    navigation: StackNavigationProp<MainStackParamList, 'Settings'>;
    route: RouteProp<MainStackParamList, 'Settings'>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    navigation,
    route
}) => {
    const { errorToast, successToast } = useToast();
    const { signOut, authData } = useAuthStore();
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showNotificationConfig, setShowNotificationConfig] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data, updateUserData } = useUserDataStore();

    // Local state for tracking changes
    const [localItemCategories, setLocalItemCategories] = useState(data.config.agenda.itemCategories);
    const [localItemTypes, setLocalItemTypes] = useState(data.config.agenda.itemTypes);
    const [localPropertyKeys, setLocalPropertyKeys] = useState(data.config.people.propertyKeys);
    const [localModules, setLocalModules] = useState(data.config.modules);

    // Reset local state when entering/exiting edit mode
    useEffect(() => {
        if (editMode) {
            // Initialize with current values when entering edit mode
            setLocalItemCategories([...data.config.agenda.itemCategories]);
            setLocalItemTypes([...data.config.agenda.itemTypes]);
            setLocalPropertyKeys([...data.config.people.propertyKeys]);
            setLocalModules([...data.config.modules]);
        }
    }, [editMode, data]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateUserData({
                config: {
                    agenda: {
                        itemCategories: localItemCategories,
                        itemTypes: localItemTypes
                    },
                    people: {
                        propertyKeys: localPropertyKeys
                    },
                    modules: localModules
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
    };

    const updateLocalModules = (updatedModules: UserModuleData[]) => {
        setLocalModules(updatedModules);
    };

    const handleCategoryNotificationPress = (category: string) => {
        setSelectedCategory(category);
        setShowNotificationConfig(true);
    };

    const handleNotificationConfigClose = () => {
        setShowNotificationConfig(false);
        setSelectedCategory(null);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <CustomHeader
                moduleType={ModuleType.SETTINGS}
                title="Settings"
                showAddButton={false}
                trailing={() => (
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
                )}
            />

            <ScrollView className="flex-1">
                <View className="p-4">
                    <ModuleManagement
                        editMode={editMode}
                        modules={editMode ? localModules : data.config.modules}
                        onUpdateModules={updateLocalModules}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Item Categories"
                        items={editMode ? localItemCategories : data.config.agenda.itemCategories}
                        onUpdateItems={(updatedItems) => setLocalItemCategories(updatedItems)}
                        editMode={editMode}
                        showNotificationButtons={true}
                        onNotificationPress={handleCategoryNotificationPress}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Item Types"
                        items={editMode ? localItemTypes : data.config.agenda.itemTypes}
                        onUpdateItems={(updatedItems) => setLocalItemTypes(updatedItems)}
                        editMode={editMode}
                    />

                    <View className="h-px bg-surface my-4" />

                    <SettingsList
                        title="Property Keys"
                        items={editMode ? localPropertyKeys : data.config.people.propertyKeys}
                        onUpdateItems={(updatedItems) => setLocalPropertyKeys(updatedItems)}
                        editMode={editMode}
                    />

                    {authData && (
                        <View className="bg-surface w-full p-4 rounded-lg mt-5 mb-5">
                            <Text className="text-on-surface text-base font-bold mb-2.5">User Info</Text>
                            <Text className="text-on-surface">Email: {authData.email}</Text>
                        </View>
                    )}

                    <Text
                        className="text-on-error text-base font-bold text-center py-3"
                        onPress={() => signOut()}
                    >
                        Sign Out
                    </Text>
                </View>
            </ScrollView>

            {/* Category notification config modal */}
            {showNotificationConfig && selectedCategory && (
                <NotificationConfigView
                    targetEntityType={NotificationEntityType.AGENDA_ITEM}
                    targetId={`agenda_item_${selectedCategory}`}
                    targetLevel={NotificationTemplateLevel.PARENT}
                    entityName={`${selectedCategory} Category`}
                    onClose={handleNotificationConfigClose}
                />
            )}
        </GestureHandlerRootView>
    );
}

export default SettingsPanel;