import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/src/controllers/ThemeManager';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";

export default function LoginScreen() {
    const { getColor } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await signIn(email, password);
            router.replace('/(tabs)/agenda');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="bg-background flex-1 p-5 justify-center">
            <Text className="text-on-background text-3xl font-bold mb-2.5 text-center">Welcome to PAT</Text>
            <Text className="text-on-background-variant text-base mb-8 text-center">Sign in to continue</Text>

            {error && <Text className="text-unknown mb-4 text-center">{error}</Text>}

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
                onPress={handleLogin}
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
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-semibold">Register</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}