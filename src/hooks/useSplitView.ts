import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MainStackParamList } from '@/src/navigation/MainStack';

export interface CustomNavigation {
    navigate: <K extends keyof MainStackParamList>(
        screen: K,
        params?: MainStackParamList[K]
    ) => void;
    goBack: () => void;
    popTo: <K extends keyof MainStackParamList>(
        screen: K,
        params?: MainStackParamList[K]
    ) => void;
}

export type SplitViewState = {
    [K in keyof MainStackParamList]: { screen: K; params?: MainStackParamList[K] }
}[keyof MainStackParamList];

export interface UseSplitView {
    isWideScreen: boolean;
    splitViewState: SplitViewState | null;
    openSplitView: <T extends keyof MainStackParamList>(screen: T, params: MainStackParamList[T]) => void;
    closeSplitView: () => void;
    customNavigation: CustomNavigation;
    animatedStyle: any;
}

export function useSplitView<T extends keyof MainStackParamList>(rootName: T): UseSplitView {
    const minWidth = 768;
    const { width } = useWindowDimensions();
    const isWideScreen = width >= minWidth;

    const [splitViewState, setSplitViewState] = useState<SplitViewState | null>(null);
    const [splitViewHistory, setSplitViewHistory] = useState<SplitViewState[]>([]);
    const detailPanelTranslateX = useSharedValue(width);

    const openSplitView = <T extends keyof MainStackParamList>(
        screen: T,
        params: MainStackParamList[T]
    ) => {
        const newState = { screen, params } as SplitViewState;
        setSplitViewState(newState);
        // Clear history when opening fresh from main view
        setSplitViewHistory([]);

        detailPanelTranslateX.value = withSpring(0, {
            damping: 20,
            stiffness: 90
        });
    };

    const closeSplitView = () => {
        detailPanelTranslateX.value = withTiming(width, {
            duration: 250
        });

        setTimeout(() => {
            setSplitViewState(null);
            setSplitViewHistory([]);
        }, 250);
    };

    const customNavigation: CustomNavigation = {
        navigate: (screen, params) => {
            const newState = { screen, params } as SplitViewState;
            if (splitViewState) setSplitViewHistory(prev => [...prev, splitViewState]);
            setSplitViewState(newState);
        },
        goBack: () => {
            if (splitViewHistory.length > 0) {
                const previousState = splitViewHistory[splitViewHistory.length - 1];
                setSplitViewHistory(prev => prev.slice(0, -1));
                setSplitViewState(previousState);
            } else {
                closeSplitView();
            }
        },
        popTo: (screen, params) => {
            if (screen.toString() == rootName.toString()) {
                closeSplitView();
            } else {
                const historyIndex = splitViewHistory.findIndex(state => state.screen === screen);

                if (historyIndex >= 0) {
                    const targetState = splitViewHistory[historyIndex];
                    setSplitViewHistory(prev => prev.slice(0, historyIndex));
                    setSplitViewState(targetState);
                } else {
                    setSplitViewHistory([]);
                    setSplitViewState({ screen, params } as SplitViewState);
                }
            }
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: detailPanelTranslateX.value }]
    }));

    return {
        isWideScreen,
        splitViewState,
        openSplitView,
        closeSplitView,
        customNavigation,
        animatedStyle,
    };
}
