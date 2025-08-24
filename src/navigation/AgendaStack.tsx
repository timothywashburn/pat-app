import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AgendaItemData, ItemId } from '@timothyw/pat-common';
import AgendaPanel from '@/src/app/(tabs)/agenda';
import AgendaItemDetailScreen from '@/src/features/agenda/screens/AgendaItemDetailScreen';
import AgendaItemFormScreen from '@/src/features/agenda/screens/AgendaItemFormScreen';

export type AgendaStackParamList = {
    AgendaList: undefined;
    AgendaItemDetail: {
        itemId: ItemId
    };
    AgendaItemForm: {
        itemId?: ItemId;
        isEditing?: boolean
        initialName?: string;
    };
};

const Stack = createStackNavigator<AgendaStackParamList>();

export default function AgendaStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We'll handle headers ourselves
            }}
        >
            <Stack.Screen name="AgendaList" component={AgendaPanel} />
            <Stack.Screen name="AgendaItemDetail" component={AgendaItemDetailScreen} />
            <Stack.Screen name="AgendaItemForm" component={AgendaItemFormScreen} />
        </Stack.Navigator>
    );
}