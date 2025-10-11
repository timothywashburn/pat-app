import { MainStackParamList } from './MainStack';

/**
 * Custom navigation interface for split-view scenarios
 * Provides navigation methods that can be intercepted in wide-screen layouts
 */
export interface CustomNavigation {
    navigate: <RouteName extends keyof MainStackParamList>(
        screen: RouteName,
        params: MainStackParamList[RouteName]
    ) => void;
    goBack: () => void;
    popTo: <RouteName extends keyof MainStackParamList>(
        screen: RouteName,
        params?: MainStackParamList[RouteName]
    ) => void;
}
