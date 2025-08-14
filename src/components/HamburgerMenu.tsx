import React from 'react';
import { Text, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserDataStore } from '@/src/stores/useUserDataStore';
import { Module } from '@timothyw/pat-common';
import { useModuleContext } from './ModuleContext';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { moduleInfo } from "@/src/components/ModuleInfo";

interface HamburgerMenuProps {
    visible: boolean;
    onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ visible, onClose }) => {
    const { getColor } = useTheme();
    const { data } = useUserDataStore();
    const { showHiddenModule } = useModuleContext();

    const modules = data?.config?.modules || [];
    const hiddenModules = modules.filter(module => !module.visible);

    const handleModuleTap = (module: Module) => {
        console.log('tapping module:', module.type);
        showHiddenModule(module);
        onClose();
    };

    const renderHiddenModuleItem = (item: Module) => (
        <TouchableOpacity
            key={item.type}
            className="flex-row items-center py-3 px-4 bg-surface rounded-lg mb-2"
            onPress={() => handleModuleTap(item)}
            style={{ backgroundColor: getColor("surface") }}
        >
            <Ionicons
                name={moduleInfo[item.type]?.icon || "help-circle"}
                size={24}
                color={getColor("on-surface-variant")}
            />
            <Text
                className="text-base ml-3"
                style={{ color: getColor("on-surface") }}
            >
                {moduleInfo[item.type]?.title || "Unknown Module"}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <SafeAreaProvider>
                <TouchableOpacity
                    className="flex-1 bg-black/50"
                    onPress={onClose}
                    activeOpacity={1}
                >
                    <View className="flex-1 flex-row">
                        <SafeAreaView
                            className="w-80 h-full"
                            style={{ backgroundColor: getColor("background") }}
                        >
                            <TouchableOpacity
                                className="flex-1"
                                activeOpacity={1}
                                onPress={(e) => e.stopPropagation()}
                            >
                                <View className="p-4 flex-1">
                                    <TouchableOpacity
                                        className="self-end mb-4"
                                        onPress={onClose}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={getColor("on-background")}
                                        />
                                    </TouchableOpacity>

                                    <View>
                                        <Text
                                            className="text-sm font-bold mb-3"
                                            style={{ color: getColor("on-background") }}
                                        >
                                            Other Modules
                                        </Text>
                                        {hiddenModules.length > 0 ? (
                                            hiddenModules.map(renderHiddenModuleItem)
                                        ) : (
                                            <Text
                                                className="text-sm text-center mt-4"
                                                style={{ color: getColor("on-surface-variant") }}
                                            >
                                                No hidden modules available
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </SafeAreaView>
                        <View className="flex-1" />
                    </View>
                </TouchableOpacity>
            </SafeAreaProvider>
        </Modal>
    );
};

export default HamburgerMenu;