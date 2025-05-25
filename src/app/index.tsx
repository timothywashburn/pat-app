import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/features/auth/controllers/useAuthStore';
import { useUserDataStore } from "@/src/features/settings/controllers/useUserDataStore";

export default function Index() {
    const { getFirstModule } = useUserDataStore();

    return <Redirect href={`/(tabs)/${getFirstModule()}`} />;
}