import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
    ItemId,
    ListId,
    PersonId,
    NotificationEntityType,
    NotificationTemplateLevel,
    NotificationTemplateData,
    HabitId, ListItemId, ThoughtId
} from '@timothyw/pat-common';
import AgendaPanel from "@/src/features/agenda/screens/AgendaScreen";
import InboxPanel from '@/src/features/inbox/screens/InboxScreen';
import ListsPanel from '@/src/features/lists/screens/ListsScreen';
import PeoplePanel from '@/src/features/people/screens/PeopleScreen';
import HabitsPanel from '@/src/features/habits/screens/HabitsScreen';
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
import SettingsPanel from '@/src/features/settings/screens/SettingsScreen';
import DevPanel from '@/src/features/dev/screens/DevScreen';
import NotificationInfoScreen from '@/src/features/notifications/screens/NotificationInfoScreen';
import NotificationFormScreen from '@/src/features/notifications/screens/NotificationFormScreen';
import { SplitScreenConfig } from '@/src/components/layout/SplitViewLayout';

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
        thoughtId?: ThoughtId;
    };

    Inbox: {
        thoughtProcessed?: boolean;
        thoughtId?: ThoughtId;
    } | undefined;

    Lists: undefined;
    ListDetail: {
        listId: ListId;
        thoughtProcessed?: boolean;
        thoughtId?: ThoughtId;
    };
    ListForm: {
        listId?: ListId;
        isEditing?: boolean;
    };
    ListItemDetail: {
        listItemId: ListItemId;
        listId: ListId;
    };
    ListItemForm: {
        listItemId?: ListItemId;
        listId?: ListId;
        isEditing?: boolean;
        allowListChange?: boolean;
        initialName?: string;
        thoughtId?: ThoughtId;
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
        habitId: HabitId;
    };
    HabitForm: {
        habitId?: HabitId;
        isEditing?: boolean;
    };

    Settings: undefined;

    Dev: undefined;

    NotificationInfo: {
        targetLevel: NotificationTemplateLevel;
        targetEntityType: NotificationEntityType;
        targetId: string;
        entityName: string;
    };

    NotificationForm: {
        targetEntityType: NotificationEntityType;
        targetId: string;
        targetLevel: NotificationTemplateLevel;
        template?: NotificationTemplateData;
    };
};

export const splitScreenConfigs = {
    Lists: {
        ListItemDetail: ListItemDetailScreen,
        ListItemForm: ListItemFormScreen,
    },
} as const satisfies Partial<Record<keyof MainStackParamList, SplitScreenConfig>>;

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
            
            <Stack.Screen name="NotificationInfo" component={NotificationInfoScreen} />
            <Stack.Screen name="NotificationForm" component={NotificationFormScreen} />
        </Stack.Navigator>
    );
}