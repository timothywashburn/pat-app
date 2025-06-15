import { ModuleType } from "@timothyw/pat-common";
import { Ionicons } from "@expo/vector-icons";
import AgendaPanel from "@/src/app/(tabs)/agenda";
import InboxPanel from "@/src/app/(tabs)/inbox";
import TasksPanel from "@/src/app/(tabs)/tasks";
import PeoplePanel from "@/src/app/(tabs)/people";
import HabitsPanel from "@/src/app/(tabs)/habits";
import SettingsPanel from "@/src/app/(tabs)/settings";
import DevPanel from "@/src/app/(tabs)/dev";
import React from "react";

export const moduleInfo: Record<ModuleType, {
    getComponent: React.ComponentType;
    icon: keyof typeof Ionicons.glyphMap;
    title: string
}> = {
    agenda: { getComponent: AgendaPanel, icon: 'calendar', title: 'Agenda' },
    inbox: { getComponent: InboxPanel, icon: 'mail', title: 'Inbox' },
    tasks: { getComponent: TasksPanel, icon: 'list', title: 'Tasks' },
    people: { getComponent: PeoplePanel, icon: 'people', title: 'People' },
    habits: { getComponent: HabitsPanel, icon: 'repeat', title: 'Habits' },
    settings: { getComponent: SettingsPanel, icon: 'settings', title: 'Settings' },
    dev: { getComponent: DevPanel, icon: 'code-slash', title: 'Dev' },
};