import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { UserModuleData, ModuleType } from "@timothyw/pat-common";
import { DraggableList } from '@/src/components/common/DraggableList';
import { useToast } from "@/src/components/toast/ToastContext";
import { moduleInfo } from "@/src/components/ModuleInfo";
import { useUserDataStore } from "@/src/stores/useUserDataStore";

type UserModuleDataWithSection = UserModuleData & { section: number };

const addSections = (modules: UserModuleData[]): UserModuleDataWithSection[] => {
    return modules.map(module => ({
        ...module,
        section: module.visible ? 0 : 1
    }));
};

const removeSections = (modules: UserModuleDataWithSection[]): UserModuleData[] => {
    return modules.map(({ section, ...module }) => ({
        ...module,
        visible: section === 0
    }));
};

export const ModuleManagement: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast, successToast } = useToast();
    const { data, updateUserData } = useUserDataStore();

    const savedModules = useMemo(() =>
        addSections(data.config.modules),
        [data.config.modules]
    );

    const [localModules, setLocalModules] = useState<UserModuleDataWithSection[]>(savedModules);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setLocalModules(savedModules);
    }, [savedModules]);

    const handleReorder = (newData: UserModuleDataWithSection[]) => {
        setLocalModules(newData);
    };

    const handleToggleVisibility = (moduleType: ModuleType) => {
        setLocalModules(prevModules => {
            const visibleCount = prevModules.filter(m => m.section === 0).length;
            const moduleToToggle = prevModules.find(m => m.type === moduleType);

            if (moduleToToggle?.section === 0 && visibleCount === 1) {
                errorToast("At least one module must remain visible");
                return prevModules;
            }

            return prevModules.map(module =>
                module.type === moduleType
                    ? { ...module, section: module.section === 0 ? 1 : 0 }
                    : module
            );
        });
    };

    const handleSave = async () => {
        try {
            const modulesToSave = removeSections(localModules);
            await updateUserData({
                config: {
                    modules: modulesToSave
                }
            });
            successToast("Module arrangement saved successfully");
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';

            if (message.includes('Network error')) {
                errorToast("Network error. Please check your connection and try again.");
            } else {
                errorToast(`Failed to save module arrangement: ${message}`);
            }

            throw error;
        }
    };

    const handleCancel = async () => {
        setLocalModules(savedModules);
    };

    const renderModuleItem = ({ item }: { item: UserModuleDataWithSection }) => {
        return (
            <View className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg">
                <View className="flex-row items-center">
                    <Ionicons
                        name={moduleInfo[item.type]?.icon || "help-circle"}
                        size={24}
                        color={item.section === 0 ? getColor("primary") : getColor("on-surface-variant")}
                    />
                    <Text className={`text-base ml-3 ${item.section === 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {moduleInfo[item.type]?.title || "Unknown Module"}
                    </Text>
                </View>

                {isEditMode && (
                    <TouchableOpacity
                        onPress={() => handleToggleVisibility(item.type)}
                    >
                        <Ionicons
                            name={item.section === 0 ? 'eye' : 'eye-off'}
                            size={24}
                            color={item.section === 0 ? getColor("primary") : getColor("on-surface-variant")}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (savedModules.length === 0) {
        return (
            <View className="mb-5">
                <Text className="text-on-background text-base font-bold mb-4">
                    Module Arrangement
                </Text>
                <Text className="text-on-surface-variant text-center py-4">
                    No modules configured
                </Text>
            </View>
        );
    }

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-4">Module Arrangement</Text>

            <DraggableList
                data={localModules}
                keyExtractor={(module) => module.type}
                renderItem={renderModuleItem}
                onReorder={handleReorder}
                onSaveChanges={handleSave}
                onCancelChanges={handleCancel}
                onEditModeChange={setIsEditMode}
                reorderable={false}
            />
        </View>
    );
}
