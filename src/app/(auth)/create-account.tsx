import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useToast } from '@/src/components/toast/ToastContext';
import { SafeAreaView } from "react-native-safe-area-context";
import CustomTextInput from '@/src/components/common/CustomTextInput';
import { AuthStackParamList } from '@/src/navigation/AuthStack';

type CreateAccountNavigationProp = StackNavigationProp<AuthStackParamList, 'CreateAccount'>;

export default function CreateAccountScreen() {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const navigation = useNavigation<CreateAccountNavigationProp>();
    const [name, setName] = useState(__DEV__ ? 'test' : '');
    const [email, setEmail] = useState(__DEV__ ? 'test@test.com' : '');
    const [password, setPassword] = useState(__DEV__ ? 'test' : '');
    const [confirmPassword, setConfirmPassword] = useState(__DEV__ ? 'test' : '');
    const [isLoading, setIsLoading] = useState(false);

    const { createAccount } = useAuthStore();

    const handleCreateAccount = async () => {
        if (!name || !email || !password || !confirmPassword) {
            errorToast('Please fill out all fields');
            return;
        }

        if (password !== confirmPassword) {
            errorToast('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await createAccount(name, email, password);
        } catch (error) {
            errorToast(error instanceof Error ? error.message : 'Failed to create an account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="bg-background flex-1 justify-center">
            <View className="max-w-lg w-full mx-auto px-5">
                <Text className="text-on-background text-3xl font-bold mb-2.5 text-center">Pat</Text>
                <Text className="text-on-background-variant text-base mb-8 text-center">Create an account to get started.</Text>

                <View className="mb-4">
                    <CustomTextInput
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        returnKeyType="go"
                        onSubmitEditing={handleCreateAccount}
                    />
                </View>

                <View className="mb-4">
                    <CustomTextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        returnKeyType="go"
                        onSubmitEditing={handleCreateAccount}
                    />
                </View>

                <View className="mb-4">
                    <CustomTextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        returnKeyType="go"
                        onSubmitEditing={handleCreateAccount}
                    />
                </View>

                <View className="mb-4">
                    <CustomTextInput
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        returnKeyType="go"
                        onSubmitEditing={handleCreateAccount}
                    />
                </View>

                <TouchableOpacity
                    className="bg-primary h-[50px] rounded-lg justify-center items-center mt-2.5"
                    onPress={handleCreateAccount}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={getColor("on-primary")} />
                    ) : (
                        <Text className="text-on-primary text-base font-semibold">Create Account</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-5">
                    <Text className="text-on-background-variant">Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text className="text-primary font-semibold">Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}