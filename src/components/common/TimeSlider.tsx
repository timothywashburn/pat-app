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

const MINUTE_INCREMENT = 5;
const MAX_MINUTES = 24 * 60;

interface TimeSliderProps {
    offsetMinutes: number;
    onOffsetChange?: (offset: number) => void;
    readOnly?: boolean;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ offsetMinutes, onOffsetChange, readOnly = false }) => {
    const screenWidth = Dimensions.get('window').width;
    const sliderWidth = screenWidth - 80;
    const thumbSize = 20;
    const trackHeight = 2;

    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const minutesToDisplayString = (totalMinutes: number): string => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const minutesToDisplayString12Hour = (totalMinutes: number): string => {
        // Handle 24:00 (1440 minutes) as 12:00 AM next day
        if (totalMinutes === 1440) {
            return '12:00 AM';
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 || 12;
        return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const [currentDisplayTime, setCurrentDisplayTime] = React.useState(minutesToDisplayString12Hour(offsetMinutes));

    const minutesToPosition = (totalMinutes: number): number => {
        'worklet';
        return totalMinutes / MAX_MINUTES;
    };

    const snapPositions = [0, 0.25, 0.5, 0.75, 1]; // 12am, 6am, 12pm, 6pm, 12am next day
    const snapThreshold = 0.03;

    const positionToMinutes = (position: number): number => {
        'worklet';

        for (const snapPos of snapPositions) {
            if (Math.abs(position - snapPos) < snapThreshold) {
                const snapMinutes = Math.round(snapPos * MAX_MINUTES);
                return Math.round(snapMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;
            }
        }

        const totalMinutes = Math.round(position * MAX_MINUTES);
        return Math.round(totalMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;
    };

    React.useEffect(() => {
        const initialPosition = minutesToPosition(offsetMinutes);
        translateX.value = initialPosition * (sliderWidth - thumbSize);
    }, [offsetMinutes, sliderWidth, thumbSize]);

    const positionToMinutesRaw = (position: number): number => {
        const totalMinutes = Math.round(position * MAX_MINUTES);
        return Math.round(totalMinutes / MINUTE_INCREMENT) * MINUTE_INCREMENT;
    };

    const updateDisplayTime = (x: number, useRaw = false) => {
        const position = x / (sliderWidth - thumbSize);
        const totalMinutes = useRaw ? positionToMinutesRaw(position) : positionToMinutes(position);
        const displayString = minutesToDisplayString12Hour(totalMinutes);

        setCurrentDisplayTime(displayString);
        onOffsetChange?.(totalMinutes);
    };

    const adjustTime = (increment: boolean) => {
        const currentPosition = translateX.value / (sliderWidth - thumbSize);
        const currentMinutes = positionToMinutesRaw(currentPosition);

        let newMinutes = currentMinutes + (increment ? MINUTE_INCREMENT : -MINUTE_INCREMENT);
        newMinutes = Math.max(0, Math.min(MAX_MINUTES, newMinutes));

        const newPosition = newMinutes / MAX_MINUTES;
        const newX = newPosition * (sliderWidth - thumbSize);

        translateX.value = withSpring(newX, { damping: 15, stiffness: 150 });
        updateDisplayTime(newX, true);
    };

    const constrainPosition = (position: number): number => {
        'worklet';
        return Math.max(0, Math.min(1, position));
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
            isDragging.value = true;
        })
        .onUpdate((event) => {
            const newX = startX.value + event.translationX;
            const position = newX / (sliderWidth - thumbSize);
            const constrainedPosition = constrainPosition(position);

            // Check for snapping
            let finalPosition = constrainedPosition;
            for (const snapPos of snapPositions) {
                if (Math.abs(constrainedPosition - snapPos) < snapThreshold) {
                    finalPosition = snapPos;
                    break;
                }
            }

            const finalX = finalPosition * (sliderWidth - thumbSize);
            translateX.value = finalX;
            runOnJS(updateDisplayTime)(finalX);
        })
        .onEnd(() => {
            isDragging.value = false;
            const currentPosition = translateX.value / (sliderWidth - thumbSize);

            let finalPosition = currentPosition;
            for (const snapPos of snapPositions) {
                if (Math.abs(currentPosition - snapPos) < snapThreshold) {
                    finalPosition = snapPos;
                    break;
                }
            }

            const snappedMinutes = positionToMinutes(finalPosition);
            const snappedPosition = minutesToPosition(snappedMinutes);
            const snappedX = snappedPosition * (sliderWidth - thumbSize);

            translateX.value = withSpring(snappedX, { damping: 15, stiffness: 150 });
            runOnJS(updateDisplayTime)(snappedX);
        });

    const thumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View className="mb-4">
            {!readOnly && (
                <View className="mb-4 bg-surface-variant rounded-lg p-3">
                    <View className="flex-row justify-center items-center">
                        <TouchableOpacity
                            onPress={() => adjustTime(false)}
                            className="bg-primary rounded-full p-2 mr-4"
                        >
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </TouchableOpacity>

                        <Text className="text-on-surface-variant text-sm text-center">
                            Time: <Text className="font-medium text-on-surface">{currentDisplayTime}</Text>
                        </Text>

                        <TouchableOpacity
                            onPress={() => adjustTime(true)}
                            className="bg-primary rounded-full p-2 ml-4"
                        >
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

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

                {readOnly ? (
                    <Animated.View
                        className="bg-primary absolute"
                        style={[
                            {
                                width: thumbSize,
                                height: thumbSize,
                                borderRadius: thumbSize / 2,
                                top: 20 - thumbSize / 2,
                            },
                            thumbStyle
                        ]}
                    />
                ) : (
                    <GestureDetector gesture={panGesture}>
                        <Animated.View
                            className="bg-primary absolute"
                            style={[
                                {
                                    width: thumbSize,
                                    height: thumbSize,
                                    borderRadius: thumbSize / 2,
                                    top: 20 - thumbSize / 2,
                                },
                                thumbStyle
                            ]}
                        />
                    </GestureDetector>
                )}
            </View>

            <View className="flex-row justify-between px-1">
                <Text className="text-on-surface-variant text-xs">
                    12:00 AM
                </Text>
                <Text className="text-on-surface-variant text-xs text-center">
                    6:00 AM
                </Text>
                <Text className="text-on-surface-variant text-xs text-center">
                    12:00 PM
                </Text>
                <Text className="text-on-surface-variant text-xs text-center">
                    6:00 PM
                </Text>
                <Text className="text-on-surface-variant text-xs text-right">
                    12:00 AM
                </Text>
            </View>
        </View>
    );
};

export default TimeSlider;