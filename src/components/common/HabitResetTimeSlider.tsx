import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface HabitResetTimeSliderProps {
    value: string; // HH:MM format
    onValueChange: (value: string) => void;
}

const HabitResetTimeSlider: React.FC<HabitResetTimeSliderProps> = ({ value, onValueChange }) => {
    const { getColor } = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const sliderWidth = screenWidth - 80;
    const thumbSize = 20;
    const trackHeight = 2;

    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const [currentDisplayTime, setCurrentDisplayTime] = React.useState(value);

    const minutesToDisplayString = (totalMinutes: number): string => {
        const day = Math.floor(totalMinutes / (24 * 60));
        const remainingMinutes = totalMinutes % (24 * 60);
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;

        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        return day > 0 ? `${day}d + ${timeStr}` : timeStr;
    };

    const timeToPosition = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        return totalMinutes / (48 * 60 - 5);
    };

    const positionToMinutes = (position: number): number => {
        'worklet';
        const totalMinutes = Math.round(position * (48 * 60 - 5));
        return Math.round(totalMinutes / 5) * 5;
    };

    const minutesToPosition = (totalMinutes: number): number => {
        'worklet';
        return totalMinutes / (48 * 60 - 5);
    };

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

    const adjustTime = (increment: boolean) => {
        const currentPosition = translateX.value / (sliderWidth - thumbSize);
        const currentMinutes = positionToMinutes(currentPosition);
        const newMinutes = Math.max(0, Math.min(48 * 60 - 5, currentMinutes + (increment ? 5 : -5)));
        const newPosition = minutesToPosition(newMinutes);
        const newX = newPosition * (sliderWidth - thumbSize);

        translateX.value = withSpring(newX, { damping: 15, stiffness: 150 });
        updateDisplayTime(newX);
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
            runOnJS(updateDisplayTime)(clampedX);
        })
        .onEnd(() => {
            isDragging.value = false;
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

            <View className="mb-4 bg-surface-variant rounded-lg p-3">
                <View className="flex-row justify-center items-center">
                    <TouchableOpacity
                        onPress={() => adjustTime(false)}
                        className="bg-primary rounded-full p-2 mr-4"
                    >
                        <Ionicons name="chevron-back" size={20} color="white" />
                    </TouchableOpacity>

                    <Text className="text-on-surface-variant text-sm text-center">
                        Selected Time: <Text className="font-medium text-on-surface">{currentDisplayTime}</Text>
                    </Text>

                    <TouchableOpacity
                        onPress={() => adjustTime(true)}
                        className="bg-primary rounded-full p-2 ml-4"
                    >
                        <Ionicons name="chevron-forward" size={20} color="white" />
                    </TouchableOpacity>
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