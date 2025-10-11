import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import HamburgerMenu from '../HamburgerMenu';
import { useModuleContext } from "@/src/components/ModuleContext";
import { ModuleType } from "@timothyw/pat-common";
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { useHeaderControls } from '@/src/context/HeaderControlsContext';

interface CustomHeaderProps {
    moduleType: ModuleType;
    title: string;
    hideOnWeb?: boolean;
}

const MainViewHeader: React.FC<CustomHeaderProps> = ({
    moduleType,
    title,
}) => {
    const { getColor } = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const { hideActiveModule } = useModuleContext();
    const { isModuleVisible } = useUserDataStore();
    const { headerControls } = useHeaderControls();

    if (Platform.OS === 'web') return null;

    return (
        <>
            <View className="bg-surface border-b border-surface">
                <View className="h-14 flex-row items-center justify-between px-4">
                    {isModuleVisible(moduleType) ? (
                        <View className="flex-1 items-start">
                            <TouchableOpacity
                                onPress={() => setMenuVisible(true)}
                            >
                                <Ionicons name="menu" size={24} color={getColor("on-surface")} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-1 items-start">
                            <TouchableOpacity
                                onPress={() => hideActiveModule()}
                            >
                                <Ionicons name="arrow-back" size={24} color={getColor("on-surface")} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text className="text-on-surface text-lg font-bold flex-2 text-center">{title}</Text>

                    <View className="flex-1 flex-row justify-end items-center">
                        {headerControls.customFilter ? (
                            <View className="ml-4">
                                {headerControls.customFilter()}
                            </View>
                        ) : headerControls.showFilterButton ? (
                            <TouchableOpacity onPress={headerControls.onFilterTapped} className="ml-4 p-1">
                                <Ionicons
                                    name="filter"
                                    size={24}
                                    color={headerControls.isFilterActive ? getColor("primary") : getColor("on-surface")}
                                />
                            </TouchableOpacity>
                        ) : null}

                        {headerControls.showAddButton && (
                            <TouchableOpacity onPress={headerControls.onAddTapped} className="ml-4 p-1">
                                <Ionicons name="add" size={24} color={getColor("on-surface")} />
                            </TouchableOpacity>
                        )}

                        {headerControls.trailing && headerControls.trailing()}
                    </View>
                </View>
            </View>

            <HamburgerMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
        </>
    );
};

export default MainViewHeader;