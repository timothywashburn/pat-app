import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DevPanelSection from './DevPanelSection';
import { DraggableList } from '@/src/components/common/DraggableList';
import { useTheme } from '@/src/context/ThemeContext';

interface DemoItem {
    id: string;
    name: string;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
}

const INITIAL_DEMO_ITEMS: DemoItem[] = [
    {
        id: '1',
        name: 'Task Management',
        color: '#FF6B6B',
        icon: 'checkmark-circle',
        description: 'Organize your daily tasks',
    },
    {
        id: '2',
        name: 'Calendar Events',
        color: '#4ECDC4',
        icon: 'calendar',
        description: 'Schedule and track events',
    },
    {
        id: '3',
        name: 'Notes',
        color: '#FFE66D',
        icon: 'document-text',
        description: 'Quick notes and ideas',
    },
    {
        id: '4',
        name: 'Reminders',
        color: '#95E1D3',
        icon: 'notifications',
        description: 'Never forget important things',
    },
    {
        id: '5',
        name: 'Projects',
        color: '#A8E6CF',
        icon: 'folder',
        description: 'Manage long-term projects',
    },
];

interface DraggableListSectionProps {
    scrollViewRef?: React.RefObject<ScrollView>;
    scrollYRef?: React.MutableRefObject<number>;
}

const DraggableListSection: React.FC<DraggableListSectionProps> = ({ scrollViewRef, scrollYRef }) => {
    const { getColor } = useTheme();
    const [items, setItems] = useState<DemoItem[]>(INITIAL_DEMO_ITEMS);
    const [savedItems, setSavedItems] = useState<DemoItem[]>(INITIAL_DEMO_ITEMS);
    const [reorderable, setReorderable] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const handleReorder = (newData: DemoItem[]) => {
        setItems(newData);
    };

    const handleSave = () => {
        setSavedItems(items);
        console.log('Items saved:', items.map(item => item.name));
    };

    const handleCancel = () => {
        setItems(savedItems);
        console.log('Changes cancelled, restored to:', savedItems.map(item => item.name));
    };

    return (
        <DevPanelSection title="Draggable List Demo" bgClassName="bg-background">
            <View className="mb-4">
                <TouchableOpacity
                    onPress={() => setReorderable(!reorderable)}
                    disabled={isEditMode}
                    className="flex-row items-center justify-between bg-surface rounded-lg px-4 py-3"
                    style={{ opacity: isEditMode ? 0.5 : 1 }}
                >
                    <View className="flex-row items-center">
                        <Ionicons
                            name={reorderable ? "lock-open" : "lock-closed"}
                            size={20}
                            color={getColor("on-surface-variant")}
                            className="mr-3"
                        />
                        <Text className="text-on-surface text-base font-medium">
                            Always Reorderable
                        </Text>
                    </View>
                    <View
                        className="px-3 py-1 rounded-full"
                        style={{
                            backgroundColor: reorderable
                                ? getColor("primary-container")
                                : getColor("surface")
                        }}
                    >
                        <Text
                            className="text-xs font-semibold"
                            style={{
                                color: reorderable
                                    ? getColor("on-primary-container")
                                    : getColor("on-surface-variant"),
                            }}
                        >
                            {reorderable ? 'ON' : 'OFF'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <DraggableList
                data={items}
                onReorder={handleReorder}
                keyExtractor={(item) => item.id}
                reorderable={reorderable}
                onEditModeChange={setIsEditMode}
                onSaveChanges={handleSave}
                onCancelChanges={handleCancel}
                scrollViewRef={scrollViewRef}
                scrollYRef={scrollYRef}
                renderItem={({ item, index }) => {
                    return (
                        <>
                            <View
                                className="rounded-full items-center justify-center w-10 h-10 mr-3"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            >
                                <Ionicons name={item.icon} size={24} color="white" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-on-surface text-base font-semibold">
                                    {item.name}
                                </Text>
                                <Text className="text-on-surface-variant text-sm">
                                    {item.description}
                                </Text>
                            </View>

                            <View className="bg-primary rounded-full w-6 h-6 items-center justify-center ml-2">
                                <Text className="text-on-primary text-xs font-bold">
                                    {index + 1}
                                </Text>
                            </View>
                        </>
                    )
                }}
            />
        </DevPanelSection>
    );
};

export default DraggableListSection;
