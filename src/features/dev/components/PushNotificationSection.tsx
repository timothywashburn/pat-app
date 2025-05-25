import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useTheme } from '@/src/controllers/ThemeManager';
import DevPanelSection from './DevPanelSection';
import { UpdateUserRequest } from '@timothyw/pat-common';
import { DataState } from "@/src/features/settings/controllers/useUserDataStore";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

async function sendPushNotification(expoPushToken: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Dev Panel Notification',
        body: 'This is a test notification from Dev Panel!',
        data: { screen: 'DevPanel' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            handleRegistrationError('Permission not granted to get push token for push notification!');
            return;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            handleRegistrationError('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(pushTokenString);
            return pushTokenString;
        } catch (e: unknown) {
            handleRegistrationError(`${e}`);
        }
    } else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}

const PushNotificationSection = () => {
    const { getColor } = useTheme();
    const { data } = DataState();
    const [expoPushToken, setExpoPushToken] = useState<string>('ExponentPushToken[TEMP_TOKEN]');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        notificationListener.current = Notifications.addNotificationReceivedListener(notificationReceived => {
            console.log('notification received');
            setNotification(notificationReceived);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('notification response');
            console.log(response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    const handleRegisterForPushNotifications = async () => {
        setIsRegistering(true);
        try {
            const token = await registerForPushNotificationsAsync();
            setExpoPushToken(token ?? '');
        } catch (error: any) {
            console.log('push notification registration error:')
            console.log(error)
            setExpoPushToken(`Error: ${error}`);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleSendNotification = async () => {
        if (expoPushToken && !expoPushToken.startsWith('Error:')) {
            setIsSending(true);
            try {
                await sendPushNotification(expoPushToken);
            } catch (error) {
                console.log('error sending notification:')
                console.log(error)
                alert(`Failed to send notification: ${error}`);
            } finally {
                setIsSending(false);
            }
        } else {
            alert('Valid push token not available');
        }
    };

    const handleSaveDevice = async () => {
        if (expoPushToken && !expoPushToken.startsWith('Error:')) {
            setIsSaving(true);
            try {
                // Get current devices
                const currentDevices = data?.sandbox?.devices || [];

                // Check if token already exists
                const tokenExists = currentDevices.some(device => device.pushToken === expoPushToken);
                if (tokenExists) {
                    alert('This device is already registered');
                    setIsSaving(false);
                    return;
                }

                // Create new device object
                const newDevice = { pushToken: expoPushToken };

                // Create update request
                const updateRequest: UpdateUserRequest = {
                    sandbox: {
                        ...(data.sandbox || {}),
                        devices: [...currentDevices, newDevice]
                    }
                };

                await DataState.getState().updateUserData(updateRequest);
                console.log('device added')
                alert('Device registered successfully');
            } catch (error) {
                console.log('error saving device:')
                console.log(error)
                alert(`Failed to save device: ${error}`);
            } finally {
                setIsSaving(false);
            }
        } else {
            alert('Valid push token not available');
        }
    };

    return (
        <DevPanelSection title="Push Notifications">
            <Text className="text-on-surface-variant text-sm mb-4">Your Expo push token: {expoPushToken || 'Not registered yet'}</Text>

            {notification && (
                <View className="bg-surface-variant p-3 rounded-md mb-4">
                    <Text className="text-on-surface-variant font-medium">Last Notification:</Text>
                    <Text className="text-on-surface-variant">Title: {notification.request?.content?.title || 'N/A'}</Text>
                    <Text className="text-on-surface-variant">Body: {notification.request?.content?.body || 'N/A'}</Text>
                    <Text className="text-on-surface-variant">Data: {notification.request?.content?.data ? JSON.stringify(notification.request.content.data) : 'N/A'}</Text>
                </View>
            )}

            <TouchableOpacity
                className={`h-[50px] rounded-lg justify-center items-center mt-2.5 ${
                    isRegistering
                        ? "bg-error"
                        : "bg-primary"
                }`}
                onPress={handleRegisterForPushNotifications}
                disabled={isRegistering}
            >
                {isRegistering ? (
                    <ActivityIndicator color={getColor("on-primary")} />
                ) : (
                    <Text className="text-on-primary text-base font-semibold">Register for Push Notifications</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                className={`h-[50px] rounded-lg justify-center items-center mt-2.5 ${
                    isSending || !expoPushToken || expoPushToken.startsWith('Error:')
                        ? "bg-error"
                        : "bg-primary"
                }`}
                onPress={handleSendNotification}
                disabled={isSending || !expoPushToken || expoPushToken.startsWith('Error:')}
            >
                {isSending ? (
                    <ActivityIndicator color={getColor("on-primary")} />
                ) : (
                    <Text className="text-on-primary text-base font-semibold">Send Test Notification</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                className={`h-[50px] rounded-lg justify-center items-center mt-2.5 ${
                    isSaving || !expoPushToken || expoPushToken.startsWith('Error:')
                        ? "bg-error"
                        : "bg-success"
                }`}
                onPress={handleSaveDevice}
                disabled={isSaving || !expoPushToken || expoPushToken.startsWith('Error:')}
            >
                {isSaving ? (
                    <ActivityIndicator color={getColor("on-success")} />
                ) : (
                    <Text className="text-on-success text-base font-semibold">Save as Device</Text>
                )}
            </TouchableOpacity>
        </DevPanelSection>
    );
};

export default PushNotificationSection;