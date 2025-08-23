import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ListId, ListItemData, ListData } from '@timothyw/pat-common';
import ListsPanel from '@/src/app/(tabs)/lists';
import ListDetailScreen from '@/src/features/lists/screens/ListDetailScreen';
import ListFormScreen from '@/src/features/lists/screens/ListFormScreen';
import ListItemDetailScreen from '@/src/features/lists/screens/ListItemDetailScreen';
import ListItemFormScreen from '@/src/features/lists/screens/ListItemFormScreen';
import { ListWithItems } from "@/src/features/lists/models";

export type ListsStackParamList = {
    ListsList: undefined;
    ListDetail: {
        list: ListWithItems
    };
    ListForm: {
        list?: ListWithItems;
        isEditing?: boolean
    };
    ListItemDetail: {
        listItem: ListItemData,
        list: ListWithItems
    };
    ListItemForm: {
        listItem?: ListItemData;
        listId?: ListId;
        isEditing?: boolean;
        lists?: ListWithItems[];
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