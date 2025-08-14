import React, { useState, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';
import { useToast } from '@/src/components/toast/ToastContext';

export function useRefreshControl(
    loadFunction: () => Promise<any>, 
    errorMessage: string
) {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            console.log('haptics not available:', err);
        }

        try {
            await loadFunction();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : errorMessage;
            errorToast(errorMsg);
        } finally {
            setIsRefreshing(false);
        }
    }, [loadFunction, errorMessage, errorToast]);

    const refreshControl = (
        <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[getColor("primary")]}
            tintColor={getColor("primary")}
        />
    );

    return { isRefreshing, handleRefresh, refreshControl };
}