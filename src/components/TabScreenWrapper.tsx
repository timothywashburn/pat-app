import React from 'react';
import { View, Platform } from 'react-native';
import WebHeader from './WebHeader';
import { useUserDataStore } from '@/src/stores/useUserDataStore';

interface TabScreenWrapperProps {
    children: React.ReactNode;
}

export default function TabScreenWrapper({ children }: TabScreenWrapperProps) {
    const { data } = useUserDataStore();
    const isWeb = Platform.OS === 'web';

    return (
        <View style={{ flex: 1 }}>
            {isWeb && <WebHeader modules={data?.config.modules} />}
            {children}
        </View>
    );
}
