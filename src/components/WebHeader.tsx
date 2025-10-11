import React, { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { UserModuleData } from "@timothyw/pat-common";
import { moduleInfo } from "@/src/components/ModuleInfo";
import { useHeaderControls } from '@/src/context/HeaderControlsContext';
import HamburgerMenu from './HamburgerMenu';

type WebHeaderProps = {
    modules: UserModuleData[];
}

export default function WebHeader({ modules }: WebHeaderProps) {
    const { getColor } = useTheme();
    const pathname = usePathname();
    const { headerControls } = useHeaderControls();
    const [menuVisible, setMenuVisible] = useState(false);

    const hasHeaderControls = headerControls.showAddButton ||
                              headerControls.showFilterButton ||
                              headerControls.customFilter ||
                              headerControls.trailing;

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
                        const isActive = pathname.includes(moduleType);

                        return (
                            <Link key={moduleType} href={`/${moduleType}`} asChild>
                                <Pressable style={{ pointerEvents: 'auto' }}>
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
                                </Pressable>
                            </Link>
                        );
                    })}
                </View>

                {/* Right side: Header controls */}
                <View className="absolute right-0 h-full flex-row items-center justify-end px-4" style={{ zIndex: 10 }}>
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

            <HamburgerMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
        </>
    );
}