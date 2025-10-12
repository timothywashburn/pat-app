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
    const detailPanelTranslateX = useSharedValue(width);

    const openSplitView = <T extends keyof MainStackParamList>(
        screen: T,
        params: MainStackParamList[T]
    ) => {
        setSplitViewState({ screen, params } as SplitViewState);

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
        }, 250);
    };

    const customNavigation: CustomNavigation = {
        navigate: (screen, params) => {
            setSplitViewState({ screen, params } as SplitViewState);
        },
        goBack: () => {
            closeSplitView();
        },
        popTo: (screen, params) => {
            if (screen.toString() == rootName.toString()) {
                closeSplitView();
            } else {
                setSplitViewState({ screen, params } as SplitViewState);
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
