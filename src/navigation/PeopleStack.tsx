import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PersonId } from '@timothyw/pat-common';
import PeoplePanel from '@/src/app/(tabs)/people';
import PersonDetailScreen from '@/src/features/people/screens/PersonDetailScreen';
import PersonFormScreen from '@/src/features/people/screens/PersonFormScreen';

export type PeopleStackParamList = {
    PeopleList: undefined;
    PersonDetail: {
        personId: PersonId
    };
    PersonForm: {
        personId?: PersonId;
        isEditing?: boolean
    };
};

const Stack = createStackNavigator<PeopleStackParamList>();

export default function PeopleStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We'll handle headers ourselves
            }}
        >
            <Stack.Screen name="PeopleList" component={PeoplePanel} />
            <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
            <Stack.Screen name="PersonForm" component={PersonFormScreen} />
        </Stack.Navigator>
    );
}