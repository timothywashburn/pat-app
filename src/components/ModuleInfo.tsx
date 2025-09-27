import { ModuleType } from "@timothyw/pat-common";
import { Ionicons } from "@expo/vector-icons";
import MainStack from "@/src/navigation/MainStack";
import React from "react";

export const moduleInfo: Record<ModuleType, {
    Component: React.ComponentType;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
}> = {
    agenda: { 
        Component: () => <MainStack initialRouteName="Agenda" />,
        icon: 'calendar', 
        title: 'Agenda',
    },
    inbox: { 
        Component: () => <MainStack initialRouteName="Inbox" />,
        icon: 'mail', 
        title: 'Inbox',
    },
    lists: { 
        Component: () => <MainStack initialRouteName="Lists" />,
        icon: 'list', 
        title: 'Lists',
    },
    people: { 
        Component: () => <MainStack initialRouteName="People" />,
        icon: 'people', 
        title: 'People',
    },
    habits: { 
        Component: () => <MainStack initialRouteName="Habits" />,
        icon: 'repeat', 
        title: 'Habits',
    },
    settings: { 
        Component: () => <MainStack initialRouteName="Settings" />,
        icon: 'settings', 
        title: 'Settings',
    },
    dev: { 
        Component: () => <MainStack initialRouteName="Dev" />,
        icon: 'code-slash', 
        title: 'Dev',
    },
};