import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import * as Linking from 'expo-linking';
import PatConfig from "@/src/misc/PatConfig";

const VerifySuccess: React.FC = () => {
    const { getColor } = useTheme();

    const handleReturnToApp = async () => {
        try {
            const appLink = `${PatConfig.apiURL}/app`;

            console.log("attempting to open universal link:", appLink);

            if (Platform.OS === 'web') {
                window.location.href = appLink;
            } else {
                const canOpen = await Linking.canOpenURL(appLink);
                if (canOpen) {
                    await Linking.openURL(appLink);
                } else {
                    console.log("cannot open universal link");
                }
            }
        } catch (err) {
            console.log('error opening universal link:', err);
        }
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <View className="flex-1 items-center justify-center p-4">
                <View className="bg-surface rounded-lg p-8 w-full max-w-md items-center">
                    <View className="mb-6">
                        <View className="rounded-full bg-success-container p-3">
                            <Ionicons
                                name="checkmark-circle"
                                size={48}
                                color={getColor("on-success-container")}
                            />
                        </View>
                    </View>

                    <Text className="text-on-surface text-2xl font-bold mb-4 text-center">
                        Email Verified!
                    </Text>

                    <Text className="text-on-surface-variant mb-8 text-center">
                        Your email has been successfully verified.
                    </Text>

                    <TouchableOpacity
                        onPress={handleReturnToApp}
                        className="bg-primary h-[50px] rounded-lg justify-center items-center w-full"
                        activeOpacity={0.8}
                    >
                        <Text className="text-on-primary text-base font-semibold">
                            Return to App
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default VerifySuccess;