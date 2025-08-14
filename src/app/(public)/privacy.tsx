import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';

const Privacy: React.FC = () => {
    const { colorScheme } = useTheme();

    return (
        <SafeAreaView className="bg-background flex-1">
            <ScrollView className="flex-1 p-4">
                <View className="max-w-4xl mx-auto">
                    <Text className="text-on-surface text-3xl font-bold mb-6">
                        Privacy Policy
                    </Text>
                    
                    <Text className="text-on-surface-variant text-sm mb-8">
                        Last updated: {new Date().toLocaleDateString()}
                    </Text>

                    <View className="space-y-6">
                        <View>
                            <Text className="text-on-surface text-xl font-semibold mb-3">
                                Information We Collect
                            </Text>
                            <Text className="text-on-surface-variant leading-relaxed mb-4">
                                We collect information you provide directly to us, such as when you create an account, 
                                use our services, or contact us for support.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-on-surface text-xl font-semibold mb-3">
                                How We Use Your Information
                            </Text>
                            <Text className="text-on-surface-variant leading-relaxed mb-4">
                                We use the information we collect to provide, maintain, and improve our services, 
                                process transactions, and communicate with you.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-on-surface text-xl font-semibold mb-3">
                                Information Sharing
                            </Text>
                            <Text className="text-on-surface-variant leading-relaxed mb-4">
                                We do not sell, trade, or otherwise transfer your personal information to third parties 
                                without your consent, except as described in this policy.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-on-surface text-xl font-semibold mb-3">
                                Data Security
                            </Text>
                            <Text className="text-on-surface-variant leading-relaxed mb-4">
                                We implement appropriate security measures to protect your personal information against 
                                unauthorized access, alteration, disclosure, or destruction.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-on-surface text-xl font-semibold mb-3">
                                Contact Us
                            </Text>
                            <Text className="text-on-surface-variant leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at [your-email@example.com].
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Privacy;