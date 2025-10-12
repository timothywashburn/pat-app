import React, { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { CustomNavigation, UseSplitView } from "@/src/hooks/useSplitView";

export type SplitScreenConfig = {
    [K in keyof MainStackParamList]?: React.ComponentType<{
        navigation?: any;
        route?: any;
        customNavigation?: CustomNavigation;
        customParams?: MainStackParamList[K];
    }>;
};

export interface SplitViewLayoutProps {
    mainContent: ReactNode;
    splitScreenConfig: SplitScreenConfig;
    splitView: UseSplitView;
    maxCenteredWidth?: number;
    centeredWidthPercentage?: number;
}

export const SplitViewLayout: React.FC<SplitViewLayoutProps> = ({
    mainContent,
    splitScreenConfig,
    splitView,
    maxCenteredWidth = 600,
    centeredWidthPercentage = 0.6,
}) => {
    const { width } = useWindowDimensions();

    const { isWideScreen, splitViewState, customNavigation, animatedStyle } = splitView;

    const renderSplitViewScreen = () => {
        if (!splitViewState) return null;

        const { screen, params } = splitViewState;
        const ScreenComponent = splitScreenConfig[screen];

        if (!ScreenComponent) {
            console.warn(`[SplitViewLayout] No component found for screen: ${screen}`);
            return null;
        }

        return (
            <ScreenComponent
                customParams={params as any}
                customNavigation={customNavigation}
            />
        );
    };

    if (!isWideScreen) return <>{mainContent}</>;

    return (
        <View className="flex-1 flex-row">
            <View
                className={splitViewState ? 'items-start' : 'flex-1 items-center'}
                style={{ flex: splitViewState ? 1 : undefined }}
            >
                <View
                    className="flex-1"
                    style={{
                        width: splitViewState
                            ? '100%'
                            : Math.min(maxCenteredWidth, width * centeredWidthPercentage)
                    }}
                >
                    {mainContent}
                </View>
            </View>

            {splitViewState && (
                <Animated.View
                    className="flex-1 border-l border-divider"
                    style={animatedStyle}
                >
                    {renderSplitViewScreen()}
                </Animated.View>
            )}
        </View>
    );
};
