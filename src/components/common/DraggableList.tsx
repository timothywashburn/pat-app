import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface DraggableListProps<T> {
    data: T[];
    onReorder: (newData: T[]) => void;
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
    keyExtractor: (item: T, index: number) => string;
    itemHeight: number;
    dragActiveScale?: number;
    dragActiveElevation?: number;
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
    dragActiveScale = 1.05,
    dragActiveElevation = 8,
}: DraggableListProps<T>) {
    // Track positions by key instead of index
    const positions = useSharedValue<Record<string, number>>({});
    const order = useSharedValue<string[]>([]); // Array of keys in visual order
    const activeKey = useSharedValue<string>('');
    const activeItemY = useSharedValue<number>(0);
    const dragStartPosition = useSharedValue<number>(0);
    const currentIndex = useSharedValue<number>(-1);
    const isDragging = useSharedValue<boolean>(false);

    // Update positions when data changes
    useEffect(() => {
        const newPositions: Record<string, number> = {};
        const newOrder: string[] = [];

        data.forEach((item, index) => {
            const key = keyExtractor(item, index);
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

        // Remove key from old position and insert at new position
        const [movedKey] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedKey);

        // Update positions: each key gets positioned based on its index in the new order
        const newPositions: Record<string, number> = {};
        newOrder.forEach((key, orderIndex) => {
            newPositions[key] = orderIndex * itemHeight;
        });

        positions.value = newPositions;
        order.value = newOrder;

        return true;
    };

    const finalizeReorder = () => {
        // Convert order of keys back to order of data items
        const keyToItem = new Map<string, T>();
        data.forEach((item, index) => {
            const key = keyExtractor(item, index);
            keyToItem.set(key, item);
        });

        const newData = order.value.map((key) => keyToItem.get(key)!);
        onReorder(newData);
    };

    const DraggableItem = ({ item, index }: { item: T; index: number }) => {
        const itemKey = keyExtractor(item, index);

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
                    { scale: withSpring(isActive ? dragActiveScale : 1, springConfig) },
                ],
                zIndex: isActive ? 999 : index,
                elevation: isActive ? dragActiveElevation : 0,
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

                runOnJS(logDebug)('=== DRAG START ===');
                runOnJS(logDebug)('Item key', itemKey);
                runOnJS(logDebug)('Item data index', index);
                runOnJS(logDebug)('Item position in order', currentIndex.value);
                runOnJS(logDebug)('Starting Y', positions.value[itemKey]);
                runOnJS(logDebug)('All positions', positions.value);
                runOnJS(logDebug)('Initial order', [...order.value]);

                runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
            })
            .onUpdate((event) => {
                if (!isDragging.value || activeKey.value !== itemKey) return;

                activeItemY.value = dragStartPosition.value + event.translationY;

                const targetIndex = getItemIndexAtY(activeItemY.value);
                const fromIndex = currentIndex.value;

                if (targetIndex !== fromIndex) {
                    runOnJS(logDebug)('--- REORDER ATTEMPT ---');
                    runOnJS(logDebug)('Moving from index', fromIndex);
                    runOnJS(logDebug)('To index', targetIndex);
                    runOnJS(logDebug)('Order BEFORE', [...order.value]);

                    const didReorder = reorderItems(fromIndex, targetIndex);

                    if (didReorder) {
                        // Update currentIndex to track where the item is now
                        currentIndex.value = targetIndex;

                        runOnJS(logDebug)('Order AFTER', [...order.value]);
                        runOnJS(logDebug)('Updated currentIndex to', targetIndex);
                        runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
                    }
                }
            })
            .onEnd(() => {
                if (!isDragging.value || activeKey.value !== itemKey) return;

                runOnJS(logDebug)('=== DRAG END ===');
                runOnJS(logDebug)('Data index', index);
                runOnJS(logDebug)('Current position in order', currentIndex.value);
                runOnJS(logDebug)('Final order', [...order.value]);

                // Snap to final position based on current position in order, not data index
                const finalY = currentIndex.value * itemHeight;
                activeItemY.value = withSpring(finalY, springConfig, () => {
                    // Only finalize after animation completes
                    runOnJS(finalizeReorder)();
                });

                isDragging.value = false;
                activeKey.value = '';

                runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Heavy);
            });

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={animatedStyle}>
                    {renderItem(item, index, activeKey.value === itemKey)}
                </Animated.View>
            </GestureDetector>
        );
    };

    if (data.length === 0) {
        return null;
    }

    return (
        <View style={{ overflow: 'visible', height: data.length * itemHeight, position: 'relative' }}>
            {data.map((item, index) => (
                <DraggableItem
                    key={keyExtractor(item, index)}
                    item={item}
                    index={index}
                />
            ))}
        </View>
    );
}
