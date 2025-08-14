import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { Module, ModuleType } from "@timothyw/pat-common";
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useToast } from "@/src/components/toast/ToastContext";
import { moduleInfo } from "@/src/components/ModuleInfo";

interface ModuleManagementProps {
    editMode: boolean;
    modules: Module[];
    onUpdateModules: (updatedModules: Module[]) => void;
}

export const ModuleManagement: React.FC<ModuleManagementProps> = ({
    editMode,
    modules,
    onUpdateModules
}) => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const visibleListRef = useRef(null);
    const hiddenListRef = useRef(null);

    const visibleModules: Module[] = modules.filter(module => module.visible);
    const hiddenModules: Module[] = modules.filter(module => !module.visible);

    const toggleModuleVisibility = (moduleType: ModuleType, visible: boolean) => {
        const moduleToToggle = modules.find(m => m.type === moduleType);
        if (!moduleToToggle) return;

        const otherModules = modules.filter(m => m.type !== moduleType);

        const updatedModule = { ...moduleToToggle, visible };
        const updatedModules: Module[] = [];

        updatedModules.push(...otherModules.filter(m => m.visible));
        updatedModules.push(updatedModule);
        updatedModules.push(...otherModules.filter(m => !m.visible));

        onUpdateModules(updatedModules);
        console.log(`module ${moduleType} visibility toggled to ${visible}`);
        console.log(`modules (toggle): ${updatedModules.map(m => m.type)}`);
    };

    const onDragEnd = (data: Module[], isVisible: boolean) => {
        let updatedModules: Module[];
        if (isVisible) {
            const hiddenModules = modules.filter(m => !m.visible);
            updatedModules = [...data, ...hiddenModules];
        } else {
            const visibleModules = modules.filter(m => m.visible);
            updatedModules = [...visibleModules, ...data];
        }

        if (modules.length !== updatedModules.length) {
            errorToast(`Some modules were lost during reordering`);
            console.log("original modules:", modules.map(m => m.type));
            console.log("updated modules:", updatedModules.map(m => m.type));
            return;
        }

        onUpdateModules(updatedModules);
        console.log(`modules reordered in ${isVisible ? 'visible' : 'hidden'} section`);
        console.log(`panel names (drag): ${updatedModules.map(m => m.type)}`);
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<Module>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={editMode ? drag : undefined}
                    disabled={!editMode}
                    className={`flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg mb-2 ${isActive ? 'border border-primary' : ''}`}
                >
                    <View className="flex-row items-center">
                        {editMode && (
                            <Ionicons
                                name="reorder-three"
                                size={24}
                                color={getColor("on-surface-variant")}
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Ionicons
                            name={moduleInfo[item.type]?.icon || "help-circle"}
                            size={24}
                            color={item.visible ? getColor("primary") : getColor("on-surface-variant")}
                        />
                        <Text className={`text-base ml-3 ${item.visible ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                            {moduleInfo[item.type]?.title || "Unknown Module"}
                        </Text>
                    </View>

                    {editMode && (
                        <TouchableOpacity
                            onPress={() => toggleModuleVisibility(item.type, !item.visible)}
                        >
                            <Ionicons
                                name={item.visible ? 'eye' : 'eye-off'}
                                size={24}
                                color={item.visible ? getColor("primary") : getColor("on-surface-variant")}
                            />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    // For non-edit mode, we use a simpler renderer
    const renderStaticItem = (item: Module) => (
        <View key={item.type} className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg mb-2">
            <View className="flex-row items-center">
                <Ionicons
                    name={moduleInfo[item.type]?.icon || "help-circle"}
                    size={24}
                    color={item.visible ? getColor("primary") : getColor("on-surface-variant")}
                />
                <Text className={`text-base ml-3 ${item.visible ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    {moduleInfo[item.type]?.title || "Unknown Module"}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-4">Module Arrangement</Text>

            <View className="mb-4">
                <Text className="text-on-background-variant text-sm mb-2">Visible Modules</Text>
                {editMode ? (
                    <View style={{ height: visibleModules.length * 60, minHeight: 60 }}>
                        <DraggableFlatList
                            ref={visibleListRef}
                            data={visibleModules}
                            renderItem={renderItem}
                            keyExtractor={(item: Module) => item.type}
                            onDragEnd={({ data }) => onDragEnd(data, true)}
                            activationDistance={10}
                            scrollEnabled={false}
                            containerStyle={{ flex: 1 }}
                        />
                    </View>
                ) : (
                    visibleModules.map(renderStaticItem)
                )}
            </View>

            <View className="mb-4">
                <Text className="text-on-background-variant text-sm mb-2">Hidden Modules</Text>
                {editMode ? (
                    <View style={{ height: hiddenModules.length * 60, minHeight: 60 }}>
                        <DraggableFlatList
                            ref={hiddenListRef}
                            data={hiddenModules}
                            renderItem={renderItem}
                            keyExtractor={(item: Module) => item.type}
                            onDragEnd={({ data }) => onDragEnd(data, false)}
                            activationDistance={10}
                            scrollEnabled={false}
                            containerStyle={{ flex: 1 }}
                        />
                    </View>
                ) : (
                    hiddenModules.map(renderStaticItem)
                )}
            </View>
        </View>
    );
}