import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from '@/src/app/(auth)/sign-in';
import CreateAccountScreen from '@/src/app/(auth)/create-account';
import VerifyEmailScreen from '@/src/app/(auth)/verify';

export type AuthStackParamList = {
  SignIn: undefined;
  CreateAccount: undefined;
  Verify: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Verify" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
}
