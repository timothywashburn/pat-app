import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ListId } from '@timothyw/pat-common';
import ListsPanel from '@/src/app/(tabs)/lists';
import ListDetailScreen from '@/src/features/lists/screens/ListDetailScreen';
import ListFormScreen from '@/src/features/lists/screens/ListFormScreen';
import ListItemDetailScreen from '@/src/features/lists/screens/ListItemDetailScreen';
import ListItemFormScreen from '@/src/features/lists/screens/ListItemFormScreen';
export type ListsStackParamList = {
    ListsList: undefined;
    ListDetail: {
        listId: ListId
    };
    ListForm: {
        listId?: ListId;
        isEditing?: boolean
    };
    ListItemDetail: {
        listItemId: string,
        listId: ListId
    };
    ListItemForm: {
        listItemId?: string;
        listId?: ListId;
        isEditing?: boolean;
        allowListChange?: boolean;
        initialName?: string;
    };
};

const Stack = createStackNavigator<ListsStackParamList>();

export default function ListsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We'll handle headers ourselves
            }}
        >
            <Stack.Screen name="ListsList" component={ListsPanel} />
            <Stack.Screen name="ListDetail" component={ListDetailScreen} />
            <Stack.Screen name="ListForm" component={ListFormScreen} />
            <Stack.Screen name="ListItemDetail" component={ListItemDetailScreen} />
            <Stack.Screen name="ListItemForm" component={ListItemFormScreen} />
        </Stack.Navigator>
    );
}