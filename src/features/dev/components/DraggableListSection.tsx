import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DevPanelSection from './DevPanelSection';
import { DraggableList } from '@/src/components/common/DraggableList';

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
        color: 'bg-red-500',
        icon: 'checkmark-circle',
        description: 'Organize your daily tasks',
    },
    {
        id: '2',
        name: 'Calendar Events',
        color: 'orange-600',
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
        color: '',
        icon: 'folder',
        description: 'Manage long-term projects',
    },
];

const ITEM_HEIGHT = 80;

const DraggableListSection = () => {
    const [items, setItems] = useState<DemoItem[]>(INITIAL_DEMO_ITEMS);

    const handleReorder = (newData: DemoItem[]) => {
        setItems(newData);
        console.log('Items reordered:', newData.map(item => item.name));
    };

    return (
        <DevPanelSection title="Draggable List Demo">
            <Text className="text-on-surface-variant text-sm mb-4">
                Long press and drag to reorder items. Notice the haptic feedback!
            </Text>

            <DraggableList
                data={items}
                onReorder={handleReorder}
                keyExtractor={(item) => item.id}
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
                itemHeight={ITEM_HEIGHT}
            />
        </DevPanelSection>
    );
};

export default DraggableListSection;
