import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/AuthState';

export default function Index() {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ?
        <Redirect href="/(tabs)/agenda"/> :
        <Redirect href="/(auth)/login"/>;
}