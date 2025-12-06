import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DevPanelSection from './DevPanelSection';
import { DraggableList } from '@/src/components/common/DraggableList';
import { useTheme } from '@/src/context/ThemeContext';

interface DemoItem {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
    section: number;
}

const INITIAL_DEMO_ITEMS: DemoItem[] = [
    {
        id: '1',
        name: 'Task Management',
        icon: 'checkmark-circle',
        description: 'Organize your daily tasks',
        section: 0,
    },
    {
        id: '2',
        name: 'Calendar Events',
        icon: 'calendar',
        description: 'Schedule and track events',
        section: 0,
    },
    {
        id: '3',
        name: 'Notes',
        icon: 'document-text',
        description: 'Quick notes and ideas',
        section: 0,
    },
    {
        id: '4',
        name: 'Reminders',
        icon: 'notifications',
        description: 'Never forget things',
        section: 1,
    },
    {
        id: '5',
        name: 'Projects',
        icon: 'folder',
        description: 'Manage long-term projects',
        section: 1,
    },
];

interface DraggableListSectionProps {
    scrollViewRef?: React.RefObject<ScrollView | null>;
    scrollYRef?: React.MutableRefObject<number>;
}

const DraggableListSection: React.FC<DraggableListSectionProps> = ({ scrollViewRef, scrollYRef }) => {
    const { getColor } = useTheme();
    const [items, setItems] = useState<DemoItem[]>(INITIAL_DEMO_ITEMS);
    const [savedItems, setSavedItems] = useState<DemoItem[]>(INITIAL_DEMO_ITEMS);
    const [reorderable, setReorderable] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        console.log('Items updated:', items.map(item => item.name));
    }, [items]);

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

    const handleToggleSection = (itemId: string) => {
        setItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === itemId) {
                    return { ...item, section: item.section === 0 ? 1 : 0 };
                }
                return item;
            });
        });
    };

    return (
        <DevPanelSection title="Draggable List Demo" bgClassName="bg-background">
            <DraggableList
                reorderable={reorderable}
                data={items}
                onReorder={handleReorder}
                keyExtractor={(item) => item.id}
                onEditModeChange={setIsEditMode}
                onSaveChanges={handleSave}
                onCancelChanges={handleCancel}
                scrollViewRef={scrollViewRef}
                scrollYRef={scrollYRef}
                renderItem={({ item, index }) => {
                    return (
                        <View className="flex-row items-center bg-surface rounded-lg px-4 py-3">
                            <View
                                className="rounded-full items-center justify-center w-10 h-10 mr-3"
                                style={{
                                    backgroundColor: item.section === 0 ? '#FF6B6B' : '#95E1D3',
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

                            <TouchableOpacity
                                onPress={() => handleToggleSection(item.id)}
                                className="bg-secondary rounded-full w-8 h-8 items-center justify-center ml-2"
                            >
                                <Ionicons
                                    name={item.section === 0 ? 'arrow-down' : 'arrow-up'}
                                    size={16}
                                    color={getColor('on-secondary')}
                                />
                            </TouchableOpacity>

                            <View className="bg-primary rounded-full w-6 h-6 items-center justify-center ml-2">
                                <Text className="text-on-primary text-xs font-bold">
                                    {index + 1}
                                </Text>
                            </View>
                        </View>
                    )
                }}
            />
        </DevPanelSection>
    );
};

export default DraggableListSection;
