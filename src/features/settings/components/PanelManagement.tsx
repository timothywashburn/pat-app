import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={styles.container}>
            <Text style={styles.mainTitle}>Panel Arrangement</Text>

            {sections.map(section => (
                <View key={section.title} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>

                    {section.data.map(panel => (
                        <View key={panel.id} style={styles.panelRow}>
                            <View style={styles.panelInfo}>
                                <Ionicons
                                    name={getIconName(panel.panel.icon)}
                                    size={24}
                                    color={panel.visible ? '#007AFF' : '#8E8E93'}
                                />
                                <Text style={[
                                    styles.panelTitle,
                                    !panel.visible && styles.hiddenText
                                ]}>
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
                                        color="#007AFF"
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

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
    },
    panelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 8,
    },
    panelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    panelTitle: {
        fontSize: 16,
        marginLeft: 12,
    },
    hiddenText: {
        color: '#8E8E93',
    },
});