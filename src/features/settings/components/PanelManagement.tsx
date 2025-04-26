import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Panel, PanelType } from "@timothyw/pat-common";
import { panelInfo } from "@/src/features/settings/controllers/ConfigManager";

interface PanelManagementProps {
    panels: Panel[];
    onUpdatePanels: (panels: Panel[]) => Promise<void>;
    editMode: boolean;
}

export const PanelManagement: React.FC<PanelManagementProps> = ({
    panels,
    onUpdatePanels,
    editMode,
}) => {
    const { getColor } = useTheme();
    const visiblePanels: Panel[] = panels.filter(p => p.visible);
    const hiddenPanels: Panel[] = panels.filter(p => !p.visible);

    const togglePanelVisibility = async (panelType: PanelType, visible: boolean) => {
        try {
            const updatedPanels = panels.map(panel => {
                if (panel.type === panelType) {
                    return { ...panel, visible };
                }
                return panel;
            });
            await onUpdatePanels(updatedPanels);
        } catch (error) {
            console.error(`failed to toggle panel visibility: ${error}`);
        }
    };

    const sections = [
        { title: 'Visible Panels', data: visiblePanels },
        { title: 'Hidden Panels', data: hiddenPanels }
    ];

    return (
        <View className="mb-5">
            <Text className="text-on-background text-base font-bold mb-4">Panel Arrangement</Text>

            {sections.map(section => (
                <View key={section.title} className="mb-4">
                    <Text className="text-on-background-variant text-sm mb-2">{section.title}</Text>

                    {section.data.map((panel, index) => (
                        <View key={index} className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg mb-2">
                            <View className="flex-row items-center">
                                <Ionicons
                                    name={panelInfo[panel.type].icon}
                                    size={24}
                                    color={panel.visible ? getColor("primary") : getColor("on-surface-variant")}
                                />
                                <Text className={`text-base ml-3 ${panel.visible ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                    {panelInfo[panel.type].title}
                                </Text>
                            </View>

                            {editMode && (
                                <TouchableOpacity
                                    onPress={() => togglePanelVisibility(panel.type, !panel.visible)}
                                >
                                    <Ionicons
                                        name={panel.visible ? 'eye-off' : 'eye'}
                                        size={24}
                                        color={getColor("primary")}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};