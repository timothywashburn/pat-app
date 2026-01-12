import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '@/src/context/ThemeContext';
import { UserModuleData } from "@timothyw/pat-common";
import { moduleInfo } from "@/src/components/ModuleInfo";
import HamburgerMenu from './HamburgerMenu';
import { navigationRef } from '@/src/navigation/navigationRef';
import { useUserDataStore } from "@/src/stores/useUserDataStore";

type WebHeaderProps = {
    showAddButton?: boolean;
    onAddTapped?: () => void;
    showFilterButton?: boolean;
    onFilterTapped?: () => void;
    isFilterActive?: boolean;
    customFilter?: () => React.ReactNode;
    trailing?: () => React.ReactNode;
}

export default function WebHeader({
    showAddButton,
    onAddTapped,
    showFilterButton,
    onFilterTapped,
    isFilterActive,
    customFilter,
    trailing,
}: WebHeaderProps) {
    const { getColor } = useTheme();
    const route = useRoute();
    const [menuVisible, setMenuVisible] = useState(false);
    const { data } = useUserDataStore();

    if (Platform.OS !== 'web') return null;

    const modules = data?.config.modules || [];

    return (
        <>
            <View className="bg-surface h-16 border-b border-on-surface-variant" style={{ position: 'relative' }}>
                {/* Left side: Hamburger menu */}
                <View className="absolute left-0 h-full flex-row items-center px-4" style={{ zIndex: 10 }}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <Ionicons name="menu" size={24} color={getColor("on-surface")} />
                    </TouchableOpacity>
                </View>

                {/* Center: Module navigation - absolutely centered on screen */}
                <View className="absolute left-0 right-0 h-full flex-row items-center justify-center" style={{ pointerEvents: 'box-none' }}>
                    {modules.map((module) => {
                        if (!module.visible && module.type !== "settings") return null;

                        const moduleType = module.type;
                        const { icon, title } = moduleInfo[moduleType];
                        const isActive = route.name === moduleType;

                        return (
                            <TouchableOpacity
                                key={moduleType}
                                onPress={() => {
                                    if (navigationRef.isReady()) {
                                        navigationRef.navigate('MainStack', {
                                            screen: 'Tabs',
                                            params: { screen: moduleType }
                                        });
                                    }
                                }}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <View className="flex-row items-center px-4 h-full">
                                    <Ionicons
                                        name={icon}
                                        size={24}
                                        color={isActive ? getColor("primary") : getColor("on-surface")}
                                    />
                                    <Text
                                        className="ml-2"
                                        style={{
                                            color: isActive ? getColor("primary") : getColor("on-surface")
                                        }}
                                    >
                                        {title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Right side: Header controls */}
                <View className="absolute right-0 h-full flex-row items-center justify-end px-4" style={{ zIndex: 10 }}>
                    {customFilter ? (
                        <View className="ml-4">
                            {customFilter()}
                        </View>
                    ) : showFilterButton ? (
                        <TouchableOpacity onPress={onFilterTapped} className="ml-4 p-1">
                            <Ionicons
                                name="filter"
                                size={24}
                                color={isFilterActive ? getColor("primary") : getColor("on-surface")}
                            />
                        </TouchableOpacity>
                    ) : null}

                    {showAddButton && (
                        <TouchableOpacity onPress={onAddTapped} className="ml-4 p-1">
                            <Ionicons name="add" size={24} color={getColor("on-surface")} />
                        </TouchableOpacity>
                    )}

                    {trailing && trailing()}
                </View>
            </View>

            <HamburgerMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
        </>
    );
}