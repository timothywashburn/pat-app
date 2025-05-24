import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/AuthState';
import { useDataStore } from "@/src/features/settings/controllers/UserDataStore";

export default function Index() {
    const { getFirstModule } = useDataStore();

    return <Redirect href={`/(tabs)/${getFirstModule()}`} />;
}