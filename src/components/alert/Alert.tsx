import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    runOnJS 
} from 'react-native-reanimated';

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertItem {
    id: string;
    title: string;
    message?: string;
    buttons: AlertButton[];
}

interface AlertProps {
    alert: AlertItem;
    onDismiss: (id: string) => void;
}

export const Alert: React.FC<AlertProps> = ({ alert, onDismiss }) => {
    const [visible, setVisible] = useState(true);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 150 });
    }, []);

    const handleDismiss = () => {
        opacity.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(onDismiss)(alert.id);
        });
    };

    const handleButtonPress = (button: AlertButton) => {
        const executeCallback = () => {
            if (button.onPress) {
                button.onPress();
            }
            onDismiss(alert.id);
        };
        
        opacity.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(executeCallback)();
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const getButtonClasses = (button: AlertButton) => {
        switch (button.style) {
            case 'destructive':
                return 'bg-error';
            case 'cancel':
                return 'bg-outline';
            default:
                return 'bg-primary';
        }
    };

    const getButtonTextClasses = (button: AlertButton) => {
        switch (button.style) {
            case 'destructive':
                return 'text-on-error';
            case 'cancel':
                return 'text-on-surface';
            default:
                return 'text-on-primary';
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleDismiss}
        >
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                <TouchableOpacity 
                    className="flex-1 bg-black/50 justify-center items-center p-5"
                    activeOpacity={1}
                    onPress={handleDismiss}
                >
                <TouchableOpacity 
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    className="bg-surface rounded-xl p-5 min-w-[280px] max-w-[400px]"
                >
                    <Text className="text-lg font-semibold text-on-surface text-center mb-2">
                        {alert.title}
                    </Text>
                    
                    {alert.message && (
                        <Text className="text-base text-on-surface-variant text-center mb-5 leading-6">
                            {alert.message}
                        </Text>
                    )}

                    <View className={`${alert.buttons.length > 2 ? 'flex-col' : 'flex-row'} gap-2`}>
                        {alert.buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleButtonPress(button)}
                                className={`${getButtonClasses(button)} py-3 px-5 rounded-lg ${alert.buttons.length <= 2 ? 'flex-1' : ''} items-center`}
                            >
                                <Text className={`${getButtonTextClasses(button)} text-base font-semibold`}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
};