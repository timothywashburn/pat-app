import React, { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigatorScreenParams, CommonActions, useNavigation } from '@react-navigation/native';
import { AuthStoreStatus, useAuthStore } from '@/src/stores/useAuthStore';
import AuthStack, { AuthStackParamList } from './AuthStack';
import MainStack, { MainStackParamList } from './MainStack';
import NotFoundScreen from '@/src/app/+not-found';
import OAuthConsentScreen from '@/src/app/(auth)/oauth-consent';

export type OAuthConsentParams = {
  pending_id?: string;
  client_name?: string;
  scopes?: string;
  redirect_uri?: string;
  state?: string;
};

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainStackParamList>;
  OAuthConsent: OAuthConsentParams;
  NotFound: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { authStoreStatus } = useAuthStore();
  const navigation = useNavigation();

  // TODO: possible cleanup
  const isOAuthConsentUrl = (): boolean => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.pathname.includes('/oauth/consent');
    }
    return false;
  }

  const isOAuthSignInUrl = (): boolean => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.location.pathname.includes('/sign-in') &&
             window.location.search.includes('oauth_redirect=true');
    }
    return false;
  }

  useEffect(() => {
    if (!navigation) return;

    const state = navigation.getState();
    const currentRoute = state?.routes[state.index]?.name;

    if (currentRoute === 'OAuthConsent' || isOAuthConsentUrl() || isOAuthSignInUrl()) return;

    if (authStoreStatus === AuthStoreStatus.NOT_AUTHENTICATED) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'AuthStack', params: { screen: 'SignIn' } }],
        })
      );
    } else if (authStoreStatus === AuthStoreStatus.AUTHENTICATED_NO_EMAIL) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'AuthStack', params: { screen: 'Verify' } }],
        })
      );
    } else if (authStoreStatus === AuthStoreStatus.FULLY_AUTHENTICATED) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainStack' }],
        })
      );
    }
  }, [authStoreStatus, navigation]);

  // Initial route based on auth status
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (authStoreStatus === AuthStoreStatus.FULLY_AUTHENTICATED) {
      return 'MainStack';
    }
    return 'AuthStack';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="MainStack" component={MainStack} />
      <Stack.Screen name="OAuthConsent" component={OAuthConsentScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}
