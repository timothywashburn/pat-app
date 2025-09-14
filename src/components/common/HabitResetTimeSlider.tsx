import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const MINUTE_INCREMENT = 30;
const MIN_DISTANCE_MINUTES = 60 * 4;
const MAX_DURATION_MINUTES = 24 * 60;

interface HabitResetTimeSliderProps {
    startOffsetMinutes: number;
    endOffsetMinutes: number;
    onStartOffsetChange?: (offset: number) => void;
    onEndOffsetChange?: (offset: number) => void;
    readOnly?: boolean;
}

const HabitResetTimeSlider: React.FC<HabitResetTimeSliderProps> = ({ startOffsetMinutes, endOffsetMinutes, onStartOffsetChange, onEndOffsetChange, readOnly = false }) => {
    // TODO: definitely need to figure out a less cursed way of doing this
    const screenWidth = Dimensions.get('window').width;
    const sliderWidth = screenWidth - 80;
    const thumbSize = 20;
    const trackHeight = 2;

    const startTranslateX = useSharedValue(0);
    const endTranslateX = useSharedValue(0);
    const startStartX = useSharedValue(0);
    const endStartX = useSharedValue(0);
    const isStartDragging = useSharedValue(false);
    const isEndDragging = useSharedValue(false);
    const activeThumb = useSharedValue<'start' | 'end' | null>(null);

    const minutesToDisplayString = (totalMinutes: number): string => {
        const day = Math.floor(totalMinutes / (24 * 60));
        const remainingMinutes = totalMinutes % (24 * 60);
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;

        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        return day > 0 ? `${day}d + ${timeStr}` : timeStr;
    };

    const [currentStartDisplayTime, setCurrentStartDisplayTime] = React.useState(minutesToDisplayString(startOffsetMinutes));
    const [currentEndDisplayTime, setCurrentEndDisplayTime] = React.useState(minutesToDisplayString(endOffsetMinutes));

    const minutesToPosition = (totalMinutes: number): number => {
        'worklet';
        return totalMinutes / (48 * 60 - MINUTE_INCREMENT);
    };

    const snapPositions = [0, 0.25, 0.5, 0.75, 1];
    const snapThreshold = 0.03;

    const positionToMinutes = (position: number): number => {
        'worklet';

        for (const snapPos of snapPositions) {
            if (Math.abs(position - snapPos) < snapThreshold) {
                const snapMinutes = Math.round(snapPos * (48 * 60 - MINUTE_INCREMENT));
                return Math.round(snapMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;
            }
        }

        const totalMinutes = Math.round(position * (48 * 60 - MINUTE_INCREMENT));
        return Math.round(totalMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;
    };

    React.useEffect(() => {
        const initialStartPosition = minutesToPosition(startOffsetMinutes);
        const initialEndPosition = minutesToPosition(endOffsetMinutes);
        startTranslateX.value = initialStartPosition * (sliderWidth - thumbSize);
        endTranslateX.value = initialEndPosition * (sliderWidth - thumbSize);
    }, [startOffsetMinutes, endOffsetMinutes, sliderWidth, thumbSize]);

    const positionToMinutesRaw = (position: number): number => {
        const totalMinutes = Math.round(position * (48 * 60 - MINUTE_INCREMENT));
        return Math.round(totalMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;
    };

    const updateDisplayTime = (x: number, isStart: boolean, useRaw = false) => {
        const position = x / (sliderWidth - thumbSize);
        const totalMinutes = useRaw ? positionToMinutesRaw(position) : positionToMinutes(position);
        const displayString = minutesToDisplayString(totalMinutes);

        if (isStart) {
            setCurrentStartDisplayTime(displayString);
            onStartOffsetChange?.(totalMinutes);
        } else {
            setCurrentEndDisplayTime(displayString);
            onEndOffsetChange?.(totalMinutes);
        }
    };

    const adjustTime = (isStart: boolean, increment: boolean) => {
        const translateX = isStart ? startTranslateX : endTranslateX;
        const otherTranslateX = isStart ? endTranslateX : startTranslateX;

        const currentPosition = translateX.value / (sliderWidth - thumbSize);
        const currentMinutes = positionToMinutesRaw(currentPosition);
        const otherPosition = otherTranslateX.value / (sliderWidth - thumbSize);
        const otherMinutes = positionToMinutesRaw(otherPosition);

        let newMinutes = currentMinutes + (increment ? MINUTE_INCREMENT : -MINUTE_INCREMENT);

        // Check if the new position would exceed max duration and push the other tack
        const duration = Math.abs(newMinutes - otherMinutes);
        if (duration > MAX_DURATION_MINUTES) {
            if (isStart) {
                // If start is moving and would exceed max duration, move end tack
                const newEndMinutes = newMinutes + MAX_DURATION_MINUTES;
                if (newEndMinutes <= 48 * 60 - MINUTE_INCREMENT) {
                    // Move end tack to maintain max duration
                    const newEndPosition = newEndMinutes / (48 * 60 - MINUTE_INCREMENT);
                    const newEndX = newEndPosition * (sliderWidth - thumbSize);
                    endTranslateX.value = newEndX;
                    runOnJS(updateDisplayTime)(newEndX, false, true);
                }
            } else {
                // If end is moving and would exceed max duration, move start tack
                const newStartMinutes = newMinutes - MAX_DURATION_MINUTES;
                if (newStartMinutes >= 0) {
                    // Move start tack to maintain max duration
                    const newStartPosition = newStartMinutes / (48 * 60 - MINUTE_INCREMENT);
                    const newStartX = newStartPosition * (sliderWidth - thumbSize);
                    startTranslateX.value = newStartX;
                    runOnJS(updateDisplayTime)(newStartX, true, true);
                }
            }
        }

        // Apply normal constraints (min distance and bounds)
        if (isStart) {
            const maxFromMinDistance = otherMinutes - MIN_DISTANCE_MINUTES;
            newMinutes = Math.max(0, Math.min(maxFromMinDistance, newMinutes));
        } else {
            const minFromMinDistance = otherMinutes + MIN_DISTANCE_MINUTES;
            newMinutes = Math.max(minFromMinDistance, Math.min(48 * 60 - MINUTE_INCREMENT, newMinutes));
        }

        const newPosition = newMinutes / (48 * 60 - MINUTE_INCREMENT);
        const newX = newPosition * (sliderWidth - thumbSize);

        translateX.value = withSpring(newX, { damping: 15, stiffness: 150 });
        updateDisplayTime(newX, isStart, true);
    };

    const constrainPosition = (position: number, isStart: boolean, otherPosition: number): number => {
        'worklet';

        const otherPos = otherPosition / (sliderWidth - thumbSize);
        const minDistancePos = MIN_DISTANCE_MINUTES / (48 * 60 - MINUTE_INCREMENT);

        if (isStart) {
            // Start tack constraints:
            // 1. Cannot be less than 0
            // 2. Cannot be closer than MIN_DISTANCE_MINUTES to end tack
            const maxFromMinDistance = otherPos - minDistancePos;
            const maxPos = Math.min(maxFromMinDistance, 1); // Can't exceed slider bounds
            const minPos = 0; // Can't be negative

            return Math.max(minPos, Math.min(maxPos, position));
        } else {
            // End tack constraints:
            // 1. Cannot be greater than 1
            // 2. Cannot be closer than MIN_DISTANCE_MINUTES to start tack
            const minFromMinDistance = otherPos + minDistancePos;
            const minPos = Math.max(minFromMinDistance, 0); // Can't be negative
            const maxPos = 1; // Can't exceed slider bounds

            return Math.max(minPos, Math.min(maxPos, position));
        }
    };

    const createPanGesture = (isStart: boolean) => {
        const translateX = isStart ? startTranslateX : endTranslateX;
        const startX = isStart ? startStartX : endStartX;
        const isDragging = isStart ? isStartDragging : isEndDragging;
        const otherTranslateX = isStart ? endTranslateX : startTranslateX;

        return Gesture.Pan()
            .onStart(() => {
                startX.value = translateX.value;
                isDragging.value = true;
                activeThumb.value = isStart ? 'start' : 'end';
            })
            .onUpdate((event) => {
                const newX = startX.value + event.translationX;
                const position = newX / (sliderWidth - thumbSize);

                // Apply normal constraints first to get the actual position of current tack
                const constrainedPosition = constrainPosition(position, isStart, otherTranslateX.value);
                const constrainedX = constrainedPosition * (sliderWidth - thumbSize);

                // Check for snapping
                let finalPosition = constrainedPosition;
                let shouldSnap = false;
                for (const snapPos of snapPositions) {
                    if (Math.abs(constrainedPosition - snapPos) < snapThreshold) {
                        const snapPosition = constrainPosition(snapPos, isStart, otherTranslateX.value);
                        if (Math.abs(snapPosition - snapPos) < 0.001) {
                            finalPosition = snapPos;
                            shouldSnap = true;
                            break;
                        }
                    }
                }

                const finalX = finalPosition * (sliderWidth - thumbSize);
                translateX.value = finalX;

                // Now check max duration constraint using the ACTUAL final position
                const finalMinutes = Math.round(finalPosition * (48 * 60 - MINUTE_INCREMENT));
                const otherPos = otherTranslateX.value / (sliderWidth - thumbSize);
                const otherMinutes = Math.round(otherPos * (48 * 60 - MINUTE_INCREMENT));
                const duration = Math.abs(finalMinutes - otherMinutes);

                if (duration > MAX_DURATION_MINUTES) {
                    if (isStart) {
                        // Start tack moved, adjust end tack to maintain exactly 24h
                        const targetEndMinutes = finalMinutes + MAX_DURATION_MINUTES;
                        if (targetEndMinutes <= 48 * 60 - MINUTE_INCREMENT) {
                            const newEndPosition = targetEndMinutes / (48 * 60 - MINUTE_INCREMENT);
                            const newEndX = newEndPosition * (sliderWidth - thumbSize);
                            otherTranslateX.value = newEndX;
                            runOnJS(updateDisplayTime)(newEndX, !isStart);
                        }
                    } else {
                        // End tack moved, adjust start tack to maintain exactly 24h
                        const targetStartMinutes = finalMinutes - MAX_DURATION_MINUTES;
                        if (targetStartMinutes >= 0) {
                            const newStartPosition = targetStartMinutes / (48 * 60 - MINUTE_INCREMENT);
                            const newStartX = newStartPosition * (sliderWidth - thumbSize);
                            otherTranslateX.value = newStartX;
                            runOnJS(updateDisplayTime)(newStartX, !isStart);
                        }
                    }
                }

                runOnJS(updateDisplayTime)(finalX, isStart);
            })
            .onEnd(() => {
                isDragging.value = false;
                activeThumb.value = null;
                const currentPosition = translateX.value / (sliderWidth - thumbSize);

                let finalPosition = currentPosition;
                for (const snapPos of snapPositions) {
                    if (Math.abs(currentPosition - snapPos) < snapThreshold) {
                        finalPosition = snapPos;
                        break;
                    }
                }

                const constrainedFinalPosition = constrainPosition(finalPosition, isStart, otherTranslateX.value);
                const snappedMinutes = positionToMinutes(constrainedFinalPosition);
                const snappedPosition = minutesToPosition(snappedMinutes);
                const snappedX = snappedPosition * (sliderWidth - thumbSize);

                translateX.value = withSpring(snappedX, { damping: 15, stiffness: 150 });
                runOnJS(updateDisplayTime)(snappedX, isStart);
            });
    };

    const startPanGesture = createPanGesture(true);
    const endPanGesture = createPanGesture(false);

    const startThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: startTranslateX.value }],
        };
    });

    const endThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: endTranslateX.value }],
        };
    });

    const durationBarStyle = useAnimatedStyle(() => {
        const startPos = startTranslateX.value;
        const endPos = endTranslateX.value;
        const width = endPos - startPos;

        return {
            left: startPos,
            width: width,
        };
    });

    return (
        <View className="mb-4">
            <Text className="text-on-surface text-base font-medium mb-2">
                Habit Reset Time
            </Text>
            {!readOnly && (
                <Text className="text-on-surface-variant text-sm mb-2">
                    Choose when your habit resets. Drag the slider to select a time.
                </Text>
            )}

            <View className="mb-4 bg-surface-variant rounded-lg p-3">
                <View className="mb-3">
                    <View className="flex-row justify-center items-center">
                        {!readOnly && (
                            <TouchableOpacity
                                onPress={() => adjustTime(true, false)}
                                className="bg-primary rounded-full p-2 mr-4"
                            >
                                <Ionicons name="chevron-back" size={20} color="white" />
                            </TouchableOpacity>
                        )}

                        <Text className="text-on-surface-variant text-sm text-center">
                            Start Time: <Text className="font-medium text-on-surface">{currentStartDisplayTime}</Text>
                        </Text>

                        {!readOnly && (
                            <TouchableOpacity
                                onPress={() => adjustTime(true, true)}
                                className="bg-primary rounded-full p-2 ml-4"
                            >
                                <Ionicons name="chevron-forward" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-center items-center">
                        {!readOnly && (
                            <TouchableOpacity
                                onPress={() => adjustTime(false, false)}
                                className="bg-primary rounded-full p-2 mr-4"
                            >
                                <Ionicons name="chevron-back" size={20} color="white" />
                            </TouchableOpacity>
                        )}

                        <Text className="text-on-surface-variant text-sm text-center">
                            End Time: <Text className="font-medium text-on-surface">{currentEndDisplayTime}</Text>
                        </Text>

                        {!readOnly && (
                            <TouchableOpacity
                                onPress={() => adjustTime(false, true)}
                                className="bg-primary rounded-full p-2 ml-4"
                            >
                                <Ionicons name="chevron-forward" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <View className="relative mb-4" style={{ height: 40 }}>
                <View
                    className="bg-outline absolute"
                    style={{
                        width: sliderWidth,
                        height: trackHeight,
                        top: 20 - trackHeight / 2,
                        borderRadius: trackHeight / 2,
                    }}
                />

                {snapPositions.map((position, index) => (
                    <View
                        key={index}
                        className="bg-primary absolute"
                        style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            left: position * (sliderWidth - 4),
                            top: 20 - 2,
                        }}
                    />
                ))}

                <Animated.View
                    className="bg-secondary absolute"
                    style={[
                        {
                            height: trackHeight + 2,
                            top: 20 - (trackHeight + 2) / 2,
                            borderRadius: (trackHeight + 2) / 2,
                        },
                        durationBarStyle
                    ]}
                />

                {readOnly ? (
                    <>
                        <Animated.View
                            className="bg-primary absolute shadow-sm"
                            style={[
                                {
                                    width: thumbSize,
                                    height: thumbSize,
                                    borderRadius: thumbSize / 2,
                                    top: 20 - thumbSize / 2,
                                },
                                startThumbStyle
                            ]}
                        />
                        <Animated.View
                            className="bg-primary absolute shadow-sm"
                            style={[
                                {
                                    width: thumbSize,
                                    height: thumbSize,
                                    borderRadius: thumbSize / 2,
                                    top: 20 - thumbSize / 2,
                                },
                                endThumbStyle
                            ]}
                        />
                    </>
                ) : (
                    <>
                        <GestureDetector gesture={startPanGesture}>
                            <Animated.View
                                className="bg-primary absolute shadow-sm"
                                style={[
                                    {
                                        width: thumbSize,
                                        height: thumbSize,
                                        borderRadius: thumbSize / 2,
                                        top: 20 - thumbSize / 2,
                                    },
                                    startThumbStyle
                                ]}
                            />
                        </GestureDetector>

                        <GestureDetector gesture={endPanGesture}>
                            <Animated.View
                                className="bg-primary absolute shadow-sm"
                                style={[
                                    {
                                        width: thumbSize,
                                        height: thumbSize,
                                        borderRadius: thumbSize / 2,
                                        top: 20 - thumbSize / 2,
                                    },
                                    endThumbStyle
                                ]}
                            />
                        </GestureDetector>
                    </>
                )}
            </View>

            <View className="flex-row justify-between px-1">
                <Text className="text-on-surface-variant text-xs">
                    Day 1
                </Text>
                <Text className="text-on-surface-variant text-xs text-center">
                    12:00
                </Text>
                <Text className="text-on-surface-variant text-xs text-center">
                    Day 2
                </Text>
                <Text className="text-on-surface-variant text-xs text-center">
                    12:00
                </Text>
                <Text className="text-on-surface-variant text-xs text-right">
                    {(() => {
                        const maxMinutes = 24 * 60 - MINUTE_INCREMENT;
                        const hours = Math.floor(maxMinutes / 60);
                        const minutes = maxMinutes % 60;
                        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    })()}
                </Text>
            </View>
        </View>
    );
};

export default HabitResetTimeSlider;