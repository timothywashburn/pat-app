import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";

interface DraggableListProps<T> {
    data: T[];
    keyExtractor: (item: T) => string;
    renderItem: (data: {item: T, index: number}) => React.ReactNode;
    itemHeight: number;
    onReorder: (newData: T[]) => void;
}

const springConfig = {
    damping: 20,
    stiffness: 200,
};

export function DraggableList<T>({
    data,
    onReorder,
    renderItem,
    keyExtractor,
    itemHeight,
}: DraggableListProps<T>) {
    const { getColor } = useTheme();

    const positions = useSharedValue<Record<string, number>>({});
    const order = useSharedValue<string[]>([]);
    const activeKey = useSharedValue<string>('');
    const activeItemY = useSharedValue<number>(0);
    const dragStartPosition = useSharedValue<number>(0);
    const currentIndex = useSharedValue<number>(-1);
    const isDragging = useSharedValue<boolean>(false);

    useEffect(() => {
        const newPositions: Record<string, number> = {};
        const newOrder: string[] = [];

        data.forEach((item, index) => {
            const key = keyExtractor(item);
            newPositions[key] = index * itemHeight;
            newOrder.push(key);
        });

        positions.value = newPositions;
        order.value = newOrder;
    }, [data, itemHeight]);

    const triggerHaptic = async (style: Haptics.ImpactFeedbackStyle) => {
        try {
            await Haptics.impactAsync(style);
        } catch (err) {
            console.log('haptics not available:', err);
        }
    };

    const logDebug = (message: string, data?: any) => {
        if (data !== undefined) {
            console.log(`[DraggableList] ${message}:`, data);
        } else {
            console.log(`[DraggableList] ${message}`);
        }
    };

    const getItemIndexAtY = (y: number) => {
        'worklet';
        return Math.max(0, Math.min(data.length - 1, Math.round(y / itemHeight)));
    };

    const reorderItems = (fromIndex: number, toIndex: number) => {
        'worklet';
        if (fromIndex === toIndex) return false;

        const newOrder = [...order.value];

        const [movedKey] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedKey);

        const newPositions: Record<string, number> = {};
        newOrder.forEach((key, orderIndex) => {
            newPositions[key] = orderIndex * itemHeight;
        });

        positions.value = newPositions;
        order.value = newOrder;

        return true;
    };

    const finalizeReorder = () => {
        const keyToItem = new Map<string, T>();
        data.forEach(item => {
            const key = keyExtractor(item);
            keyToItem.set(key, item);
        });

        const newData = order.value.map((key) => keyToItem.get(key)!);
        onReorder(newData);
    };

    const DraggableItem = ({ item, index }: { item: T; index: number }) => {
        const itemKey = keyExtractor(item);

        const animatedStyle = useAnimatedStyle(() => {
            const isActive = activeKey.value === itemKey;
            const targetY = isActive
                ? activeItemY.value
                : (positions.value[itemKey] ?? index * itemHeight);

            return {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: itemHeight,
                transform: [
                    { translateY: isActive ? targetY : withSpring(targetY, springConfig) },
                    { scale: withSpring(isActive ? 1.05 : 1, springConfig) },
                ],
                zIndex: isActive ? 999 : index,
                elevation: isActive ? 8 : 0,
            };
        });

        const panGesture = Gesture.Pan()
            .activateAfterLongPress(150)
            .onStart(() => {
                isDragging.value = true;
                activeKey.value = itemKey;
                // Find current position in order array
                currentIndex.value = order.value.indexOf(itemKey);
                dragStartPosition.value = positions.value[itemKey];
                activeItemY.value = positions.value[itemKey];

                // runOnJS(logDebug)('=== DRAG START ===');
                // runOnJS(logDebug)('Item key', itemKey);
                // runOnJS(logDebug)('Item data index', index);
                // runOnJS(logDebug)('Item position in order', currentIndex.value);
                // runOnJS(logDebug)('Starting Y', positions.value[itemKey]);
                // runOnJS(logDebug)('All positions', positions.value);
                // runOnJS(logDebug)('Initial order', [...order.value]);

                runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
            })
            .onUpdate((event) => {
                if (!isDragging.value || activeKey.value !== itemKey) return;

                activeItemY.value = dragStartPosition.value + event.translationY;

                const targetIndex = getItemIndexAtY(activeItemY.value);
                const fromIndex = currentIndex.value;

                // runOnJS(logDebug)('--- REORDER ATTEMPT ---');
                // runOnJS(logDebug)('Moving from index', fromIndex);
                // runOnJS(logDebug)('To index', targetIndex);
                // runOnJS(logDebug)('Order BEFORE', [...order.value]);

                const didReorder = reorderItems(fromIndex, targetIndex);

                if (didReorder) {
                    currentIndex.value = targetIndex;

                    // runOnJS(logDebug)('Order AFTER', [...order.value]);
                    // runOnJS(logDebug)('Updated currentIndex to', targetIndex);
                    // runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
                }
            })
            .onEnd(() => {
                if (!isDragging.value || activeKey.value !== itemKey) return;

                runOnJS(logDebug)('=== DRAG END ===');
                runOnJS(logDebug)('Data index', index);
                runOnJS(logDebug)('Current position in order', currentIndex.value);
                runOnJS(logDebug)('Final order', [...order.value]);

                const finalY = currentIndex.value * itemHeight;
                activeItemY.value = withSpring(finalY, springConfig, () => {
                    runOnJS(finalizeReorder)();
                });

                isDragging.value = false;
                activeKey.value = '';

                runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Heavy);
            });

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={animatedStyle}>
                    <View className="flex-1 flex-row items-center bg-background rounded-lg px-4 mx-1 my-1.5">
                        <Ionicons
                            name="reorder-three"
                            size={24}
                            color={getColor("on-surface-variant")}
                            className="mr-3"
                        />
                        {renderItem({ item, index })}
                    </View>
                </Animated.View>
            </GestureDetector>
        );
    };

    if (data.length === 0) return null;

    return (
        <View
            className="relative overflow-visible"
            style={{ height: data.length * itemHeight }}
        >
            {data.map((item, index) => (
                <DraggableItem
                    key={keyExtractor(item)}
                    item={item}
                    index={index}
                />
            ))}
        </View>
    );
}
