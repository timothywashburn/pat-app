import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const useAppFocus = (onFocus: () => void) => {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                onFocus();
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription?.remove();
        };
    }, [onFocus]);
};