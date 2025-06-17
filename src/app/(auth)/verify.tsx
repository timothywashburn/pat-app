import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';
import { useAuthStore } from "@/src/features/auth/controllers/useAuthStore";
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '@/src/components/toast/ToastContext';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppFocus } from "@/src/hooks/useAppFocus";
import SocketService from "@/src/services/SocketService";

export default function VerifyEmailScreen() {
    const { getColor } = useTheme();
    const { successToast, errorToast } = useToast();
    const [isResending, setIsResending] = useState(false);
    const { resendVerificationEmail, signOut } = useAuthStore();

    useAppFocus(
        useCallback(() => {
            SocketService.shared.sendVerifyEmailCheck();
        }, [])
    );

    const handleResendVerification = async () => {
        setIsResending(true);

        try {
            await resendVerificationEmail();
            successToast('Verification email sent successfully');
        } catch (error) {
            errorToast(error instanceof Error ? error.message : 'Failed to resend verification email');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <SafeAreaView className="bg-background flex-1 p-5 justify-center items-center">
            <Ionicons
                name="mail-outline"
                size={60}
                color={getColor("primary")}
                className="mb-6"
            />

            <Text className="text-on-background text-2xl font-bold mb-2.5 text-center">
                Verify Your Email
            </Text>

            <Text className="text-on-background-variant text-base mb-8 text-center">
                Please check your email for a verification link. You'll need to verify
                your email before continuing.
            </Text>

            <TouchableOpacity
                className="bg-primary w-full h-[50px] rounded-lg justify-center items-center"
                onPress={handleResendVerification}
                disabled={isResending}
            >
                {isResending ? (
                    <ActivityIndicator color={getColor("on-primary")} />
                ) : (
                    <Text className="text-on-primary text-base font-semibold">
                        Resend Verification Email
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-5 py-2.5"
                onPress={signOut}
            >
                <Text className="text-on-error font-semibold text-base">
                    Sign Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}