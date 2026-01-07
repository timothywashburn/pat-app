import { ModuleType } from "@timothyw/pat-common";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import AgendaPanel from "@/src/features/agenda/screens/AgendaScreen";
import InboxPanel from '@/src/features/inbox/screens/InboxScreen';
import ListsPanel from '@/src/features/lists/screens/ListsScreen';
import PeoplePanel from '@/src/features/people/screens/PeopleScreen';
import HabitsPanel from '@/src/features/habits/screens/HabitsScreen';
import SettingsPanel from '@/src/features/settings/screens/SettingsScreen';
import DevPanel from '@/src/features/dev/screens/DevScreen';

export const moduleInfo: Record<ModuleType, {
    Component: React.ComponentType<any>; // TODO: maybe fix this any type
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
}> = {
    agenda: {
        Component: AgendaPanel,
        icon: 'calendar',
        title: 'Agenda',
    },
    inbox: {
        Component: InboxPanel,
        icon: 'mail',
        title: 'Inbox',
    },
    lists: {
        Component: ListsPanel,
        icon: 'list',
        title: 'Lists',
    },
    people: {
        Component: PeoplePanel,
        icon: 'people',
        title: 'People',
    },
    habits: {
        Component: HabitsPanel,
        icon: 'repeat',
        title: 'Habits',
    },
    settings: {
        Component: SettingsPanel,
        icon: 'settings',
        title: 'Settings',
    },
    dev: {
        Component: DevPanel,
        icon: 'code-slash',
        title: 'Dev',
    },
};