// Define interfaces for our data models

// Person model
export interface PersonProperty {
    id: string;
    key: string;
    value: string;
}

export interface PersonNote {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Person {
    id: string;
    name: string;
    properties: PersonProperty[];
    notes: PersonNote[];
}

// Agenda model
export interface AgendaItem {
    id: string;
    name: string;
    date?: Date;
    notes?: string;
    urgent: boolean;
    completed: boolean;
    category?: string;
    type?: string;
}

// Thought model
export interface Thought {
    id: string;
    content: string;
    createdAt: Date;
}

// Task model
export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
}

// Panel settings
export enum PanelType {
    Agenda = 'Agenda',
    Inbox = 'Inbox',
    Tasks = 'Tasks',
    People = 'People',
    Settings = 'Settings'
}

export interface PanelSetting {
    id: string;
    panel: {
        type: PanelType;
        title: string;
        icon: string;
    };
    visible: boolean;
}

// Settings model
export interface Settings {
    panels: PanelSetting[];
    categories: string[];
    types: string[];
    propertyKeys: string[];
}