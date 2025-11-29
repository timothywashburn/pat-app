import { Redirect } from 'expo-router';
import { useUserDataStore } from "@/src/stores/useUserDataStore";
import { ExtensionStorage } from "@bacons/apple-targets";
import { useEffect } from "react";

const widgetStorage = new ExtensionStorage('group.dev.timothyw.patapp')

export default function Index() {
    const { getFirstModule } = useUserDataStore();

    useEffect(() => {
        widgetStorage.set('test', 'Hello World!');
        ExtensionStorage.reloadWidget();
    }, []);

    return <Redirect href={`/(tabs)/${getFirstModule()}`} />;
}