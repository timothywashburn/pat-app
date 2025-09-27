import { ModuleType } from "@timothyw/pat-common";
import { Ionicons } from "@expo/vector-icons";
import MainStack, { MainStackParamList } from "@/src/navigation/MainStack";
import React from "react";

export const moduleInfo: Record<ModuleType, {
    Component: React.ComponentType;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    initialRouteName?: keyof MainStackParamList;
}> = {
    agenda: { 
        Component: () => <MainStack initialRouteName="Agenda" />,
        icon: 'calendar', 
        title: 'Agenda',
        initialRouteName: 'Agenda'
    },
    inbox: { 
        Component: () => <MainStack initialRouteName="Inbox" />,
        icon: 'mail', 
        title: 'Inbox',
        initialRouteName: 'Inbox'
    },
    lists: { 
        Component: () => <MainStack initialRouteName="Lists" />,
        icon: 'list', 
        title: 'Lists',
        initialRouteName: 'Lists'
    },
    people: { 
        Component: () => <MainStack initialRouteName="People" />,
        icon: 'people', 
        title: 'People',
        initialRouteName: 'People'
    },
    habits: { 
        Component: () => <MainStack initialRouteName="Habits" />,
        icon: 'repeat', 
        title: 'Habits',
        initialRouteName: 'Habits'
    },
    settings: { 
        Component: () => <MainStack initialRouteName="Settings" />,
        icon: 'settings', 
        title: 'Settings',
        initialRouteName: 'Settings'
    },
    dev: { 
        Component: () => <MainStack initialRouteName="Dev" />,
        icon: 'code-slash', 
        title: 'Dev',
        initialRouteName: 'Dev'
    },
};