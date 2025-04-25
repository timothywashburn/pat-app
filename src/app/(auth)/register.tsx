import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/src/controllers/ThemeManager';
import { useAuthStore } from "@/src/features/auth/controllers/AuthState";

export default function RegisterScreen() {
    const { getColor } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuthStore();

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
            await register(name, email, password);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="bg-background flex-1 p-5 justify-center">
            <Text className="text-on-background text-3xl font-bold mb-2.5 text-center">Create Account</Text>
            <Text className="text-on-background-variant text-base mb-8 text-center">Sign up to get started</Text>

            {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

            <TextInput
                className="bg-surface text-on-surface h-[50px] border border-outline rounded-lg mb-4 px-3 text-base"
                placeholder="Full Name"
                placeholderTextColor={getColor("on-surface-variant")}
                value={name}
                onChangeText={setName}
            />

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

            <TextInput
                className="bg-surface text-on-surface h-[50px] border border-outline rounded-lg mb-4 px-3 text-base"
                placeholder="Confirm Password"
                placeholderTextColor={getColor("on-surface-variant")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity
                className="bg-primary h-[50px] rounded-lg justify-center items-center mt-2.5"
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={getColor("on-primary")} />
                ) : (
                    <Text className="text-on-primary text-base font-semibold">Register</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-5">
                <Text className="text-on-background-variant">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-semibold">Sign In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}