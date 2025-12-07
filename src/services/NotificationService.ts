import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { UpdateUserRequest } from '@timothyw/pat-common';
import { useUserDataStore } from '@/src/stores/useUserDataStore';
import { toastManager } from '@/src/utils/toastUtils';

function handleRegistrationError(errorMessage: string) {
    throw new Error(errorMessage);
}

class NotificationService {
    private static instance: NotificationService;

    private constructor() {}

    public static get shared(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async registerForPushNotificationsAsync(): Promise<string | undefined> {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
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

    async checkNotificationPermissionStatus(): Promise<Notifications.NotificationPermissionsStatus> {
        return await Notifications.getPermissionsAsync();
    }

    async saveDeviceToken(pushToken: string): Promise<void> {
        const { data, updateUserData } = useUserDataStore.getState();

        // Get current devices
        const currentDevices = data?.sandbox?.devices || [];

        // Check if token already exists
        const tokenExists = currentDevices.some(device => device.pushToken === pushToken);
        if (tokenExists) {
            console.log('Device token already registered');
            return;
        }

        // Create new device object
        const newDevice = { pushToken };

        // Create update request
        const updateRequest: UpdateUserRequest = {
            sandbox: {
                ...(data.sandbox || {}),
                devices: [...currentDevices, newDevice]
            }
        };

        await updateUserData(updateRequest);
        console.log('Device token saved successfully');
    }

    async isDeviceRegistered(): Promise<boolean> {
        try {
            const permissionStatus = await this.checkNotificationPermissionStatus();
            if (permissionStatus.status !== 'granted') {
                return false;
            }

            const { data } = useUserDataStore.getState();
            const currentDevices = data?.sandbox?.devices || [];
            return currentDevices.length > 0;
        } catch (error) {
            console.error('Error checking device registration:', error);
            return false;
        }
    }

    /**
     * Checks notification permissions and prompts user to enable if needed.
     * @returns Promise<boolean> - true if should proceed (granted or user dismissed), false if user declined
     */
    async checkAndPromptForNotifications(): Promise<boolean> {
        try {
            const permissionStatus = await Notifications.getPermissionsAsync();

            // Only prompt if: not granted AND we can still ask
            if (permissionStatus.status !== 'granted' && permissionStatus.canAskAgain) {
                return new Promise((resolve) => {
                    Alert.alert(
                        'Enable Push Notifications?',
                        'To receive notifications, you need to enable push notifications. Would you like to enable them now?',
                        [
                            {
                                text: 'Not Now',
                                style: 'cancel',
                                onPress: () => resolve(false)
                            },
                            {
                                text: 'Enable',
                                onPress: async () => {
                                    try {
                                        const token = await this.registerForPushNotificationsAsync();
                                        if (token) {
                                            await this.saveDeviceToken(token);
                                            toastManager.successToast('Notifications enabled successfully');
                                        }
                                        resolve(true);
                                    } catch (error) {
                                        console.error('Failed to enable notifications:', error);
                                        toastManager.errorToast('Failed to enable notifications');
                                        resolve(false);
                                    }
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                });
            }

            // Already granted or can't ask, allow navigation
            return true;
        } catch (error) {
            console.error('Error checking permissions:', error);
            return true; // On error, allow navigation
        }
    }

    async sendTestNotification(expoPushToken: string): Promise<void> {
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
}

export default NotificationService;
