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

export interface Settings {
    panels: PanelSetting[];
    categories: string[];
    types: string[];
    propertyKeys: string[];
}