import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useUserDataStore } from "@/src/stores/useUserDataStore";

export default function Index() {
    const { getFirstModule } = useUserDataStore();

    return <Redirect href={`/(tabs)/${getFirstModule()}`} />;
}