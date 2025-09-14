import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';

interface HabitResetTimeSliderProps {
    value: string; // HH:MM format
    onValueChange: (value: string) => void;
}

const HabitResetTimeSlider: React.FC<HabitResetTimeSliderProps> = ({ value, onValueChange }) => {
    const { getColor } = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const sliderWidth = screenWidth - 80; // Account for container padding and margins
    const thumbSize = 20; // Smaller thumb size
    const trackHeight = 2;

    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const [currentDisplayTime, setCurrentDisplayTime] = React.useState(value);

    // Convert total minutes to display string
    const minutesToDisplayString = (totalMinutes: number): string => {
        const day = Math.floor(totalMinutes / (24 * 60));
        const remainingMinutes = totalMinutes % (24 * 60);
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;

        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        return day > 0 ? `${day}d + ${timeStr}` : timeStr;
    };

    // Convert time string to slider position (0-1)
    const timeToPosition = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        // Map 0-2879 (48 hours - 1 minute) to 0-1 position for 2-day range
        return totalMinutes / (48 * 60 - 5); // -5 to exclude the very last 5-minute interval
    };

    // Convert slider position to total minutes with 5-minute snapping
    const positionToMinutes = (position: number): number => {
        'worklet';
        // Map position (0-1) to minutes in 48-hour range (minus last interval)
        const totalMinutes = Math.round(position * (48 * 60 - 5));
        // Snap to 5-minute intervals
        return Math.round(totalMinutes / 5) * 5;
    };

    // Convert total minutes to slider position
    const minutesToPosition = (totalMinutes: number): number => {
        'worklet';
        return totalMinutes / (48 * 60 - 5);
    };

    // Initialize position from current value
    React.useEffect(() => {
        const initialPosition = timeToPosition(value);
        translateX.value = initialPosition * (sliderWidth - thumbSize);
    }, [value, sliderWidth, thumbSize]);

    const updateDisplayTime = (x: number) => {
        const position = x / (sliderWidth - thumbSize);
        const totalMinutes = positionToMinutes(position);
        const displayString = minutesToDisplayString(totalMinutes);
        setCurrentDisplayTime(displayString);
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
            isDragging.value = true;
        })
        .onUpdate((event) => {
            const newX = startX.value + event.translationX;
            const clampedX = Math.max(0, Math.min(sliderWidth - thumbSize, newX));
            translateX.value = clampedX;
            console.log('Dragging to position:', clampedX);
            runOnJS(updateDisplayTime)(clampedX);
        })
        .onEnd(() => {
            isDragging.value = false;
            // Snap to nearest 5-minute interval
            const currentPosition = translateX.value / (sliderWidth - thumbSize);
            const snappedMinutes = positionToMinutes(currentPosition);
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
            <Text className="text-on-surface text-base font-medium mb-2">
                Habit Reset Time (MOCKUP)
            </Text>
            <Text className="text-on-surface-variant text-sm mb-2">
                Choose when your habit resets. Drag the slider to select a time.
            </Text>

            {/* Real-time display */}
            <View className="mb-4 bg-surface-variant rounded-lg p-3">
                <Text className="text-on-surface-variant text-sm text-center">
                    Selected Time: <Text className="font-medium text-on-surface">{currentDisplayTime}</Text>
                </Text>
            </View>

            {/* Slider container */}
            <View className="relative mb-4" style={{ height: 40 }}>
                {/* Track */}
                <View
                    className="bg-outline absolute"
                    style={{
                        width: sliderWidth,
                        height: trackHeight,
                        top: 20 - trackHeight / 2,
                        borderRadius: trackHeight / 2,
                    }}
                />

                {/* Hour markers every 12 hours for 2-day span */}
                {[0, 0.25, 0.5, 0.75, 1].map((position, index) => (
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

                {/* Draggable thumb */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        className="bg-primary absolute shadow-sm"
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
            </View>

            {/* Time labels for 2-day range */}
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