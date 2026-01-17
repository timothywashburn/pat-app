import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useToast } from '@/src/components/toast/ToastContext';
import { SafeAreaView } from "react-native-safe-area-context";
import CustomTextInput from '@/src/components/common/CustomTextInput';
import { AuthStackParamList } from '@/src/navigation/AuthStack';
import { RootStackParamList } from '@/src/navigation/RootNavigator';

type SignInNavigationProp = StackNavigationProp<RootStackParamList>;
type SignInRouteProp = RouteProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen() {
    const { getColor } = useTheme();
    const route = useRoute<SignInRouteProp>();
    const [email, setEmail] = useState(__DEV__ ? 'trwisinthehouse@gmail.com' : '');
    const [password, setPassword] = useState(__DEV__ ? 'pass' : '');
    const [isLoading, setIsLoading] = useState(false);
    const { errorToast } = useToast();
    const { signIn } = useAuthStore();
    const navigation = useNavigation<SignInNavigationProp>();

    const oauthParams = route.params;
    const isOAuthFlow = oauthParams?.oauth_redirect === 'true';

    const handleSignIn = async () => {
        if (!email || !password) {
            errorToast('Please enter both email and password');
            return;
        }

        setIsLoading(true);

        try {
            await signIn(email, password);

            if (isOAuthFlow && oauthParams?.pending_id) {
                navigation.navigate('OAuthConsent', {
                    pending_id: oauthParams.pending_id,
                    client_name: oauthParams.client_name,
                    scopes: oauthParams.scopes,
                    redirect_uri: oauthParams.redirect_uri,
                    state: oauthParams.state,
                });
            }
        } catch (error) {
            errorToast(error instanceof Error ? error.message : 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="bg-background flex-1 justify-center">
            <View className="max-w-lg w-full mx-auto px-5">
                {isOAuthFlow && (
                    <View className="mb-4 bg-surface-container rounded-lg p-4">
                        <Text className="text-on-surface text-sm text-center">
                            Sign in to authorize {oauthParams?.client_name || 'this application'}
                        </Text>
                    </View>
                )}

                <Text className="text-on-background text-3xl font-bold mb-2.5 text-center">Pat</Text>
                <Text className="text-on-background-variant text-base mb-8 text-center">Your personal planner and tracker.</Text>

                <View className="mb-4">
                    <CustomTextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        returnKeyType="go"
                        onSubmitEditing={handleSignIn}
                    />
                </View>

                <View className="mb-4">
                    <CustomTextInput
                        placeholder="Password"
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
                    <TouchableOpacity onPress={() => navigation.navigate('AuthStack', { screen: 'CreateAccount' })}>
                        <Text className="text-primary font-semibold">Create an account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}