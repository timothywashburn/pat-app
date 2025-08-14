import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import * as Linking from 'expo-linking';

const VerifySuccess: React.FC = () => {
    return (
        <SafeAreaView className="bg-background flex-1">
            <View className="flex-1 items-center justify-center p-4">
                <View className="bg-surface rounded-lg shadow p-8 w-full max-w-md items-center">
                    <Text className="text-on-surface text-2xl font-bold mb-4 text-center">
                        App
                    </Text>

                    <Text className="text-on-surface-variant mb-8 text-center">
                        should have redirected by now
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default VerifySuccess;