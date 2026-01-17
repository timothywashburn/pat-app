import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, useAnimatedReaction } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { useNavigationStore } from "@/src/stores/useNavigationStore";

interface DraggableListProps<T extends { section?: number; sortOrder?: number }> {
    data: T[];
    keyExtractor: (item: T) => string;
    renderItem: (data: {item: T, index: number, isEditMode: boolean}) => React.ReactNode;
    onReorder: (newData: T[]) => void;
    reorderable?: boolean;
    onEditModeChange?: (isEditing: boolean) => void;
    onSaveChanges?: () => void;
    onCancelChanges?: () => void;
    scrollViewRef?: React.RefObject<ScrollView | null>;
    scrollYRef?: React.MutableRefObject<number>;
}

// TODO: cancel button can be pressed during animation (reduce stiffness to make this obvious)
const springConfig = {
    damping: 20,
    stiffness: 200,
};

// TODO: has an issue where if you save before animation has finished it looks like order should be updated to new ordering but it gets immediately reverted because animation never completed
export function DraggableList<T extends { section?: number; sortOrder?: number }>({
    data,
    onReorder,
    renderItem,
    keyExtractor,
    reorderable = true,
    onEditModeChange,
    onSaveChanges,
    onCancelChanges,
    scrollViewRef,
    scrollYRef: externalScrollYRef,
}: DraggableListProps<T>) {
    const { getColor } = useTheme();
    const { setEnabled: setNavigationEnabled } = useNavigationStore();
    const [isEditMode, setIsEditMode] = useState(false);
    const containerRef = useRef<View>(null);
    const internalScrollYRef = useRef(0);
    const scrollYRef = externalScrollYRef || internalScrollYRef;
    const baseScrollY = useSharedValue(0);

    const [itemHeights, setItemHeights] = useState<Record<string, number>>({});
    const internalSortOrderRef = useRef<Record<string, number>>({});
    const positions = useSharedValue<Record<string, number>>({});
    const heights = useSharedValue<Record<string, number>>({});
    const order = useSharedValue<string[]>([]);
    const sections = useSharedValue<Record<string, number | undefined>>({});
    const activeKey = useSharedValue<string>('');
    const activeItemY = useSharedValue<number>(0);
    const dragStartPosition = useSharedValue<number>(0);
    const currentIndex = useSharedValue<number>(-1);
    const isDragging = useSharedValue<boolean>(false);
    const isAnimationBlockingGesture = useSharedValue<boolean>(false);
    const isInternallyReorderable = reorderable || isEditMode;
    const reorderableProgress = useSharedValue(isInternallyReorderable ? 1 : 0);
    const editModeHeaderHeight = useSharedValue(isEditMode ? 1 : 0);
    const flashingKey = useSharedValue<string>('');

    useEffect(() => {
        reorderableProgress.value = withSpring(isInternallyReorderable ? 1 : 0, springConfig);
    }, [isInternallyReorderable]);

    const updateScroll = (scroll: number) => {
        scrollViewRef?.current?.scrollTo({
            y: scroll,
            animated: false,
        });
    };

    const isTransitioningEditMode = useSharedValue(false);

    useAnimatedReaction(
        () => editModeHeaderHeight.value,
        (progress) => {
            if (!isTransitioningEditMode.value) return;

            const HEADER_HEIGHT = 72;
            const targetScroll = baseScrollY.value + (HEADER_HEIGHT * progress);
            runOnJS(updateScroll)(targetScroll);
        }
    );

    useEffect(() => {
        if (isEditMode) {
            baseScrollY.value = scrollYRef.current;
            isTransitioningEditMode.value = true;
            editModeHeaderHeight.value = withSpring(1, springConfig, () => {
                isTransitioningEditMode.value = false;
            });
        } else {
            const HEADER_HEIGHT = 72;
            baseScrollY.value = scrollYRef.current - HEADER_HEIGHT;
            isTransitioningEditMode.value = true;
            editModeHeaderHeight.value = withSpring(0, springConfig, () => {
                isTransitioningEditMode.value = false;
            });
        }
    }, [isEditMode]);

    useEffect(() => {
        onEditModeChange?.(isEditMode);
        setNavigationEnabled(!isEditMode);
    }, [isEditMode]);

    const enterEditMode = (itemKey: string) => {
        if (!reorderable && !isEditMode) {
            setIsEditMode(true);
            triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

            setTimeout(() => {
                flashingKey.value = '';
            }, 600);
        }
    };

    const handleSave = () => {
        setIsEditMode(false);
        onSaveChanges?.();
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        onCancelChanges?.();
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    };

    useEffect(() => {
        const allKeys = data.map(item => keyExtractor(item));
        const allMeasured = allKeys.every(key => itemHeights[key] !== undefined);

        if (!allMeasured) return;

        const currentSortOrder = internalSortOrderRef.current;
        data.forEach((item, index) => {
            const key = keyExtractor(item);
            if (currentSortOrder[key] === undefined) {
                currentSortOrder[key] = index;
            }
        });

        const hasSections = data.some(item => item.section !== undefined);

        let orderedData = [...data];

        if (hasSections) {
            const sectionGroups: Record<number, T[]> = {};

            data.forEach(item => {
                const section = item.section ?? 0;
                if (!sectionGroups[section]) {
                    sectionGroups[section] = [];
                }
                sectionGroups[section].push(item);
            });

            const sortedSectionNumbers = Object.keys(sectionGroups)
                .map(Number)
                .sort((a, b) => a - b);

            orderedData = sortedSectionNumbers.flatMap(section => {
                const items = sectionGroups[section];
                return items.sort((a, b) => {
                    const keyA = keyExtractor(a);
                    const keyB = keyExtractor(b);
                    const aOrder = currentSortOrder[keyA] ?? data.indexOf(a);
                    const bOrder = currentSortOrder[keyB] ?? data.indexOf(b);
                    if (aOrder !== bOrder) {
                        return aOrder - bOrder;
                    }
                    return data.indexOf(a) - data.indexOf(b);
                });
            });
        }

        const newPositions: Record<string, number> = {};
        const newOrder: string[] = [];
        const newSections: Record<string, number | undefined> = {};
        let cumulativeY = 0;

        orderedData.forEach((item, index) => {
            const key = keyExtractor(item);
            const section = item.section;

            newPositions[key] = cumulativeY;
            newOrder.push(key);
            newSections[key] = section;
            cumulativeY += itemHeights[key] || 0;
        });

        positions.value = newPositions;
        heights.value = itemHeights;
        order.value = newOrder;
        sections.value = newSections;

        orderedData.forEach((item, index) => {
            const key = keyExtractor(item);
            internalSortOrderRef.current[key] = index;
        });
    }, [data, itemHeights]);

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

    const getItemIndexAtY = (y: number, draggedItemKey: string) => {
        'worklet';
        const orderKeys = order.value;
        const draggedSection = sections.value[draggedItemKey];

        // If no section defined for dragged item, use default behavior
        if (draggedSection === undefined) {
            let cumulativeY = 0;
            for (let i = 0; i < orderKeys.length; i++) {
                const key = orderKeys[i];
                const height = heights.value[key] || 0;
                const midpoint = cumulativeY + height / 2;

                if (y < midpoint) {
                    return i;
                }
                cumulativeY += height;
            }
            return Math.max(0, orderKeys.length - 1);
        }

        let sectionStart = -1;
        let sectionEnd = -1;
        for (let i = 0; i < orderKeys.length; i++) {
            if (sections.value[orderKeys[i]] === draggedSection) {
                if (sectionStart === -1) sectionStart = i;
                sectionEnd = i;
            }
        }

        let cumulativeY = 0;
        for (let i = 0; i < orderKeys.length; i++) {
            const key = orderKeys[i];
            const height = heights.value[key] || 0;
            const midpoint = cumulativeY + height / 2;

            if (y < midpoint) {
                if (sectionStart !== -1 && i < sectionStart) return sectionStart;
                if (sectionEnd !== -1 && i > sectionEnd) return sectionEnd;
                return i;
            }

            cumulativeY += height;
        }

        return sectionEnd >= 0 ? sectionEnd : Math.max(0, orderKeys.length - 1);
    };

    const reorderItems = (fromIndex: number, toIndex: number) => {
        'worklet';
        if (fromIndex === toIndex) return false;

        const newOrder = [...order.value];

        const [movedKey] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedKey);

        const newPositions: Record<string, number> = {};
        let cumulativeY = 0;

        newOrder.forEach((key) => {
            newPositions[key] = cumulativeY;
            cumulativeY += heights.value[key] || 0;
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

        order.value.forEach((key, index) => {
            internalSortOrderRef.current[key] = index;
        });

        onReorder(newData);
    };

    const DraggableItem = ({ item, index }: { item: T; index: number }) => {
        const itemKey = keyExtractor(item);

        const handleLayout = (event: any) => {
            const { height } = event.nativeEvent.layout;
            setItemHeights(prev => {
                if (prev[itemKey] === height) return prev;
                return { ...prev, [itemKey]: height };
            });
        };

        const resetDragState = () => {
            'worklet';
            isAnimationBlockingGesture.value = true;

            const currentOrderIndex = order.value.indexOf(itemKey);
            if (currentOrderIndex >= 0) {
                const targetKey = order.value[currentOrderIndex];
                const targetY = positions.value[targetKey];
                activeItemY.value = withSpring(targetY, springConfig, () => {
                    isAnimationBlockingGesture.value = false;
                });
            } else {
                isAnimationBlockingGesture.value = false;
            }

            isDragging.value = false;
            activeKey.value = '';
            flashingKey.value = '';
        };

        const animatedStyle = useAnimatedStyle(() => {
            const isActive = activeKey.value === itemKey;
            const isFlashing = flashingKey.value === itemKey && !isActive;
            const targetY = isActive
                ? activeItemY.value
                : (positions.value[itemKey] ?? 0);

            // Priority: active drag (0.8) > flashing (0.6) > normal (1.0)
            let targetOpacity = 1.0;
            if (isActive) {
                targetOpacity = 0.8;
            } else if (isFlashing) {
                targetOpacity = 0.6;
            }

            return {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: [
                    { translateY: isActive ? targetY : withSpring(targetY, springConfig) },
                    { scale: withSpring(isActive ? 1.06 : 1, springConfig) },
                ],
                opacity: withSpring(targetOpacity, isActive ? springConfig : { damping: 15, stiffness: 300 }),
                zIndex: isActive ? 999 : index,
                elevation: isActive ? 8 : 0,
            };
        });

        const dragHandleStyle = useAnimatedStyle(() => {
            return {
                width: reorderableProgress.value * 24,
                marginRight: reorderableProgress.value * 12,
                opacity: reorderableProgress.value,
                overflow: 'hidden',
            };
        });

        const longPressGesture = Gesture.LongPress()
            .enabled(!reorderable && !isEditMode)
            .minDuration(500)
            .onBegin(() => { // when the finger touches down
                if (isAnimationBlockingGesture.value) return;

                flashingKey.value = itemKey;
            })
            .onStart(() => { // when the gesture is recognized (after minDuration)
                if (isAnimationBlockingGesture.value) return;

                runOnJS(enterEditMode)(itemKey);
            })
            .onTouchesUp(() => {
                if (!isEditMode) { // if the finger is lifted early
                    flashingKey.value = '';
                }
            })
            .onTouchesCancelled(() => { // if canceled; happens if scrolling starts
                if (!isEditMode) flashingKey.value = '';
            })
            .onFinalize(() => { // no idea
                if (!isEditMode) flashingKey.value = '';
            });

        const panGesture = Gesture.Pan()
            .enabled(isInternallyReorderable)
            .activateAfterLongPress(150)
            .onBegin(() => {
                if (isAnimationBlockingGesture.value) return;
                flashingKey.value = itemKey;
            })
            .onStart(() => {
                if (isAnimationBlockingGesture.value) return;

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

                // Clear the flash since active state will take over
                flashingKey.value = '';

                runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
            })
            .onUpdate((event) => {
                if (!isDragging.value || activeKey.value !== itemKey) return;

                activeItemY.value = dragStartPosition.value + event.translationY;

                const targetIndex = getItemIndexAtY(activeItemY.value, itemKey);
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

                // runOnJS(logDebug)('=== DRAG END ===');
                // runOnJS(logDebug)('Data index', index);
                // runOnJS(logDebug)('Current position in order', currentIndex.value);
                // runOnJS(logDebug)('Final order', [...order.value]);

                isAnimationBlockingGesture.value = true;

                const finalKey = order.value[currentIndex.value];
                const finalY = positions.value[finalKey];
                activeItemY.value = withSpring(finalY, springConfig, () => {
                    runOnJS(finalizeReorder)();
                    isAnimationBlockingGesture.value = false;
                });

                isDragging.value = false;
                activeKey.value = '';

                runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Heavy);
            })
            .onTouchesUp(() => {
                // Clean up flash if we didn't start dragging
                if (!isDragging.value) {
                    flashingKey.value = '';
                }
            })
            .onTouchesCancelled(() => {
                if (isDragging.value && activeKey.value === itemKey) {
                    resetDragState();
                    runOnJS(logDebug)('Drag gesture cancelled - resetting state');
                } else {
                    flashingKey.value = '';
                }
            })
            .onFinalize(() => {
                if (activeKey.value === itemKey && isDragging.value) {
                    resetDragState();
                    runOnJS(logDebug)('Gesture finalized with active drag - force reset');
                } else if (!isDragging.value) {
                    flashingKey.value = '';
                }
            });

        const combinedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

        return (
            <GestureDetector gesture={combinedGesture}>
                <Animated.View style={animatedStyle} onLayout={handleLayout}>
                    <View className="flex-row items-center mb-3">
                        {/*<Animated.View style={dragHandleStyle}>*/}
                        {/*    <Ionicons*/}
                        {/*        name="reorder-three"*/}
                        {/*        size={24}*/}
                        {/*        color={getColor("on-surface-variant")}*/}
                        {/*    />*/}
                        {/*</Animated.View>*/}
                        <View className="flex-1">
                            {renderItem({ item, index, isEditMode })}
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        );
    };

    // Calculate total height from all measured heights
    const totalHeight = Object.values(itemHeights).reduce((sum, h) => sum + h, 0);

    const editModeHeaderStyle = useAnimatedStyle(() => {
        const headerHeight = 60;
        return {
            height: editModeHeaderHeight.value * headerHeight,
            opacity: editModeHeaderHeight.value,
            marginBottom: editModeHeaderHeight.value * 12,
            overflow: 'hidden',
        };
    });

    const listContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: editModeHeaderHeight.value * 72 }
            ],
        };
    });

    const containerStyle = useAnimatedStyle(() => {
        const HEADER_HEIGHT = 72;
        return {
            height: totalHeight + (editModeHeaderHeight.value * HEADER_HEIGHT),
        };
    });

    if (data.length === 0) return null;

    return (
        <Animated.View ref={containerRef} style={containerStyle} className="relative">
            <Animated.View style={editModeHeaderStyle} className="absolute top-0 left-0 right-0">
                <View className="flex-row items-center justify-between bg-primary-container rounded-lg px-4 py-3 mx-1">
                    <View className="flex-row items-center flex-1">
                        <Ionicons
                            name="create-outline"
                            size={20}
                            color={getColor("on-primary-container")}
                        />
                        <Text className="text-on-primary-container text-base font-medium ml-3">
                            Editing Mode
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="bg-surface-variant rounded-lg px-4 py-2"
                        >
                            <Text className="text-on-surface-variant text-sm font-semibold">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-primary rounded-lg px-4 py-2"
                        >
                            <Text className="text-on-primary text-sm font-semibold">
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            <Animated.View
                style={[listContainerStyle, { height: totalHeight || undefined }]}
                className="relative overflow-visible"
            >
                {data.map((item, index) => (
                    <DraggableItem
                        key={keyExtractor(item)}
                        item={item}
                        index={index}
                    />
                ))}
            </Animated.View>
        </Animated.View>
    );
}
