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

const ITEM_HEIGHT = 80;

const DraggableListSection = () => {
    const [items, setItems] = useState<DemoItem[]>(INITIAL_DEMO_ITEMS);

    const handleReorder = (newData: DemoItem[]) => {
        setItems(newData);
        console.log('Items reordered:', newData.map(item => item.name));
    };

    const renderItem = (item: DemoItem, index: number, isDragging: boolean) => {
        return (
            <View
                className={`flex-1 flex-row items-center px-4 bg-background rounded-lg mx-1 ${
                    isDragging ? 'opacity-90' : ''
                }`}
                style={{
                    height: ITEM_HEIGHT - 10,
                    marginVertical: 5,
                }}
            >
                {/* Drag handle icon */}
                <Ionicons
                    name="reorder-three"
                    size={24}
                    color="#666"
                    style={{ marginRight: 12 }}
                />

                {/* Item icon with color */}
                <View
                    className="rounded-full items-center justify-center"
                    style={{
                        width: 40,
                        height: 40,
                        backgroundColor: item.color,
                        marginRight: 12,
                    }}
                >
                    <Ionicons name={item.icon} size={24} color="white" />
                </View>

                {/* Item text */}
                <View className="flex-1">
                    <Text className="text-on-surface text-base font-semibold">
                        {item.name}
                    </Text>
                    <Text className="text-on-surface-variant text-sm">
                        {item.description}
                    </Text>
                </View>

                {/* Index indicator */}
                <View className="bg-primary rounded-full w-6 h-6 items-center justify-center ml-2">
                    <Text className="text-on-primary text-xs font-bold">
                        {index + 1}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <DevPanelSection title="Draggable List Demo">
            <Text className="text-on-surface-variant text-sm mb-4">
                Long press and drag to reorder items. Notice the haptic feedback!
            </Text>

            <DraggableList
                data={items}
                onReorder={handleReorder}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                itemHeight={ITEM_HEIGHT}
                dragActiveScale={1.05}
                dragActiveElevation={8}
            />
        </DevPanelSection>
    );
};

export default DraggableListSection;
