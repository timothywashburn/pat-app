import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Module, ModuleType } from "@timothyw/pat-common";
import { moduleInfo, useDataStore } from "@/src/features/settings/controllers/DataStore";

interface ModuleManagementProps {
    editMode: boolean;
}

export const ModuleManagement: React.FC<ModuleManagementProps> = ({
    editMode,
}) => {
    const { getColor } = useTheme();
    const { data, updateConfig } = useDataStore();

    const modules = data?.config.modules || [];
    const visibleModules: Module[] = modules.filter(module => module.visible);
    const hiddenModules: Module[] = modules.filter(module => !module.visible);

    const toggleModuleVisibility = async (moduleType: ModuleType, visible: boolean) => {
        try {
            const updatedModules: Module[] = modules.map(module => {
                if (module.type === moduleType) {
                    return { ...module, visible };
                }
                return module;
            });

            await updateConfig({
                config: {
                    modules: updatedModules
                }
            });
            console.log(`module ${moduleType} visibility toggled to ${visible}`)
        } catch (error) {
            console.error(`failed to toggle module visibility: ${error}`);
        }
    };

    const sections = [
        { title: 'Visible Modules', data: visibleModules },
        { title: 'Hidden Modules', data: hiddenModules }
    ];

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-4">Module Arrangement</Text>

            {sections.map(section => (
                <View key={section.title} className="mb-4">
                    <Text className="text-on-background-variant text-sm mb-2">{section.title}</Text>

                    {section.data.map((module, index) => (
                        <View key={index} className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg mb-2">
                            <View className="flex-row items-center">
                                <Ionicons
                                    name={moduleInfo[module.type].icon}
                                    size={24}
                                    color={module.visible ? getColor("primary") : getColor("on-surface-variant")}
                                />
                                <Text className={`text-base ml-3 ${module.visible ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                    {moduleInfo[module.type].title}
                                </Text>
                            </View>

                            {editMode && (
                                <TouchableOpacity
                                    onPress={() => toggleModuleVisibility(module.type, !module.visible)}
                                >
                                    <Ionicons
                                        name={module.visible ? 'eye' : 'eye-off'}
                                        size={24}
                                        color={module.visible ? getColor("primary") : getColor("on-surface-variant")}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};