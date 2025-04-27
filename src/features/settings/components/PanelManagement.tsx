import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import { Panel, PanelType } from "@timothyw/pat-common";
import { panelInfo, useConfigStore } from "@/src/features/settings/controllers/ConfigStore";

interface PanelManagementProps {
    editMode: boolean;
}

export const PanelManagement: React.FC<PanelManagementProps> = ({
    editMode,
}) => {
    const { getColor } = useTheme();
    const { config, updateConfig } = useConfigStore();

    const panels = config?.iosApp.panels || [];
    const visiblePanels: Panel[] = panels.filter(p => p.visible);
    const hiddenPanels: Panel[] = panels.filter(p => !p.visible);

    const togglePanelVisibility = async (panelType: PanelType, visible: boolean) => {
        try {
            const updatedPanels: Panel[] = panels.map(panel => {
                if (panel.type === panelType) {
                    return { ...panel, visible };
                }
                return panel;
            });

            await updateConfig({
                iosApp: {
                    panels: updatedPanels
                }
            });
            console.log(`panel ${panelType} visibility toggled to ${visible}`)
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
                                        name={panel.visible ? 'eye' : 'eye-off'}
                                        size={24}
                                        color={panel.visible ? getColor("primary") : getColor("on-surface-variant")}
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