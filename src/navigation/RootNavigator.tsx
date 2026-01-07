import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigatorScreenParams, CommonActions, useNavigation } from '@react-navigation/native';
import { AuthStoreStatus, useAuthStore } from '@/src/stores/useAuthStore';
import AuthStack, { AuthStackParamList } from './AuthStack';
import MainStack, { MainStackParamList } from './MainStack';
import NotFoundScreen from '@/src/app/+not-found';

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainStackParamList>;
  NotFound: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { authStoreStatus } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    if (!navigation) return;

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
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}
