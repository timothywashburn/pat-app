import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '@/src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainStackParamList } from '@/src/navigation/MainStack';

export default function NotFoundScreen() {
    const { getColor } = useTheme();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();

    const handleGoHome = () => {
        navigation.navigate('Agenda');
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <View className="flex-1 justify-center items-center px-5">
                <Text className="text-on-background text-9xl font-black mb-4 text-center">
                    404
                </Text>
                
                <Text className="text-on-background text-2xl font-bold mb-3 text-center">
                    Page Not Found
                </Text>
                
                <Text className="text-on-surface-variant text-base mb-8 text-center max-w-sm">
                    The page you're looking for doesn't exist or has been moved.
                </Text>

                <TouchableOpacity
                    className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
                    onPress={handleGoHome}
                >
                    <Ionicons name="home" size={20} color={getColor('on-primary')} />
                    <Text className="text-on-primary text-base font-semibold ml-2">
                        Go Home
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}