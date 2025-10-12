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
    centeredWidthPercentage?: number;
    mainContentFlex?: number;
    detailPanelFlex?: number;
}

export const SplitViewLayout: React.FC<SplitViewLayoutProps> = ({
    mainContent,
    splitScreenConfig,
    splitView,
    centeredWidthPercentage = 100,
    mainContentFlex = 1,
    detailPanelFlex = 1,
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
                style={{ flex: splitViewState ? mainContentFlex : undefined }}
            >
                <View
                    className="flex-1"
                    style={{
                        width: splitViewState
                            ? '100%'
                            : width * centeredWidthPercentage / 100
                    }}
                >
                    {mainContent}
                </View>
            </View>

            {splitViewState && (
                <Animated.View
                    className="border-l border-divider"
                    style={[animatedStyle, { flex: detailPanelFlex }]}
                >
                    {renderSplitViewScreen()}
                </Animated.View>
            )}
        </View>
    );
};
