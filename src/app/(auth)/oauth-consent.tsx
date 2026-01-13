import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/src/context/ThemeContext';
import { useToast } from '@/src/components/toast/ToastContext';
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from '@/src/navigation/RootNavigator';
import PatConfig from "@/src/misc/PatConfig";
import { useAuthStore } from "@/src/stores/useAuthStore";

type OAuthConsentRouteProp = RouteProp<RootStackParamList, 'OAuthConsent'>;

export default function OAuthConsentScreen() {
    const { getColor } = useTheme();
    const route = useRoute<OAuthConsentRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { errorToast } = useToast();
    const { authTokens } = useAuthStore();

    const { pending_id, client_name, scopes, redirect_uri, state } = route.params || {};

    const [isLoading, setIsLoading] = useState(false);

    const scopeList = scopes ? scopes.split(',').filter(Boolean) : [];
    const displayScopes = scopeList.length > 0 ? scopeList.join(', ') : 'full access';

    useEffect(() => {
        if (!pending_id || !redirect_uri) {
            errorToast('Invalid or missing authorization parameters');
            return;
        }

        if (!authTokens?.accessToken) {
            navigation.navigate('AuthStack', {
                screen: 'SignIn',
                params: {
                    oauth_redirect: 'true',
                    pending_id,
                    client_name,
                    scopes,
                    redirect_uri,
                    state,
                }
            });
        }
    }, [pending_id, redirect_uri, authTokens]);

    const handleAuthorize = async () => {
        if (!pending_id) {
            errorToast('Invalid authorization request');
            return;
        }

        // Check if user is authenticated
        if (!authTokens?.accessToken) {
            errorToast('You must be signed in to authorize this application');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${PatConfig.apiURL}/oauth/complete-authorization`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.accessToken}`,
                },
                body: JSON.stringify({
                    pending_id,
                }),
            });

            const data = await response.json();

            // Handle token expiration
            if (!data.success && response.status === 401) {
                errorToast('Your session has expired. Please sign in again.');
                // Redirect back to sign-in with OAuth params
                navigation.navigate('AuthStack', {
                    screen: 'SignIn',
                    params: {
                        oauth_redirect: 'true',
                        pending_id,
                        client_name,
                        scopes,
                        redirect_uri,
                        state,
                    }
                });
                return;
            }

            if (!data.success) {
                errorToast(data.error || 'Authorization failed');
                return;
            }

            // Redirect to the OAuth client
            if (Platform.OS === 'web') {
                window.location.href = data.redirectUrl;
            } else {
                await Linking.openURL(data.redirectUrl);
            }
        } catch (error) {
            errorToast(error instanceof Error ? error.message : 'Failed to authorize');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (!redirect_uri) return;

        const cancelUrl = new URL(redirect_uri);
        cancelUrl.searchParams.set('error', 'access_denied');
        cancelUrl.searchParams.set('error_description', 'User cancelled authorization');
        if (state) {
            cancelUrl.searchParams.set('state', state);
        }

        if (Platform.OS === 'web') {
            window.location.href = cancelUrl.toString();
        } else {
            Linking.openURL(cancelUrl.toString());
        }
    };

    return (
        <SafeAreaView className="bg-background flex-1 justify-center">
            <View className="max-w-lg w-full mx-auto px-5">
                <Text className="text-on-background text-3xl font-bold mb-2.5 text-center">Authorize Access</Text>

                <View className="bg-surface-container rounded-lg p-4 mb-6">
                    <Text className="text-on-surface text-lg font-semibold text-center mb-2">
                        {client_name || 'An application'}
                    </Text>
                    <Text className="text-on-surface-variant text-sm text-center">
                        wants access to: {displayScopes}
                    </Text>
                </View>

                <Text className="text-on-background-variant text-sm mb-4 text-center">
                    Click "Authorize" to grant access to this application
                </Text>

                <TouchableOpacity
                    className="bg-primary h-[50px] rounded-lg justify-center items-center mt-2.5"
                    onPress={handleAuthorize}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={getColor("on-primary")} />
                    ) : (
                        <Text className="text-on-primary text-base font-semibold">Authorize</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="h-[50px] rounded-lg justify-center items-center mt-2.5"
                    onPress={handleCancel}
                    disabled={isLoading}
                >
                    <Text className="text-on-background-variant text-base">Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
