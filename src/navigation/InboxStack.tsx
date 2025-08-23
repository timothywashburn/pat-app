import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AgendaItemData, ListId, ListItemData } from '@timothyw/pat-common';
import InboxPanel from '@/src/app/(tabs)/inbox';
import AgendaItemFormScreen from '@/src/features/agenda/screens/AgendaItemFormScreen';
import ListItemFormScreen from '@/src/features/lists/screens/ListItemFormScreen';
import { AgendaStackParamList } from "@/src/navigation/AgendaStack";
import { ListsStackParamList } from "@/src/navigation/ListsStack";

export type InboxStackParamList = {
    InboxList: undefined;
    AgendaItemForm: AgendaStackParamList['AgendaItemForm'];
    ListItemForm: ListsStackParamList['ListItemForm'];
};

const Stack = createStackNavigator<InboxStackParamList>();

export default function InboxStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We'll handle headers ourselves
            }}
        >
            <Stack.Screen name="InboxList" component={InboxPanel} />
            <Stack.Screen name="AgendaItemForm" component={AgendaItemFormScreen} />
            <Stack.Screen name="ListItemForm" component={ListItemFormScreen} />
        </Stack.Navigator>
    );
}