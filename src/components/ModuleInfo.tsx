import { ModuleType } from "@timothyw/pat-common";
import { Ionicons } from "@expo/vector-icons";
import AgendaStack from "@/src/navigation/AgendaStack";
import InboxStack from "@/src/navigation/InboxStack";
import ListsStack from "@/src/navigation/ListsStack";
import PeopleStack from "@/src/navigation/PeopleStack";
import HabitsStack from "@/src/navigation/HabitsStack";
import SettingsPanel from "@/src/app/(tabs)/settings";
import DevPanel from "@/src/app/(tabs)/dev";
import React from "react";

export const moduleInfo: Record<ModuleType, {
    getComponent: React.ComponentType;
    icon: keyof typeof Ionicons.glyphMap;
    title: string
}> = {
    agenda: { getComponent: AgendaStack, icon: 'calendar', title: 'Agenda' },
    inbox: { getComponent: InboxStack, icon: 'mail', title: 'Inbox' },
    lists: { getComponent: ListsStack, icon: 'list', title: 'Lists' },
    people: { getComponent: PeopleStack, icon: 'people', title: 'People' },
    habits: { getComponent: HabitsStack, icon: 'repeat', title: 'Habits' },
    settings: { getComponent: SettingsPanel, icon: 'settings', title: 'Settings' },
    dev: { getComponent: DevPanel, icon: 'code-slash', title: 'Dev' },
};