import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeManager';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";

export default function RegisterScreen() {
    const { getColor } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { registerAccount } = useAuthStore();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill out all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await registerAccount(name, email, password);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 p-5 justify-center bg-background">
            <Text className="text-3xl font-bold mb-2.5 text-center text-primary">Create Account</Text>
            <Text className="text-base text-secondary mb-8 text-center">Sign up to get started</Text>

            {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

            <TextInput
                className="h-[50px] border border-unset rounded-lg mb-4 px-3 text-base text-primary"
                placeholder="Full Name"
                placeholderTextColor={getColor("unknown")}
                value={name}
                onChangeText={setName}
            />

            <TextInput
                className="h-[50px] border border-unset rounded-lg mb-4 px-3 text-base text-primary"
                placeholder="Email"
                placeholderTextColor={getColor("unknown")}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                className="h-[50px] border border-unset rounded-lg mb-4 px-3 text-base text-primary"
                placeholder="Password"
                placeholderTextColor={getColor("unknown")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                className="h-[50px] border border-unset rounded-lg mb-4 px-3 text-base text-primary"
                placeholder="Confirm Password"
                placeholderTextColor={getColor("unknown")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity
                className="bg-accent h-[50px] rounded-lg justify-center items-center mt-2.5"
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white text-base font-semibold">Register</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-5">
                <Text className="text-secondary">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-accent font-semibold">Sign In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}