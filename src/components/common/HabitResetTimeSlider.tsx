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
const MIN_DISTANCE_MINUTES = MINUTE_INCREMENT;

interface HabitResetTimeSliderProps {
    startValue: number;
    endValue: number;
    onStartValueChange?: (value: number) => void;
    onEndValueChange?: (value: number) => void;
}

const HabitResetTimeSlider: React.FC<HabitResetTimeSliderProps> = ({ startValue, endValue, onStartValueChange, onEndValueChange }) => {
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
        const mins = remainingMinutes % 60;

        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        return day > 0 ? `${day}d + ${timeStr}` : timeStr;
    };

    const [currentStartDisplayTime, setCurrentStartDisplayTime] = React.useState(minutesToDisplayString(startValue));
    const [currentEndDisplayTime, setCurrentEndDisplayTime] = React.useState(minutesToDisplayString(endValue));

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
        const initialStartPosition = minutesToPosition(startValue);
        const initialEndPosition = minutesToPosition(endValue);
        startTranslateX.value = initialStartPosition * (sliderWidth - thumbSize);
        endTranslateX.value = initialEndPosition * (sliderWidth - thumbSize);
    }, [startValue, endValue, sliderWidth, thumbSize]);

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
            onStartValueChange?.(totalMinutes);
        } else {
            setCurrentEndDisplayTime(displayString);
            onEndValueChange?.(totalMinutes);
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

        if (isStart) {
            newMinutes = Math.max(0, Math.min(otherMinutes - MIN_DISTANCE_MINUTES, newMinutes));
        } else {
            newMinutes = Math.max(otherMinutes + MIN_DISTANCE_MINUTES, Math.min(48 * 60 - MINUTE_INCREMENT, newMinutes));
        }

        const newPosition = newMinutes / (48 * 60 - MINUTE_INCREMENT);
        const newX = newPosition * (sliderWidth - thumbSize);

        translateX.value = withSpring(newX, { damping: 15, stiffness: 150 });
        updateDisplayTime(newX, isStart, true);
    };

    const constrainPosition = (position: number, isStart: boolean, otherPosition: number): number => {
        'worklet';

        if (isStart) {
            const maxPos = (otherPosition / (sliderWidth - thumbSize)) - (MIN_DISTANCE_MINUTES / (48 * 60 - MINUTE_INCREMENT));
            return Math.max(0, Math.min(maxPos, position));
        } else {
            const minPos = (otherPosition / (sliderWidth - thumbSize)) + (MIN_DISTANCE_MINUTES / (48 * 60 - MINUTE_INCREMENT));
            return Math.max(minPos, Math.min(1, position));
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
                const constrainedPosition = constrainPosition(position, isStart, otherTranslateX.value);
                const constrainedX = constrainedPosition * (sliderWidth - thumbSize);

                let shouldSnap = false;
                for (const snapPos of snapPositions) {
                    if (Math.abs(constrainedPosition - snapPos) < snapThreshold) {
                        const snapX = snapPos * (sliderWidth - thumbSize);
                        const snapPosition = snapX / (sliderWidth - thumbSize);
                        const finalConstrainedPosition = constrainPosition(snapPosition, isStart, otherTranslateX.value);

                        if (Math.abs(finalConstrainedPosition - snapPosition) < 0.001) {
                            translateX.value = snapX;
                            shouldSnap = true;
                            break;
                        }
                    }
                }

                if (!shouldSnap) {
                    translateX.value = constrainedX;
                }

                runOnJS(updateDisplayTime)(translateX.value, isStart);
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

    return (
        <View className="mb-4">
            <Text className="text-on-surface text-base font-medium mb-2">
                Habit Reset Time (MOCKUP)
            </Text>
            <Text className="text-on-surface-variant text-sm mb-2">
                Choose when your habit resets. Drag the slider to select a time.
            </Text>

            <View className="mb-4 bg-surface-variant rounded-lg p-3">
                <View className="mb-3">
                    <View className="flex-row justify-center items-center">
                        <TouchableOpacity
                            onPress={() => adjustTime(true, false)}
                            className="bg-primary rounded-full p-2 mr-4"
                        >
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </TouchableOpacity>

                        <Text className="text-on-surface-variant text-sm text-center">
                            Start Time: <Text className="font-medium text-on-surface">{currentStartDisplayTime}</Text>
                        </Text>

                        <TouchableOpacity
                            onPress={() => adjustTime(true, true)}
                            className="bg-primary rounded-full p-2 ml-4"
                        >
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <View className="flex-row justify-center items-center">
                        <TouchableOpacity
                            onPress={() => adjustTime(false, false)}
                            className="bg-primary rounded-full p-2 mr-4"
                        >
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </TouchableOpacity>

                        <Text className="text-on-surface-variant text-sm text-center">
                            End Time: <Text className="font-medium text-on-surface">{currentEndDisplayTime}</Text>
                        </Text>

                        <TouchableOpacity
                            onPress={() => adjustTime(false, true)}
                            className="bg-primary rounded-full p-2 ml-4"
                        >
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
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
                        className="bg-secondary absolute shadow-sm"
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
                    23:55
                </Text>
            </View>
        </View>
    );
};

export default HabitResetTimeSlider;