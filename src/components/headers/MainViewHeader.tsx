import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import HamburgerMenu from '../HamburgerMenu';
import { useModuleContext } from "@/src/components/ModuleContext";
import { ModuleType } from "@timothyw/pat-common";
import { useUserDataStore } from "@/src/stores/useUserDataStore";

interface CustomHeaderProps {
    moduleType: ModuleType;
    title: string;
    showAddButton?: boolean;
    onAddTapped?: () => void;
    showFilterButton?: boolean;
    isFilterActive?: boolean;
    onFilterTapped?: () => void;
    showNotificationsButton?: boolean;
    onNotificationsTapped?: () => void;
    trailing?: () => React.ReactNode;
    isModuleView?: boolean;
}

const MainViewHeader: React.FC<CustomHeaderProps> = ({
    moduleType,
    title,
    showAddButton = false,
    onAddTapped,
    showFilterButton = false,
    isFilterActive = false,
    onFilterTapped,
    showNotificationsButton = false,
    onNotificationsTapped,
    trailing,
}) => {
    const { getColor } = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const { hideActiveModule } = useModuleContext();
    const { isModuleVisible } = useUserDataStore();

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
                        {showNotificationsButton && (
                            <TouchableOpacity onPress={onNotificationsTapped} className="ml-4 p-1">
                                <Ionicons name="notifications-outline" size={24} color={getColor("on-surface")} />
                            </TouchableOpacity>
                        )}

                        {showFilterButton && (
                            <TouchableOpacity onPress={onFilterTapped} className="ml-4 p-1">
                                <Ionicons
                                    name="filter"
                                    size={24}
                                    color={isFilterActive ? getColor("primary") : getColor("on-surface")}
                                />
                            </TouchableOpacity>
                        )}

                        {showAddButton && (
                            <TouchableOpacity onPress={onAddTapped} className="ml-4 p-1">
                                <Ionicons name="add" size={24} color={getColor("on-surface")} />
                            </TouchableOpacity>
                        )}

                        {trailing && trailing()}
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