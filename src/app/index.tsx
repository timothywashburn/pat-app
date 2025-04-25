import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/AuthState';

export default function Index() {
    return <Redirect href="/(tabs)/agenda" />;
}