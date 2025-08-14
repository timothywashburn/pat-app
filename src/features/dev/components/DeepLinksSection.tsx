import React, { useState } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import DevPanelSection from './DevPanelSection';

const DeepLinkSection = () => {
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenDeepLink = async () => {
        try {
            Linking.openURL('dev.timothyw.patapp://redirect');
            console.log("opening url: dev.timothyw.patapp://redirect")
        } catch (err) {
            console.log('cannot open url:', err);
        }
    };

    return (
        <DevPanelSection title="Deep Links">
            <TouchableOpacity
                className={`h-[50px] rounded-lg justify-center items-center mt-2.5 ${
                    isLoading
                        ? "bg-error"
                        : "bg-primary"
                }`}
                onPress={handleOpenDeepLink}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={getColor("on-primary")} />
                ) : (
                    <Text className="text-on-primary text-base font-semibold">Open verify-success</Text>
                )}
            </TouchableOpacity>
        </DevPanelSection>
    );
};

export default DeepLinkSection;