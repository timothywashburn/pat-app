import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { useTheme } from '@/src/controllers/ThemeManager';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";
import { useToast } from '@/src/components/toast/ToastContext';
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
    const { getColor } = useTheme();
    const [email, setEmail] = useState('trwisinthehouse@gmail.com'); // TODO: DEV
    const [password, setPassword] = useState('pass'); // TODO: DEV
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
        <SafeAreaView className="bg-background flex-1 p-5 justify-center">
            <Text className="text-on-background text-3xl font-bold mb-2.5 text-center">Pat</Text>
            <Text className="text-on-background-variant text-base mb-8 text-center">Your personal planner and tracker.</Text>

            <TextInput
                className="bg-surface text-on-surface h-[50px] border border-outline rounded-lg mb-4 px-3 text-base"
                placeholder="Email"
                placeholderTextColor={getColor("on-surface-variant")}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                className="bg-surface text-on-surface h-[50px] border border-outline rounded-lg mb-4 px-3 text-base"
                placeholder="Password"
                placeholderTextColor={getColor("on-surface-variant")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

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
        </SafeAreaView>
    );
}