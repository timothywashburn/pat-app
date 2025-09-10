import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ItemId, ListId, PersonId, NotificationEntityType, NotificationTemplateLevel, NotificationTemplateData } from '@timothyw/pat-common';
import AgendaPanel from '@/src/app/(tabs)/agenda';
import InboxPanel from '@/src/app/(tabs)/inbox';
import ListsPanel from '@/src/app/(tabs)/lists';
import PeoplePanel from '@/src/app/(tabs)/people';
import HabitsPanel from '@/src/app/(tabs)/habits';
import AgendaItemDetailScreen from '@/src/features/agenda/screens/AgendaItemDetailScreen';
import ListDetailScreen from '@/src/features/lists/screens/ListDetailScreen';
import ListItemDetailScreen from '@/src/features/lists/screens/ListItemDetailScreen';
import PersonDetailScreen from '@/src/features/people/screens/PersonDetailScreen';
import HabitDetailScreen from '@/src/features/habits/screens/HabitDetailScreen';
import AgendaItemFormScreen from '@/src/features/agenda/screens/AgendaItemFormScreen';
import ListFormScreen from '@/src/features/lists/screens/ListFormScreen';
import ListItemFormScreen from '@/src/features/lists/screens/ListItemFormScreen';
import PersonFormScreen from '@/src/features/people/screens/PersonFormScreen';
import HabitFormScreen from '@/src/features/habits/screens/HabitFormScreen';
import SettingsPanel from '@/src/app/(tabs)/settings';
import DevPanel from '@/src/app/(tabs)/dev';
import NotificationConfigScreen from '@/src/features/notifications/screens/NotificationConfigScreen';
import NotificationTemplateFormScreen from '@/src/features/notifications/screens/NotificationTemplateFormScreen';

export type MainStackParamList = {
    Agenda: {
        thoughtProcessed?: boolean;
        thoughtId?: string;
    } | undefined;
    AgendaItemDetail: {
        itemId: ItemId;
    };
    AgendaItemForm: {
        itemId?: ItemId;
        isEditing?: boolean;
        initialName?: string;
        thoughtId?: string;
    };

    Inbox: {
        thoughtProcessed?: boolean;
        thoughtId?: string;
    } | undefined;

    Lists: undefined;
    ListDetail: {
        listId: ListId;
        thoughtProcessed?: boolean;
        thoughtId?: string;
    };
    ListForm: {
        listId?: ListId;
        isEditing?: boolean;
    };
    ListItemDetail: {
        listItemId: string;
        listId: ListId;
    };
    ListItemForm: {
        listItemId?: string;
        listId?: ListId;
        isEditing?: boolean;
        allowListChange?: boolean;
        initialName?: string;
        thoughtId?: string;
    };

    People: undefined;
    PersonDetail: {
        personId: PersonId;
    };
    PersonForm: {
        personId?: PersonId;
        isEditing?: boolean;
    };

    Habits: undefined;
    HabitDetail: {
        habitId: string;
    };
    HabitForm: {
        habitId?: string;
        isEditing?: boolean;
    };

    Settings: undefined;

    Dev: undefined;

    NotificationConfig: {
        targetLevel: NotificationTemplateLevel;
        targetEntityType: NotificationEntityType;
        targetId: string;
        entityName: string;
    };

    NotificationTemplateForm: {
        targetEntityType: NotificationEntityType;
        targetId: string;
        targetLevel: NotificationTemplateLevel;
        template?: NotificationTemplateData;
    };
};

const Stack = createStackNavigator<MainStackParamList>();

interface MainStackProps {
    initialRouteName?: keyof MainStackParamList;
}

export default function MainStack({ initialRouteName }: MainStackProps) {
    return (
        <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Agenda" component={AgendaPanel} />
            <Stack.Screen name="AgendaItemDetail" component={AgendaItemDetailScreen} />
            <Stack.Screen name="AgendaItemForm" component={AgendaItemFormScreen} />

            <Stack.Screen name="Inbox" component={InboxPanel} />

            <Stack.Screen name="Lists" component={ListsPanel} />
            <Stack.Screen name="ListDetail" component={ListDetailScreen} />
            <Stack.Screen name="ListForm" component={ListFormScreen} />
            <Stack.Screen name="ListItemDetail" component={ListItemDetailScreen} />
            <Stack.Screen name="ListItemForm" component={ListItemFormScreen} />

            <Stack.Screen name="People" component={PeoplePanel} />
            <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
            <Stack.Screen name="PersonForm" component={PersonFormScreen} />

            <Stack.Screen name="Habits" component={HabitsPanel} />
            <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
            <Stack.Screen name="HabitForm" component={HabitFormScreen} />

            <Stack.Screen name="Settings" component={SettingsPanel} />

            <Stack.Screen name="Dev" component={DevPanel} />
            
            <Stack.Screen name="NotificationConfig" component={NotificationConfigScreen} />
            <Stack.Screen name="NotificationTemplateForm" component={NotificationTemplateFormScreen} />
        </Stack.Navigator>
    );
}