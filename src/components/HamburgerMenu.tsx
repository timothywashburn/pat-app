import React from 'react';
import { Text, TouchableOpacity, View, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { useUserDataStore, moduleInfo } from '@/src/features/settings/controllers/useUserDataStore';
import { Module } from '@timothyw/pat-common';
import { router } from 'expo-router';

interface HamburgerMenuProps {
    visible: boolean;
    onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ visible, onClose }) => {
    const { getColor } = useTheme();
    const { data } = useUserDataStore();

    const modules = data?.config?.modules || [];
    const visibleModules = modules.filter(module => module.visible);
    const hiddenModules = modules.filter(module => !module.visible);

    const handleModuleTap = (moduleType: string) => {
        router.push(`/(tabs)/${moduleType}`);
        onClose();
    };

    const renderModuleItem = (item: Module) => (
        <TouchableOpacity 
            key={item.type} 
            className="flex-row items-center py-3 px-4 bg-surface rounded-lg mb-2"
            onPress={() => handleModuleTap(item.type)}
        >
            <Ionicons
                name={moduleInfo[item.type]?.icon || "help-circle"}
                size={24}
                color={getColor("primary")}
            />
            <Text className="text-base ml-3 text-on-surface">
                {moduleInfo[item.type]?.title || "Unknown Module"}
            </Text>
        </TouchableOpacity>
    );

    const renderHiddenModuleItem = (item: Module) => (
        <View key={item.type} className="flex-row items-center py-3 px-4 bg-surface rounded-lg mb-2">
            <Ionicons
                name={moduleInfo[item.type]?.icon || "help-circle"}
                size={24}
                color={getColor("on-surface-variant")}
            />
            <Text className="text-base ml-3 text-on-surface-variant">
                {moduleInfo[item.type]?.title || "Unknown Module"}
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                className="flex-1 bg-black/50"
                onPress={onClose}
            >
                <SafeAreaView className="bg-background w-80 h-full">
                    <View className="p-4 flex-1">
                        <TouchableOpacity 
                            className="self-end mb-4"
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color={getColor("on-background")} />
                        </TouchableOpacity>

                        <View className="mb-6">
                            <Text className="text-on-background text-sm font-bold mb-3">Visible Modules</Text>
                            {visibleModules.map(renderModuleItem)}
                        </View>

                        <View>
                            <Text className="text-on-background-variant text-sm font-bold mb-3">Hidden Modules</Text>
                            {hiddenModules.map(renderHiddenModuleItem)}
                        </View>
                    </View>
                </SafeAreaView>
            </TouchableOpacity>
        </Modal>
    );
};

export default HamburgerMenu;