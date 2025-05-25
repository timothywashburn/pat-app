import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';
import DevPanelSection from './DevPanelSection';
import { UpdateUserRequest } from '@timothyw/pat-common';
import { DataState } from "@/src/features/settings/controllers/useUserDataStore";

const DevicesSection = () => {
    const { getColor } = useTheme();
    const { data } = DataState();
    const [isClearing, setIsClearing] = useState(false);

    const devices = data?.sandbox?.devices || [];

    const handleClearDevices = async () => {
        setIsClearing(true);
        try {
            // Create update request with empty devices array
            const updateRequest: UpdateUserRequest = {
                sandbox: {
                    ...(data.sandbox || {}),
                    devices: []
                }
            };

            await DataState.getState().updateUserData(updateRequest);
            console.log('all devices cleared')
        } catch (error) {
            console.log('error clearing devices:')
            console.log(error)
            alert(`Failed to clear devices: ${error}`);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <DevPanelSection title="User Devices">
            <Text className="text-on-surface-variant text-sm mb-2">
                Registered devices: {devices.length || 0}
            </Text>

            {devices.length > 0 ? (
                <View className="mb-4">
                    {devices.map((device, index) => (
                        <View key={`device-${index}`} className="bg-surface-variant p-3 rounded-md mb-2">
                            <Text className="text-on-surface-variant">Push Token: {device.pushToken}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text className="text-on-surface-variant italic mb-4">No devices registered</Text>
            )}

            <TouchableOpacity
                className={`h-[50px] rounded-lg justify-center items-center mt-2.5 ${
                    isClearing || devices.length === 0
                        ? "bg-error"
                        : "bg-primary"
                }`}
                onPress={handleClearDevices}
                disabled={isClearing || devices.length === 0}
            >
                {isClearing ? (
                    <ActivityIndicator color={getColor("on-primary")} />
                ) : (
                    <Text className="text-on-primary text-base font-semibold">
                        Clear All Devices
                    </Text>
                )}
            </TouchableOpacity>
        </DevPanelSection>
    );
};

export default DevicesSection;