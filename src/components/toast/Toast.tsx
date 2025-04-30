import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, TouchableOpacity } from 'react-native';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
    position: 'top' | 'bottom';
    actionLabel?: string;
    onActionPress?: () => void;
    hideToast?: (id: string) => void;
}

const toastColorScheme = {
    success: {
        background: 'bg-success',
        text: 'text-on-success',
    },
    error: {
        background: 'bg-error',
        text: 'text-on-error',
    },
    warning: {
        background: 'bg-warning',
        text: 'text-on-warning',
    },
    info: {
        background: 'bg-primary',
        text: 'text-on-primary',
    }
};

export const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type,
    duration,
    position,
    actionLabel,
    onActionPress,
    hideToast
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(position === 'top' ? -20 : 20)).current;
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Show animation
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

        if (duration > 0) {
            animationTimeoutRef.current = setTimeout(() => {
                startHideAnimation(() => {
                    if (hideToast) hideToast(id);
                });
            }, duration - 300);
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [opacity, translateY, duration, position, id]);

    const startHideAnimation = (onComplete?: () => void) => {
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
        ]).start(onComplete);
    };

    const handleActionPress = () => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        startHideAnimation(() => {
            if (onActionPress) onActionPress();
            if (hideToast) hideToast(id);
        });
    };

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
                className={`rounded-lg shadow-md overflow-hidden mx-auto min-w-[150px] max-w-[90%] ${styles.background}`}
            >
                <View className="px-4 py-3 flex-row items-center justify-between">
                    <Text className={`flex-shrink ${styles.text}`}>{message}</Text>

                    {actionLabel && (
                        <TouchableOpacity
                            onPress={handleActionPress}
                            className="ml-3 flex-shrink-0"
                        >
                            <Text className={`font-bold ${styles.text}`}>
                                {actionLabel}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};