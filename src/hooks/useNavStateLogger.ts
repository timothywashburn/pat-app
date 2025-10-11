import { useEffect } from 'react';
import { NavigationProp } from '@react-navigation/native';

export const useNavStateLogger = (navigation: NavigationProp<any>, componentName: string) => {
    useEffect(() => {
        return navigation.addListener('state', () => {
            const navState = navigation.getState();
            console.log(`[${componentName}] nav state changed:`, navState.routes.map(r => r.name));
        });
    }, [navigation, componentName]);
};
