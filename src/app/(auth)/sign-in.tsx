import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from "@/src/features/auth/controllers/useAuthStore";
import { useToast } from '@/src/components/toast/ToastContext';
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
    const { getColor } = useTheme();
    const [email, setEmail] = useState(__DEV__ ? 'trwisinthehouse@gmail.com' : '');
    const [password, setPassword] = useState(__DEV__ ? 'pass' : '');
    const [isLoading, setIsLoading] = useState(false);
    const { errorToast } = useToast();
    const { signIn } = useAuthStore();

    const handleSignIn = async () => {
        if (!email || !password) {
            errorToast('Please enter both email and password');
            return;
        }

        setIsLoading(true);

        try {
            await signIn(email, password);
        } catch (error) {
            errorToast(error instanceof Error ? error.message : 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="bg-background flex-1 justify-center">
            <View className="max-w-lg w-full mx-auto px-5">
                <Text className="text-on-background text-3xl font-bold mb-2.5 text-center">Pat</Text>
                <Text className="text-on-background-variant text-base mb-8 text-center">Your personal planner and tracker.</Text>

                <View className="mb-4">
                    <TextInput
                        className="bg-surface text-on-surface h-[50px] border border-outline rounded-lg px-3 text-base"
                        placeholder="Email"
                        placeholderTextColor={getColor("on-surface-variant")}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        returnKeyType="go"
                        onSubmitEditing={handleSignIn}
                    />
                </View>

                <View className="mb-4">
                    <TextInput
                        className="bg-surface text-on-surface h-[50px] border border-outline rounded-lg px-3 text-base"
                        placeholder="Password"
                        placeholderTextColor={getColor("on-surface-variant")}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        returnKeyType="go"
                        onSubmitEditing={handleSignIn}
                    />
                </View>

                <TouchableOpacity
                    className="bg-primary h-[50px] rounded-lg justify-center items-center mt-2.5"
                    onPress={handleSignIn}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={getColor("on-primary")} />
                    ) : (
                        <Text className="text-on-primary text-base font-semibold">Sign In</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-5">
                    <Text className="text-on-background-variant">Don't have an account? </Text>
                    <Link href="/(auth)/create-account" asChild>
                        <TouchableOpacity>
                            <Text className="text-primary font-semibold">Create an account</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}