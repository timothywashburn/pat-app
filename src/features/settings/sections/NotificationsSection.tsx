import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import * as Notifications from 'expo-notifications';
import NotificationService from '@/src/services/NotificationService';
import { useToast } from '@/src/components/toast/ToastContext';
import { useUserDataStore } from '@/src/stores/useUserDataStore';

export const NotificationsSection: React.FC = () => {
    const { getColor } = useTheme();
    const { successToast, errorToast } = useToast();
    const { data } = useUserDataStore();
    const [permissionStatus, setPermissionStatus] = useState<Notifications.NotificationPermissionsStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    useEffect(() => {
        checkPermissionStatus();
    }, []);

    const checkPermissionStatus = async () => {
        setIsCheckingStatus(true);
        try {
            const status = await NotificationService.shared.checkNotificationPermissionStatus();
            setPermissionStatus(status);
        } catch (error) {
            console.error('Failed to check permission status:', error);
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        try {
            const token = await NotificationService.shared.registerForPushNotificationsAsync();
            if (token) {
                await NotificationService.shared.saveDeviceToken(token);
                successToast('Notifications enabled successfully');
                await checkPermissionStatus();
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
            errorToast('Failed to enable notifications. Please check your device settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusText = (): string => {
        if (!permissionStatus) return 'Checking...';

        if (Platform.OS === 'ios' && permissionStatus.ios) {
            const iosStatus = permissionStatus.ios.status;
            switch (iosStatus) {
                case Notifications.IosAuthorizationStatus.AUTHORIZED:
                    return 'Enabled';
                case Notifications.IosAuthorizationStatus.PROVISIONAL:
                    return 'Provisional';
                case Notifications.IosAuthorizationStatus.DENIED:
                    return 'Disabled';
                case Notifications.IosAuthorizationStatus.EPHEMERAL:
                    return 'Temporary';
                case Notifications.IosAuthorizationStatus.NOT_DETERMINED:
                default:
                    return 'Not Set';
            }
        }

        return permissionStatus.granted ? 'Enabled' : 'Disabled';
    };

    const getStatusColor = (): string => {
        if (!permissionStatus) return getColor('on-surface-variant');

        if (Platform.OS === 'ios' && permissionStatus.ios) {
            const iosStatus = permissionStatus.ios.status;
            if (iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
                iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL) {
                return getColor('success');
            }
            if (iosStatus === Notifications.IosAuthorizationStatus.DENIED) {
                return getColor('error');
            }
        }

        return permissionStatus.granted ? getColor('success') : getColor('on-surface-variant');
    };

    const isNotificationEnabled = (): boolean => {
        if (!permissionStatus) return false;

        if (Platform.OS === 'ios' && permissionStatus.ios) {
            const iosStatus = permissionStatus.ios.status;
            return iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
                   iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL;
        }

        return permissionStatus.granted;
    };

    const registeredDevicesCount = data?.sandbox?.devices?.length || 0;

    return (
        <View className="mb-5">
            <Text className="text-on-background text-lg font-bold mb-4">Notifications</Text>

            {isCheckingStatus ? (
                <View className="py-4">
                    <ActivityIndicator size="small" color={getColor('primary')} />
                </View>
            ) : (
                <>
                    <View className="mb-4">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-on-background text-base font-semibold">Status</Text>
                            <View className="flex-row items-center">
                                <View
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: getStatusColor() }}
                                />
                                <Text
                                    className="text-base font-medium"
                                    style={{ color: getStatusColor() }}
                                >
                                    {getStatusText()}
                                </Text>
                            </View>
                        </View>

                        {registeredDevicesCount > 0 && (
                            <Text className="text-on-surface-variant text-sm">
                                {registeredDevicesCount} {registeredDevicesCount === 1 ? 'device' : 'devices'} registered
                            </Text>
                        )}
                    </View>

                    {!isNotificationEnabled() && (
                        <TouchableOpacity
                            onPress={handleEnableNotifications}
                            disabled={isLoading}
                            className={`py-3 px-4 rounded-lg ${
                                isLoading ? 'bg-surface' : 'bg-primary'
                            }`}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center justify-center">
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={getColor('on-primary')} />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="notifications-outline"
                                            size={20}
                                            color={getColor('on-primary')}
                                            className="mr-2"
                                        />
                                        <Text className="text-on-primary text-base font-semibold">
                                            Enable Notifications
                                        </Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}

                    {permissionStatus?.status === 'denied' && (
                        <View className="mt-3 p-3 bg-surface-variant/20 rounded-lg">
                            <Text className="text-on-surface-variant text-sm">
                                Notifications are disabled. To enable them, please go to your device settings and allow notifications for this app.
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};
