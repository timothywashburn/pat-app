import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    position: 'top' | 'bottom';
}

const toastColorScheme = {
    success: {
        background: 'bg-green-500',
        text: 'text-white'
    },
    error: {
        background: 'bg-error',
        text: 'text-on-error'
    },
    warning: {
        background: 'bg-yellow-500',
        text: 'text-white'
    },
    info: {
        background: 'bg-primary',
        text: 'text-on-primary'
    }
};

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

    const styles = toastColorScheme[type];
    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }],
                zIndex: 1000,
            }}
        >
            <View
                className={`rounded-lg shadow-md overflow-hidden min-w-[150px] max-w-[90%] mx-auto ${styles.background}`}
            >
                <View className="px-4 py-3">
                    <Text className={`text-center ${styles.text}`}>{message}</Text>
                </View>
            </View>
        </Animated.View>
    );
};