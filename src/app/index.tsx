import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/AuthState';
import { useConfigStore } from "@/src/features/settings/controllers/ConfigStore";

export default function Index() {
    const { getFirstPanel } = useConfigStore();

    return <Redirect href={`/(tabs)/${getFirstPanel().type}`} />;
}