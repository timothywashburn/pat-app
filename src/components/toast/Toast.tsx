// src/components/toast/Toast.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Text, Platform, Dimensions, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    position: 'top' | 'bottom';
}

export const Toast: React.FC<ToastProps> = ({ message, type, duration, position }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(position === 'top' ? -20 : 20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        const hideTimeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: position === 'top' ? -20 : 20,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, duration - 300);

        return () => clearTimeout(hideTimeout);
    }, [opacity, translateY, duration, position]);

    // Get background color based on type
    const getBgColor = () => {
        switch (type) {
            case 'success':
                return '#4CAF50'; // Green
            case 'error':
                return '#FF3B30'; // Red (assuming "unknown" is red)
            case 'warning':
                return '#FF9500'; // Yellow
            case 'info':
            default:
                return '#007AFF'; // Blue (assuming "primary")
        }
    };

    const maxWidth = Dimensions.get('window').width - 40;

    // Using a nested approach with Animated.View inside a regular View with className
    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }],
                zIndex: 1000,
            }}
        >
            <View
                className="rounded-lg shadow-md overflow-hidden"
                style={{
                    backgroundColor: getBgColor(),
                    minWidth: 150,
                    maxWidth,
                }}
            >
                <View className="px-4 py-3">
                    <Text className="text-white text-center">{message}</Text>
                </View>
            </View>
        </Animated.View>
    );
};