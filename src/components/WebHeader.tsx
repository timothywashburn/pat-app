import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { useTheme } from '@/src/controllers/ThemeManager';
import { panelInfo } from "@/src/features/settings/controllers/ConfigStore";
import { Panel } from "@timothyw/pat-common";

type WebHeaderProps = {
    panels: Panel[];
}

export default function WebHeader({ panels }: WebHeaderProps) {
    const { getColor } = useTheme();
    const pathname = usePathname();

    return (
        <View className="bg-surface flex-row h-16 items-center justify-center border-b border-on-surface-variant">
            {panels.map((panel) => {
                if (!panel.visible && panel.type !== "settings") return null;

                const panelType = panel.type;
                const { icon, title } = panelInfo[panelType];
                const isActive = pathname.includes(panelType);

                return (
                    <Link key={panelType} href={`/${panelType}`} asChild>
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