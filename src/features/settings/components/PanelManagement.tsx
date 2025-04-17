import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeManager';
import { PanelSetting } from '@/src/features/settings/models';

const getIconName = (iconKey: string): any => {
    const iconMap: Record<string, any> = {
        'calendar': 'calendar',
        'mail': 'mail',
        'list': 'list',
        'people': 'people',
        'settings': 'settings',
    };

    return iconMap[iconKey] || 'apps';
};

interface PanelManagementProps {
    panels: PanelSetting[];
    onUpdatePanels: (panels: PanelSetting[]) => Promise<void>;
    editMode: boolean;
}

export const PanelManagement: React.FC<PanelManagementProps> = ({
    panels,
    onUpdatePanels,
    editMode,
}) => {
    const { getColor } = useTheme();
    const visiblePanels = panels.filter(p => p.visible);
    const hiddenPanels = panels.filter(p => !p.visible);

    const togglePanelVisibility = async (panelId: string, visible: boolean) => {
        try {
            const updatedPanels = panels.map(panel =>
                panel.id === panelId
                    ? { ...panel, visible }
                    : panel
            );
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
            <Text className="text-base font-bold text-primary mb-4">Panel Arrangement</Text>

            {sections.map(section => (
                <View key={section.title} className="mb-4">
                    <Text className="text-sm text-secondary mb-2">{section.title}</Text>

                    {section.data.map(panel => (
                        <View key={panel.id} className="flex-row justify-between items-center py-3 px-4 bg-surface rounded-lg mb-2">
                            <View className="flex-row items-center">
                                <Ionicons
                                    name={getIconName(panel.panel.icon)}
                                    size={24}
                                    color={panel.visible ? getColor("primary") : getColor("unknown")}
                                />
                                <Text className={`text-base ml-3 ${panel.visible ? 'text-primary' : 'text-secondary'}`}>
                                    {panel.panel.title}
                                </Text>
                            </View>

                            {editMode && (
                                <TouchableOpacity
                                    onPress={() => togglePanelVisibility(panel.id, !panel.visible)}
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