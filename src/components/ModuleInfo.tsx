import { ModuleType } from "@timothyw/pat-common";
import { Ionicons } from "@expo/vector-icons";
import MainStack from "@/src/navigation/MainStack";
import React from "react";
import { MainStackParamList } from "@/src/navigation/MainStack";

export const moduleInfo: Record<ModuleType, {
    getComponent: React.ComponentType;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    initialRouteName?: keyof MainStackParamList;
}> = {
    agenda: { 
        getComponent: () => <MainStack initialRouteName="Agenda" />, 
        icon: 'calendar', 
        title: 'Agenda',
        initialRouteName: 'Agenda'
    },
    inbox: { 
        getComponent: () => <MainStack initialRouteName="Inbox" />, 
        icon: 'mail', 
        title: 'Inbox',
        initialRouteName: 'Inbox'
    },
    lists: { 
        getComponent: () => <MainStack initialRouteName="Lists" />, 
        icon: 'list', 
        title: 'Lists',
        initialRouteName: 'Lists'
    },
    people: { 
        getComponent: () => <MainStack initialRouteName="People" />, 
        icon: 'people', 
        title: 'People',
        initialRouteName: 'People'
    },
    habits: { 
        getComponent: () => <MainStack initialRouteName="Habits" />, 
        icon: 'repeat', 
        title: 'Habits',
        initialRouteName: 'Habits'
    },
    settings: { 
        getComponent: () => <MainStack initialRouteName="Settings" />, 
        icon: 'settings', 
        title: 'Settings',
        initialRouteName: 'Settings'
    },
    dev: { 
        getComponent: () => <MainStack initialRouteName="Dev" />, 
        icon: 'code-slash', 
        title: 'Dev',
        initialRouteName: 'Dev'
    },
};