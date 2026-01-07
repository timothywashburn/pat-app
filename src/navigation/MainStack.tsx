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
import { NavigatorScreenParams } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator, { TabNavigatorParamList } from '@/src/navigation/AppNavigator';
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
import NotificationInfoScreen from '@/src/features/notifications/screens/NotificationInfoScreen';
import NotificationFormScreen from '@/src/features/notifications/screens/NotificationFormScreen';
import { SplitScreenConfig } from '@/src/components/layout/SplitViewLayout';

export type MainStackParamList = {
    Tabs: NavigatorScreenParams<TabNavigatorParamList>;

    AgendaItemDetail: {
        itemId: ItemId;
    };
    AgendaItemForm: {
        itemId?: ItemId;
        isEditing?: boolean;
        initialName?: string;
        thoughtId?: ThoughtId;
    };

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

    PersonDetail: {
        personId: PersonId;
    };
    PersonForm: {
        personId?: PersonId;
        isEditing?: boolean;
    };

    HabitDetail: {
        habitId: HabitId;
    };
    HabitForm: {
        habitId?: HabitId;
        isEditing?: boolean;
    };

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
    Tabs: {
        AgendaItemDetail: AgendaItemDetailScreen,
        AgendaItemForm: AgendaItemFormScreen,
        ListDetail: ListDetailScreen,
        ListForm: ListFormScreen,
        ListItemDetail: ListItemDetailScreen,
        ListItemForm: ListItemFormScreen,
    },
} as const satisfies Partial<Record<keyof MainStackParamList, SplitScreenConfig>>;

const Stack = createStackNavigator<MainStackParamList>();

export default function MainStack() {
    return (
        <SafeAreaView className="bg-background flex-1" edges={['top', 'left', 'right', 'bottom']}>
            <Stack.Navigator
                initialRouteName="Tabs"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="Tabs" component={AppNavigator} />

                <Stack.Screen name="AgendaItemDetail" component={AgendaItemDetailScreen} />
                <Stack.Screen name="AgendaItemForm" component={AgendaItemFormScreen} />

                <Stack.Screen name="ListDetail" component={ListDetailScreen} />
                <Stack.Screen name="ListForm" component={ListFormScreen} />
                <Stack.Screen name="ListItemDetail" component={ListItemDetailScreen} />
                <Stack.Screen name="ListItemForm" component={ListItemFormScreen} />

                <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
                <Stack.Screen name="PersonForm" component={PersonFormScreen} />

                <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
                <Stack.Screen name="HabitForm" component={HabitFormScreen} />

                <Stack.Screen name="NotificationInfo" component={NotificationInfoScreen} />
                <Stack.Screen name="NotificationForm" component={NotificationFormScreen} />
            </Stack.Navigator>
        </SafeAreaView>
    );
}