import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { useTheme } from '@/src/controllers/ThemeManager';
import { moduleInfo } from "@/src/features/settings/controllers/UserDataStore";
import { Module } from "@timothyw/pat-common";

type WebHeaderProps = {
    modules: Module[];
}

export default function WebHeader({ modules }: WebHeaderProps) {
    const { getColor } = useTheme();
    const pathname = usePathname();

    return (
        <View className="bg-surface flex-row h-16 items-center justify-center border-b border-on-surface-variant">
            {modules.map((module) => {
                if (!module.visible && module.type !== "settings") return null;

                const moduleType = module.type;
                const { icon, title } = moduleInfo[moduleType];
                const isActive = pathname.includes(moduleType);

                return (
                    <Link key={moduleType} href={`/${moduleType}`} asChild>
                        <Pressable>
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
    );
}